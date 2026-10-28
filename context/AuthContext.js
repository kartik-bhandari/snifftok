"use client";

/**
 * context/AuthContext.js
 * Unified auth context — all requests go to the Express API at NEXT_PUBLIC_API_URL.
 * Sends credentials: "include" so the httpOnly cookie is carried cross-origin.
 * Adds X-Requested-With: snifftok-web on every mutating request (CSRF sentinel).
 */

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

// Auth goes through the Next.js proxy route (same domain → first-party cookie)
const AUTH = "/api/auth";

const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:5173";

/** Shared headers for all requests */
const BASE_HEADERS = {
  "Content-Type": "application/json",
  "X-Requested-With": "snifftok-web",
};

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  /** Fetch current session from the API */
  const fetchMe = useCallback(async () => {
    try {
      const res  = await fetch(`${AUTH}/me`, {
        credentials: "include",
        headers: BASE_HEADERS,
      });
      if (!res.ok) {
        setUser(null);
        return null;
      }
      const data = await res.json();
      setUser(data.user ?? null);
      return data;
    } catch {
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  /**
   * Register a new customer account.
   * Role is ALWAYS customer — any role field is ignored by the API.
   */
  const register = async ({ name, email, password }) => {
    const res  = await fetch(`${AUTH}/register`, {
      method: "POST",
      credentials: "include",
      headers: BASE_HEADERS,
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Registration failed.");
    setUser(data.user);
    return data.user;
  };

  /**
   * Log in with email + password.
   * Returns:
   *   { user }                         — customer login complete
   *   { user, needs2faSetup: true }    — admin needs to set up 2FA first
   *   { requires2fa: true, pendingToken } — admin with 2FA enabled, step 2 needed
   */
  const login = async ({ email, password }) => {
    const res  = await fetch(`${AUTH}/login`, {
      method: "POST",
      credentials: "include",
      headers: BASE_HEADERS,
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed.");

    if (data.user) setUser(data.user);
    return data;
  };

  /**
   * Complete the 2FA verification step.
   * Path A (two-step login): pass code + pendingToken
   * Path B (setup completion): pass code only (session cookie already set)
   */
  const verify2fa = async ({ code, pendingToken }) => {
    const body = pendingToken ? { code, pendingToken } : { code };
    const res  = await fetch(`${AUTH}/2fa/verify`, {
      method: "POST",
      credentials: "include",
      headers: BASE_HEADERS,
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Verification failed.");
    if (data.user) setUser(data.user);
    return data;
  };

  /** Initiate 2FA setup — returns { qrCodeUrl, recoveryCodes, secret } */
  const setup2fa = async () => {
    const res  = await fetch(`${AUTH}/2fa/setup`, {
      method: "POST",
      credentials: "include",
      headers: BASE_HEADERS,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Setup failed.");
    return data;
  };

  /**
   * Step 1 of OTP login — request a 6-digit code to be emailed.
   * Returns { ok, useAdminPanel? } — useAdminPanel means the email is a
   * staff/admin account: no code was sent, they must use the admin panel.
   */
  const sendOtp = async ({ email }) => {
    const res  = await fetch(`${AUTH}/otp/send`, {
      method: "POST",
      credentials: "include",
      headers: BASE_HEADERS,
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to send code.");
    return data;
  };

  /**
   * Step 2 of OTP login — submit the code.
   * `name` is only required when creating a brand-new account.
   * Returns { user, isNew }
   */
  const verifyOtp = async ({ email, code, name }) => {
    const res  = await fetch(`${AUTH}/otp/verify`, {
      method: "POST",
      credentials: "include",
      headers: BASE_HEADERS,
      body: JSON.stringify({ email, code, name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Verification failed.");
    if (data.user) setUser(data.user);
    return data;
  };

  const logout = async () => {
    try {
      await fetch(`${AUTH}/logout`, {
        method: "POST",
        credentials: "include",
        headers: BASE_HEADERS,
      });
    } finally {
      setUser(null);
      window.location.href = "/";
    }
  };

  /**
   * After a successful login, handle redirect based on role.
   * Admin/Staff → admin panel (hard navigate — different origin)
   * Customer    → /account or returnTo path (same-origin only, no open redirect)
   */
  /** Hard redirect to admin panel — cannot use Next.js router (different origin) */
  const redirectToAdmin = () => window.location.assign(ADMIN_URL);

  const handlePostLogin = (user, returnTo) => {
    if (user.role === "admin" || user.role === "staff") {
      redirectToAdmin();
      return;
    }
    // Customers stay on the storefront
    const safePath = (returnTo && returnTo.startsWith("/") && !returnTo.startsWith("/account")) ? returnTo : "/profile";
    window.location.href = safePath;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        register,
        login,
        verify2fa,
        setup2fa,
        sendOtp,
        verifyOtp,
        logout,
        handlePostLogin,
        redirectToAdmin,
        refetch: fetchMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
