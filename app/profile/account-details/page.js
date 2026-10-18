"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, User, Mail, Hash, Copy, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

function DetailRow({ icon: Icon, label, value, copyable }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 px-5 py-4 bg-white rounded-2xl border border-[#EBEBEB] shadow-xs"
    >
      <div className="w-9 h-9 rounded-xl bg-[#F0F0F0] flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-[#5A5A5A]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-[#8A8A8A] uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-sm font-medium text-[#0A0A0A] truncate">{value}</p>
      </div>
      {copyable && (
        <button
          onClick={handleCopy}
          className="p-2 rounded-lg hover:bg-[#F0F0F0] transition-colors shrink-0"
          aria-label={`Copy ${label}`}
        >
          {copied
            ? <Check className="w-4 h-4 text-emerald-500" />
            : <Copy className="w-4 h-4 text-[#ABABAB]" />
          }
        </button>
      )}
    </motion.div>
  );
}

export default function AccountDetailsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#EFEFEF] flex items-center justify-center pt-20">
        <span className="w-6 h-6 border-2 border-[#0A0A0A]/20 border-t-[#0A0A0A] rounded-full animate-spin" />
      </main>
    );
  }

  if (!user) return null;

  return (
    <>
      <title>Account Details — snifftok</title>
      <main className="min-h-screen bg-[#EFEFEF] pb-40 md:pb-12 pt-20 md:pt-24">
        <div className="max-w-lg mx-auto px-4">

          {/* Back button */}
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 text-sm text-[#8A8A8A] hover:text-[#0A0A0A] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to profile
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="font-wordmark text-[#0A0A0A] text-2xl md:text-3xl tracking-wide">
              Account Details
            </h1>
            <p className="text-xs text-[#8A8A8A] mt-1">Your personal information</p>
          </motion.div>

          {/* Detail cards */}
          <div className="space-y-3">
            <DetailRow
              icon={User}
              label="Full Name"
              value={user.name}
              copyable
            />
            <DetailRow
              icon={Mail}
              label="Email Address"
              value={user.email}
              copyable
            />
            <DetailRow
              icon={Hash}
              label="Account Number"
              value={user.id}
              copyable
            />
          </div>

          {/* Note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-[11px] text-[#ABABAB] text-center mt-8 px-4"
          >
            To update your name or email, contact us on WhatsApp.
          </motion.p>

        </div>
      </main>
    </>
  );
}
