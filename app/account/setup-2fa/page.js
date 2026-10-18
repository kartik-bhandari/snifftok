"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ArrowRight, AlertCircle, Copy, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

/** 2FA Setup page — shown to admins who have not yet enabled 2FA */
export default function Setup2faPage() {
  const router = useRouter();
  const { setup2fa, verify2fa } = useAuth();

  const [step, setStep]         = useState("start");  // "start" | "scan" | "verify" | "done"
  const [data, setData]         = useState(null);     // { qrCodeUrl, recoveryCodes, secret }
  const [code, setCode]         = useState("");
  const [error, setError]       = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied]     = useState(false);

  const handleSetup = async () => {
    setIsLoading(true);
    setError("");
    try {
      const result = await setup2fa();
      setData(result);
      setStep("scan");
    } catch (err) {
      setError(err.message || "Setup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await verify2fa({ code: code.trim() });
      setStep("done");
    } catch (err) {
      setError(err.message || "Invalid code. Try again.");
      setCode("");
    } finally {
      setIsLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(data?.secret ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#EFEFEF] flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="font-wordmark text-[#0A0A0A] text-3xl tracking-widest">snifftok</span>
          <p className="text-[#8A8A8A] text-xs mt-1.5">Two-factor authentication setup</p>
        </div>

        <AnimatePresence mode="wait">
          {step === "start" && (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-3xl border border-[#E8E8E8] shadow-sm p-6 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0A0A0A] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Secure your account</p>
                  <p className="text-xs text-[#8A8A8A]">Admin accounts require 2FA</p>
                </div>
              </div>
              <p className="text-xs text-[#5A5A5A] leading-relaxed">
                You need an authenticator app like <strong>Google Authenticator</strong> or <strong>Authy</strong>. Scan the QR code it generates to link your account.
              </p>
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-xs px-3 py-2 rounded-xl">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {error}
                </div>
              )}
              <button
                onClick={handleSetup}
                disabled={isLoading}
                className="w-full bg-[#0A0A0A] text-white text-sm font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#222] transition-all disabled:opacity-50"
              >
                {isLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Get started <ArrowRight className="w-4 h-4" /></>}
              </button>
            </motion.div>
          )}

          {step === "scan" && data && (
            <motion.div
              key="scan"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {/* QR Code */}
              <div className="bg-white rounded-3xl border border-[#E8E8E8] shadow-sm p-6 space-y-4">
                <p className="text-sm font-semibold">1. Scan this QR code</p>
                <div className="flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={data.qrCodeUrl} alt="2FA QR code" className="w-44 h-44 rounded-xl border border-[#E8E8E8]" />
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-[10px] bg-[#F5F5F5] rounded-lg px-2.5 py-2 font-mono break-all text-[#5A5A5A]">{data.secret}</code>
                  <button onClick={copySecret} className="p-2 rounded-lg hover:bg-[#F0F0F0] transition-colors shrink-0" aria-label="Copy secret">
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-[#8A8A8A]" />}
                  </button>
                </div>
                <p className="text-[10px] text-[#8A8A8A]">Can&apos;t scan? Enter the code above manually in your authenticator app.</p>
              </div>

              {/* Recovery codes */}
              <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 space-y-2">
                <p className="text-xs font-semibold text-amber-800">2. Save your recovery codes</p>
                <p className="text-[10px] text-amber-700 leading-relaxed">These codes let you sign in if you lose your phone. Each code can only be used once. Store them somewhere safe.</p>
                <div className="grid grid-cols-2 gap-1 mt-2">
                  {data.recoveryCodes.map((c) => (
                    <code key={c} className="text-[11px] font-mono bg-white/70 rounded-lg px-2 py-1 text-amber-900 text-center">{c}</code>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setStep("verify")}
                className="w-full bg-[#0A0A0A] text-white text-sm font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#222] transition-all"
              >
                I&apos;ve saved my codes <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {step === "verify" && (
            <motion.div
              key="verify"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-3xl border border-[#E8E8E8] shadow-sm p-6 space-y-4"
            >
              <p className="text-sm font-semibold">3. Enter the code from your app</p>
              <form onSubmit={handleVerify} className="space-y-3">
                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-xs px-3 py-2 rounded-xl">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {error}
                  </div>
                )}
                <input
                  id="setup-totp-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3 text-center text-xl tracking-[0.4em] font-mono text-[#0A0A0A] placeholder:text-[#ABABAB] outline-none focus:ring-2 focus:ring-[#0A0A0A]/10 transition"
                />
                <button
                  id="setup-verify-btn"
                  type="submit"
                  disabled={isLoading || code.length < 6}
                  className="w-full bg-[#0A0A0A] text-white text-sm font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#222] transition-all disabled:opacity-50"
                >
                  {isLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Verify & activate <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            </motion.div>
          )}

          {step === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl border border-[#E8E8E8] shadow-sm p-8 text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-[#0A0A0A]">2FA enabled!</p>
                <p className="text-xs text-[#8A8A8A] mt-1">Your account is now secured.</p>
              </div>
              <button
                onClick={() => router.push("/profile")}
                className="w-full bg-[#0A0A0A] text-white text-sm font-semibold py-3 rounded-xl hover:bg-[#222] transition-all"
              >
                Go to dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
