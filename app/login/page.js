"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// ─── 2FA Code Input ──────────────────────────────────────────────────────────

function TwoFactorStep({ pendingToken, onSuccess, onBack }) {
  const { verify2fa } = useAuth();
  const [code, setCode]       = useState("");
  const [error, setError]     = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.replace(/[-\s]/g, "").length < 6) {
      setError("Enter your 6-digit authenticator code.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const result = await verify2fa({ code: code.trim(), pendingToken });
      onSuccess(result.user);
    } catch (err) {
      setError(err.message || "Invalid code. Try again.");
      setCode("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      key="2fa"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      className="w-full max-w-sm"
    >
      <div className="text-center mb-8">
        <span className="font-wordmark text-[#0A0A0A] text-3xl tracking-widest">snifftok</span>
        <p className="text-[#8A8A8A] text-xs mt-1.5">Two-factor authentication</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-[#E8E8E8] p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-[#0A0A0A] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#0A0A0A]">Authentication required</p>
            <p className="text-xs text-[#8A8A8A]">Enter the code from your authenticator app</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-xs px-3 py-2.5 rounded-xl"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {error}
            </motion.div>
          )}

          <input
            id="totp-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            maxLength={12}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^0-9A-Za-z\- ]/g, ""))}
            placeholder="000000"
            className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3 text-center text-xl tracking-[0.4em] font-mono text-[#0A0A0A] placeholder:text-[#ABABAB] placeholder:tracking-widest outline-none focus:ring-2 focus:ring-[#0A0A0A]/10 transition"
          />

          <button
            id="totp-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#0A0A0A] text-white text-sm font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#222] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Verify <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>
      </div>

      <button
        onClick={onBack}
        className="w-full text-center text-xs text-[#8A8A8A] mt-4 hover:text-[#0A0A0A] transition-colors"
      >
        ← Back to sign in
      </button>
    </motion.div>
  );
}

// ─── Main Login Page ──────────────────────────────────────────────────────────

function LoginContent() {
  const searchParams = useSearchParams();
  const { login, handlePostLogin, user, isLoading: authLoading } = useAuth();
  const [form, setForm]         = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]       = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // 2FA state
  const [pendingToken, setPendingToken] = useState(null);

  const returnTo = searchParams.get("from");

  // If already logged in, redirect
  useEffect(() => {
    if (!authLoading && user) {
      handlePostLogin(user, returnTo);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const result = await login({ email: form.email, password: form.password });

      if (result.requires2fa) {
        // Admin with 2FA — show code input
        setPendingToken(result.pendingToken);
        return;
      }

      if (result.needs2faSetup) {
        // Admin without 2FA — go to setup page
        window.location.href = "/account/setup-2fa";
        return;
      }

      // Normal login complete
      handlePostLogin(result.user, returnTo);
    } catch (err) {
      setError(err.message || "Sign in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle completed 2FA verification
  const handle2faSuccess = (user) => {
    handlePostLogin(user, returnTo);
  };

  if (authLoading) return null;

  return (
    <main className="min-h-screen bg-[#EFEFEF] flex flex-col items-center justify-center px-4 pt-20 pb-40 md:pb-8">
      <AnimatePresence mode="wait">
        {pendingToken ? (
          <TwoFactorStep
            key="2fa"
            pendingToken={pendingToken}
            onSuccess={handle2faSuccess}
            onBack={() => setPendingToken(null)}
          />
        ) : (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45 }}
            className="w-full max-w-sm"
          >
            {/* Wordmark */}
            <div className="text-center mb-8">
              <span className="font-wordmark text-[#0A0A0A] text-3xl tracking-widest">snifftok</span>
              <p className="text-[#8A8A8A] text-xs mt-1.5">Sign in to your account</p>
            </div>

            {/* Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-[#E8E8E8] p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-xs px-3 py-2.5 rounded-xl"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {error}
                  </motion.div>
                )}

                {/* Email */}
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A8A] pointer-events-none" />
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Email address"
                    className="w-full bg-[#F5F5F5] rounded-xl pl-10 pr-4 py-3 text-sm text-[#0A0A0A] placeholder:text-[#ABABAB] outline-none focus:ring-2 focus:ring-[#0A0A0A]/10 transition"
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A8A] pointer-events-none" />
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Password"
                    className="w-full bg-[#F5F5F5] rounded-xl pl-10 pr-11 py-3 text-sm text-[#0A0A0A] placeholder:text-[#ABABAB] outline-none focus:ring-2 focus:ring-[#0A0A0A]/10 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#ABABAB] hover:text-[#0A0A0A] transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Submit */}
                <button
                  id="login-submit-btn"
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#0A0A0A] text-white text-sm font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#222] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {isLoading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Sign in <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>
            </div>

            {/* Footer links */}
            <p className="text-center text-xs text-[#8A8A8A] mt-5">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-[#0A0A0A] font-semibold underline underline-offset-2 hover:opacity-70 transition-opacity">
                Create one
              </Link>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
