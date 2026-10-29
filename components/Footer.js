"use client";

import React, { useState } from "react";
import Link from "next/link";
import { whatsappUrl } from "@/lib/whatsapp";
import { MessageCircle, ArrowRight, Check } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer id="store-footer" className="mt-24 sm:mt-28 md:mt-20 pt-12 sm:pt-16 pb-44 md:pb-16 px-4 sm:px-6 lg:px-8 border-t border-[#DFDFDF] select-none scroll-mt-[72px] sm:scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        {/* Top 4-Column Grid on Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#E2E2E2]">
          {/* Brand Info & Newsletter (2 cols on lg) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <span className="font-wordmark text-[26px] sm:text-[30px] text-[#0A0A0A] tracking-tight">
              snifftok
            </span>
            <p className="text-[13px] text-[#8A8A8A] max-w-[340px] leading-relaxed">
              Haute perfumery reimagined for modern noses. Limited-run artisanal extraits formulated in Grasse & Dubai with high perfume oil concentrations.
            </p>

            {/* Newsletter Subscription */}
            <div className="mt-2 max-w-[340px]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0A0A0A] block mb-2">
                Join the Private Circle
              </span>
              {subscribed ? (
                <div className="flex items-center gap-2 text-emerald-600 text-[13px] font-medium py-2">
                  <Check className="w-4 h-4" />
                  <span>Welcome. Exclusive drop invitations will be sent.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex items-center relative">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white rounded-full pl-4 pr-12 py-2.5 text-[13px] text-[#0A0A0A] placeholder-[#8A8A8A] border border-[#D5D5D5] focus:outline-none focus:border-[#0A0A0A]"
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe"
                    className="absolute right-1 w-8 h-8 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4 stroke-[2]" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Links Column 1: Explore */}
          <div className="flex flex-col gap-3 text-[13.5px]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0A0A0A]">
              Explore
            </span>
            <Link href="/#new-arrivals" className="text-[#8A8A8A] hover:text-[#0A0A0A] transition-colors">
              New Arrivals
            </Link>
            <Link href="/#best-sellers" className="text-[#8A8A8A] hover:text-[#0A0A0A] transition-colors">
              Best Sellers
            </Link>
            <Link href="/#testers" className="text-[#8A8A8A] hover:text-[#0A0A0A] transition-colors">
              Tester Discovery
            </Link>
            <Link href="/wishlist" className="text-[#8A8A8A] hover:text-[#0A0A0A] transition-colors">
              Curated Wardrobe
            </Link>
          </div>

          {/* Links Column 2: Concierge */}
          <div className="flex flex-col gap-3 text-[13.5px]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0A0A0A]">
              Concierge
            </span>
            <a
              href={whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#8A8A8A] hover:text-[#0A0A0A] transition-colors"
            >
              WhatsApp Support
            </a>
            <span className="text-[#8A8A8A]">care@snifftok.com</span>
            <span className="text-[#8A8A8A]">Delivery & Returns Policy</span>
            <span className="text-[#8A8A8A]">Fragrance Care & Storage</span>
          </div>
        </div>

        {/* Bottom Bar: Social Icons & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="text-[12px] text-[#8A8A8A] space-y-0.5">
            <p>© 2026 snifftok. All rights reserved.</p>
            <p className="text-[11px] text-[#A5A5A5]">Designed with precision for artisanal perfume connoisseurs.</p>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-3">
            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-xs hover:bg-[#0A0A0A] hover:text-white transition-all active:scale-95"
            >
              <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
              </svg>
            </a>

            {/* X / Twitter */}
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter)"
              className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-xs hover:bg-[#0A0A0A] hover:text-white transition-all active:scale-95"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>

            {/* WhatsApp */}
            <a
              href={whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp Concierge"
              className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-xs hover:bg-[#0A0A0A] hover:text-white transition-all active:scale-95"
            >
              <MessageCircle className="w-4 h-4 stroke-[1.8]" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
