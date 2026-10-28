"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight, AlertCircle, ChevronLeft, User, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// ─── Shared slide animation ───────────────────────────────────────────────────
const slide = {
  initial: { opacity: 0, x: 28 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: -28 },
  transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
};

// ─── Step 1: Email input ──────────────────────────────────────────────────────
function StepEmail({ onNext }) {
  const { sendOtp, redirectToAdmin } = useAuth();
  const [email, setEmail]     = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [toAdmin, setToAdmin] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError("Enter your email address."); return; }
    setError("");
    setLoading(true);
    try {
      const result = await sendOtp({ email: email.trim().toLowerCase() });
      if (result.useAdminPanel) {
        // Staff/admin account — no code was sent; brief notice, then admin login
        setToAdmin(true);
        setTimeout(redirectToAdmin, 1500);
        return;
      }
      onNext(email.trim().toLowerCase());
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div key="email" {...slide} className="w-full max-w-sm">
      <div className="text-center mb-8">
        <span className="font-wordmark text-[#0A0A0A] text-3xl tracking-widest">snifftok</span>
        <p className="text-[#8A8A8A] text-xs mt-1.5">Sign in or create your account</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-[#E8E8E8] p-6">
        <p className="text-sm font-semibold text-[#0A0A0A] mb-1">Enter your email</p>
        <p className="text-xs text-[#8A8A8A] mb-5">We&apos;ll send a 6-digit code to sign you in.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-xs px-3 py-2.5 rounded-xl"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}
            </motion.div>
          )}

          {toAdmin && (
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 bg-[#F5F5F5] border border-[#E8E8E8] text-[#0A0A0A] text-xs px-3 py-2.5 rounded-xl"
            >
              <span className="w-3.5 h-3.5 shrink-0 border-2 border-[#0A0A0A]/20 border-t-[#0A0A0A] rounded-full animate-spin" />
              This is a staff account. Taking you to the admin login…
            </motion.div>
          )}

          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A8A] pointer-events-none" />
            <input
              id="otp-email"
              type="email"
              autoComplete="email"
              autoFocus
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full bg-[#F5F5F5] rounded-xl pl-10 pr-4 py-3 text-sm text-[#0A0A0A] placeholder:text-[#ABABAB] outline-none focus:ring-2 focus:ring-[#0A0A0A]/10 transition"
            />
          </div>

          <button
            id="send-otp-btn"
            type="submit"
            disabled={loading || toAdmin}
            className="w-full bg-[#0A0A0A] text-white text-sm font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#222] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading || toAdmin
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><span>Send code</span><ArrowRight className="w-4 h-4" /></>
            }
          </button>
        </form>
      </div>
    </motion.div>
  );
}

// ─── Step 2: OTP code entry ───────────────────────────────────────────────────
function StepOtp({ email, onNext, onBack }) {
  const { sendOtp, verifyOtp } = useAuth();
  const [code, setCode]       = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30); // seconds
  const inputRef = useRef(null);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [resendCooldown]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const clean = code.replace(/\s/g, "");
    if (clean.length !== 6) { setError("Enter the 6-digit code from your email."); return; }
    setError("");
    setLoading(true);
    try {
      const result = await verifyOtp({ email, code: clean });
      onNext(result);
    } catch (err) {
      // API returns needsName: true when the email is new and name wasn't provided
      if (err.message?.includes("Name is required")) {
        onNext({ needsName: true, email, code: clean });
        return;
      }
      setError(err.message || "Invalid code. Try again.");
      setCode("");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    setError("");
    try {
      await sendOtp({ email });
      setResendCooldown(30);
      setCode("");
    } catch {
      setError("Couldn't resend. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <motion.div key="otp" {...slide} className="w-full max-w-sm">
      <div className="text-center mb-8">
        <span className="font-wordmark text-[#0A0A0A] text-3xl tracking-widest">snifftok</span>
        <p className="text-[#8A8A8A] text-xs mt-1.5">Check your inbox</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-[#E8E8E8] p-6">
        <p className="text-sm font-semibold text-[#0A0A0A] mb-1">Enter your code</p>
        <p className="text-xs text-[#8A8A8A] mb-5">
          Sent to <span className="font-medium text-[#0A0A0A]">{email}</span>. Expires in 10 minutes.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-xs px-3 py-2.5 rounded-xl"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}
            </motion.div>
          )}

          <input
            ref={inputRef}
            id="otp-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3.5 text-center text-2xl tracking-[0.5em] font-mono text-[#0A0A0A] placeholder:text-[#DADADA] placeholder:tracking-widest outline-none focus:ring-2 focus:ring-[#0A0A0A]/10 transition"
          />

          <button
            id="verify-otp-btn"
            type="submit"
            disabled={loading || code.length < 6}
            className="w-full bg-[#0A0A0A] text-white text-sm font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#222] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><span>Verify</span><ArrowRight className="w-4 h-4" /></>
            }
          </button>
        </form>
      </div>

      {/* Resend + back */}
      <div className="flex items-center justify-between mt-4 px-1">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs text-[#8A8A8A] hover:text-[#0A0A0A] transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Change email
        </button>

        <button
          onClick={handleResend}
          disabled={resendCooldown > 0 || resending}
          className="flex items-center gap-1 text-xs text-[#8A8A8A] hover:text-[#0A0A0A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-3 h-3 ${resending ? "animate-spin" : ""}`} />
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Step 3: Name collection (new users only) ─────────────────────────────────
function StepName({ email, code, onSuccess }) {
  const { verifyOtp } = useAuth();
  const [name, setName]       = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError("Please enter your name."); return; }
    setError("");
    setLoading(true);
    try {
      const result = await verifyOtp({ email, code, name: name.trim() });
      onSuccess(result.user);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div key="name" {...slide} className="w-full max-w-sm">
      <div className="text-center mb-8">
        <span className="font-wordmark text-[#0A0A0A] text-3xl tracking-widest">snifftok</span>
        <p className="text-[#8A8A8A] text-xs mt-1.5">Almost there!</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-[#E8E8E8] p-6">
        <p className="text-sm font-semibold text-[#0A0A0A] mb-1">What&apos;s your name?</p>
        <p className="text-xs text-[#8A8A8A] mb-5">We&apos;re creating your account for <span className="font-medium text-[#0A0A0A]">{email}</span>.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-xs px-3 py-2.5 rounded-xl"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}
            </motion.div>
          )}

          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A8A] pointer-events-none" />
            <input
              id="account-name"
              type="text"
              autoComplete="name"
              autoFocus
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full bg-[#F5F5F5] rounded-xl pl-10 pr-4 py-3 text-sm text-[#0A0A0A] placeholder:text-[#ABABAB] outline-none focus:ring-2 focus:ring-[#0A0A0A]/10 transition"
            />
          </div>

          <button
            id="create-account-btn"
            type="submit"
            disabled={loading}
            className="w-full bg-[#0A0A0A] text-white text-sm font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#222] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><span>Create account</span><ArrowRight className="w-4 h-4" /></>
            }
          </button>
        </form>
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
function LoginContent() {
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading, handlePostLogin } = useAuth();
  const returnTo = searchParams.get("from");

  // step: "email" | "otp" | "name"
  const [step, setStep]   = useState("email");
  const [email, setEmail] = useState("");
  const [code, setCode]   = useState("");   // saved so we can retry with name

  // Already logged in — redirect
  useEffect(() => {
    if (!authLoading && user) handlePostLogin(user, returnTo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  const handleOtpResult = (result) => {
    if (result.needsName) {
      // New user, name required
      setCode(result.code);
      setStep("name");
      return;
    }
    // Existing user — logged in
    handlePostLogin(result.user, returnTo);
  };

  if (authLoading) return null;

  return (
    <main className="min-h-screen bg-[#EFEFEF] flex flex-col items-center justify-center px-4 pt-20 pb-40 md:pb-8">
      <AnimatePresence mode="wait">
        {step === "email" && (
          <StepEmail
            key="email"
            onNext={(e) => { setEmail(e); setStep("otp"); }}
          />
        )}
        {step === "otp" && (
          <StepOtp
            key="otp"
            email={email}
            onNext={handleOtpResult}
            onBack={() => setStep("email")}
          />
        )}
        {step === "name" && (
          <StepName
            key="name"
            email={email}
            code={code}
            onSuccess={(u) => handlePostLogin(u, returnTo)}
          />
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
