"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

const GOOGLE_SCRIPT_ID = "google-identity-services";
const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: Record<string, string | number | boolean>
          ) => void;
        };
      };
    };
  }
}

type GoogleAuthButtonProps = {
  mode: "signin" | "signup";
  redirect: string;
  onError?: (message: string) => void;
};

export default function GoogleAuthButton({ mode, redirect, onError }: GoogleAuthButtonProps) {
  const router = useRouter();
  const { loginWithGoogle } = useAuth();
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const [isScriptReady, setIsScriptReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) {
      return;
    }

    if (window.google?.accounts?.id) {
      setIsScriptReady(true);
      return;
    }

    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID) as HTMLScriptElement | null;

    const handleLoad = () => setIsScriptReady(true);
    const handleError = () => onError?.("Google sign-in could not load. Please try email login for now.");

    if (existingScript) {
      existingScript.addEventListener("load", handleLoad);
      existingScript.addEventListener("error", handleError);

      return () => {
        existingScript.removeEventListener("load", handleLoad);
        existingScript.removeEventListener("error", handleError);
      };
    }

    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);
    document.head.appendChild(script);

    return () => {
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
    };
  }, [clientId, onError]);

  useEffect(() => {
    if (!clientId || !isScriptReady || !buttonRef.current || !window.google?.accounts?.id) {
      return;
    }

    const handleCredential = async (response: { credential?: string }) => {
      if (!response.credential) {
        onError?.("Google sign-in was cancelled. Please try again.");
        return;
      }

      setIsSubmitting(true);

      try {
        await loginWithGoogle(response.credential);
        router.push(redirect);
      } catch (error) {
        onError?.(error instanceof Error ? error.message : "Google sign-in failed. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    };

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredential,
    });

    const renderedWidth = Math.min(
      buttonRef.current.parentElement?.clientWidth || buttonRef.current.offsetWidth || 320,
      400
    );

    buttonRef.current.innerHTML = "";
    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: "outline",
      size: "large",
      shape: "pill",
      text: mode === "signup" ? "signup_with" : "signin_with",
      width: renderedWidth,
    });
  }, [clientId, isScriptReady, loginWithGoogle, mode, onError, redirect, router]);

  if (!clientId) {
    return (
      <div className="mb-5">
        <button
          type="button"
          disabled
          className="w-full flex items-center justify-center gap-3 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-400 bg-slate-50 cursor-not-allowed"
          title="Google sign-in is not configured yet"
        >
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>
      </div>
    );
  }

  return (
    <div className="mb-5">
      <div className="min-h-[44px] w-full overflow-hidden rounded-2xl" ref={buttonRef} />
      {isSubmitting ? (
        <p className="mt-2 text-center text-xs font-medium text-slate-400">
          Signing you in with Google...
        </p>
      ) : null}
    </div>
  );
}
