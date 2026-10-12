"use client";

import React from "react";
import { X, Sparkles, Clock, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/context/StoreContext";

export default function FragranceGuideModal() {
  const { isFragranceGuideOpen, setIsFragranceGuideOpen } = useStore();

  if (!isFragranceGuideOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsFragranceGuideOpen(false)}
          className="fixed inset-0 bg-black/45 backdrop-blur-xs"
        />

        {/* Modal Window: Rounded card with clean overflow containment */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-[440px] sm:max-w-[540px] bg-white rounded-[24px] sm:rounded-[32px] shadow-2xl z-10 select-none max-h-[85vh] flex flex-col overflow-hidden"
        >
          {/* Fixed Header */}
          <div className="flex items-center justify-between px-6 sm:px-8 pt-6 pb-4 border-b border-[#F0F0F0] shrink-0">
            <div>
              <span className="text-[11px] font-semibold text-[#8A8A8A] uppercase tracking-wider">
                Expert Olfactive Guide
              </span>
              <h3 className="text-[18px] sm:text-[22px] font-bold text-[#0A0A0A]">
                Fragrance Guide
              </h3>
            </div>
            <button
              onClick={() => setIsFragranceGuideOpen(false)}
              className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#0A0A0A] active:scale-90 transition-transform hover:bg-[#EAEAEA]"
              aria-label="Close guide"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Content Body with Hidden Scrollbar (no-scrollbar utility) */}
          <div className="flex-1 overflow-y-auto no-scrollbar px-6 sm:px-8 py-5 space-y-4 sm:space-y-5 text-[13px] sm:text-[13.5px] text-[#0A0A0A]">
            {/* Pyramid Notes */}
            <div className="bg-[#FAF9F8] p-4 sm:p-5 rounded-[18px] space-y-2 border border-[#F0EFEB]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0A0A0A]" />
                <h4 className="font-bold text-[14px] sm:text-[15px]">The Olfactory Pyramid</h4>
              </div>
              <ul className="space-y-2 text-[12.5px] sm:text-[13px] text-[#4A4A4A] pl-1">
                <li>
                  <strong className="text-[#0A0A0A]">Top Notes:</strong> The immediate burst upon spraying (e.g. Cardamom, Bergamot). Evaporates smoothly within 15–30 minutes.
                </li>
                <li>
                  <strong className="text-[#0A0A0A]">Heart / Middle Notes:</strong> The signature soul of the fragrance (e.g. Iris, Damascus Rose, Matcha). Unfolds between 1 and 4 hours.
                </li>
                <li>
                  <strong className="text-[#0A0A0A]">Base Notes:</strong> Heavy resins, noble woods, and extracts (e.g. Sandalwood, Cambodi Oud, Amber). Sustains on skin for 8–16+ hours.
                </li>
              </ul>
            </div>

            {/* Concentration & Longevity */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#0A0A0A]" />
                <h4 className="font-bold text-[14px] sm:text-[15px]">Concentration & Wear Time</h4>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-[#E5E5E5] p-3.5 rounded-[16px] bg-[#FAFAFA]">
                  <span className="block font-bold text-[13.5px]">Extrait de Parfum</span>
                  <span className="text-[11px] text-[#8A8A8A] block mt-0.5">30%–35% Oil</span>
                  <span className="text-[12px] text-emerald-600 font-medium block mt-1.5">12–16+ Hours</span>
                </div>
                <div className="border border-[#E5E5E5] p-3.5 rounded-[16px] bg-[#FAFAFA]">
                  <span className="block font-bold text-[13.5px]">Eau de Parfum</span>
                  <span className="text-[11px] text-[#8A8A8A] block mt-0.5">20%–25% Oil</span>
                  <span className="text-[12px] text-emerald-600 font-medium block mt-1.5">8–10 Hours</span>
                </div>
              </div>
            </div>

            {/* How to Test */}
            <div className="border-t border-[#F0F0F0] pt-4">
              <div className="flex items-center gap-2 mb-1.5">
                <ShieldCheck className="w-4 h-4 text-[#0A0A0A]" />
                <h4 className="font-bold text-[14px] sm:text-[15px]">Sampling Tips</h4>
              </div>
              <p className="text-[12.5px] sm:text-[13px] text-[#707070] leading-relaxed">
                Allow the perfume to dry down naturally on your pulse points (wrists and collarbone) without rubbing. Fragrance molecules react uniquely with your skin&apos;s natural pH over 60 minutes.
              </p>
            </div>
          </div>

          {/* Fixed Footer CTA */}
          <div className="px-6 sm:px-8 pb-6 pt-3 border-t border-[#F0F0F0] shrink-0 bg-white">
            <button
              onClick={() => setIsFragranceGuideOpen(false)}
              className="w-full py-3.5 rounded-full bg-[#0A0A0A] text-white font-medium text-[13px] sm:text-[14px] hover:bg-black/90 active:scale-98 transition-all shadow-xs"
            >
              Got It
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
