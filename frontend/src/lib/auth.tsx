"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { login as apiLogin, loginWithGoogle as apiLoginWithGoogle, register as apiRegister, getMe, refreshToken as apiRefresh } from "./api";
import type { UserProfile, RegisterPayload } from "./api";

const AUTH_TOKENS_UPDATED_EVENT = "auth:tokens-updated";
const AUTH_TOKENS_CLEARED_EVENT = "auth:tokens-cleared";

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<{ message: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function readInitialAccessToken() {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = localStorage.getItem("auth_tokens");
  if (!stored) {
    return null;
  }

  try {
    const parsed = JSON.parse(stored) as { access?: string };
    return parsed.access || null;
  } catch {
    localStorage.removeItem("auth_tokens");
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const accessToken = readInitialAccessToken();

    return {
      user: null,
      token: accessToken,
      loading: Boolean(accessToken),
    };
  });

  const setAuth = (user: UserProfile | null, token: string | null) => {
    setState({ user, token, loading: false });
  };

  // Initialize from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("auth_tokens");
    if (!stored) {
      return;
    }

    try {
      const tokens = JSON.parse(stored);
      if (!tokens.access) {
        localStorage.removeItem("auth_tokens");
        return;
      }

      getMe(tokens.access, "user")
        .then((user) => setAuth(user, tokens.access))
        .catch(async () => {
          // Try refresh
          if (tokens.refresh) {
            try {
              const res = await apiRefresh(tokens.refresh);
              const newTokens = { access: res.access, refresh: res.refresh || tokens.refresh };
              localStorage.setItem("auth_tokens", JSON.stringify(newTokens));
              const user = await getMe(res.access, "user");
              setAuth(user, res.access);
            } catch {
              localStorage.removeItem("auth_tokens");
              setState({ user: null, token: null, loading: false });
            }
          } else {
            localStorage.removeItem("auth_tokens");
            setState({ user: null, token: null, loading: false });
          }
        });
    } catch {
      localStorage.removeItem("auth_tokens");
    }
  }, []);

  useEffect(() => {
    const handleTokensUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ scope?: string; access?: string | null }>).detail;
      if (detail?.scope !== "user") {
        return;
      }

      setState((prev) => ({
        ...prev,
        token: detail.access || null,
        loading: false,
      }));
    };

    const handleTokensCleared = (event: Event) => {
      const detail = (event as CustomEvent<{ scope?: string }>).detail;
      if (detail?.scope !== "user") {
        return;
      }

      setState({ user: null, token: null, loading: false });
    };

    window.addEventListener(AUTH_TOKENS_UPDATED_EVENT, handleTokensUpdated as EventListener);
    window.addEventListener(AUTH_TOKENS_CLEARED_EVENT, handleTokensCleared as EventListener);

    return () => {
      window.removeEventListener(AUTH_TOKENS_UPDATED_EVENT, handleTokensUpdated as EventListener);
      window.removeEventListener(AUTH_TOKENS_CLEARED_EVENT, handleTokensCleared as EventListener);
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const tokens = await apiLogin(email, password);
    localStorage.setItem("auth_tokens", JSON.stringify(tokens));
    const user = await getMe(tokens.access, "user");
    setAuth(user, tokens.access);
  }, []);

  const loginWithGoogle = useCallback(async (credential: string) => {
    const result = await apiLoginWithGoogle(credential);
    localStorage.setItem(
      "auth_tokens",
      JSON.stringify({ access: result.access, refresh: result.refresh })
    );
    setAuth(result.user, result.access);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    // Registration now returns a message (user must verify email first)
    const result = await apiRegister(payload);
    return result;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("auth_tokens");
    setState({ user: null, token: null, loading: false });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        loginWithGoogle,
        register,
        logout,
        isAuthenticated: !!state.user && !!state.token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
