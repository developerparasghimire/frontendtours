"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, getMe } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function isRateLimitError(message: string) {
    return /429|too many|throttl|rate limit/i.test(message);
  }

  function getLoginErrorMessage(message: string) {
    if (isRateLimitError(message)) {
      return "Too many login attempts. Please wait a little while and try again.";
    }
    if (/inactive|contact support/i.test(message)) {
      return "This admin account is inactive. Please contact support.";
    }
    return "Invalid email or password.";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const tokens = await login(email, password);
      const user = await getMe(tokens.access, "admin");

      if (!["SUPER_ADMIN", "ADMIN", "STAFF"].includes(user.role)) {
        setError("You do not have admin access.");
        setLoading(false);
        return;
      }

      localStorage.setItem("admin_token", tokens.access);
      localStorage.setItem("admin_refresh", tokens.refresh);
      router.replace("/gettoursadmin");
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      setError(getLoginErrorMessage(message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-brand-navy text-center mb-2">GetTours Admin</h1>
        <p className="text-gray-500 text-center text-sm mb-8">Sign in to your admin account</p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-navy focus:border-transparent outline-none"
              placeholder=""
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-navy focus:border-transparent outline-none"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-navy text-white font-semibold rounded-lg hover:bg-brand-blue transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
