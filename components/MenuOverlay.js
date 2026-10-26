"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Minus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/context/StoreContext";

export default function MenuOverlay() {
  const { isMenuOpen, setIsMenuOpen } = useStore();
  const router = useRouter();

  // Accordion state
  const [openAccordion, setOpenAccordion] = useState(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen, setIsMenuOpen]);

  const toggleAccordion = (key) => {
    setOpenAccordion((prev) => (prev === key ? null : key));
  };

  const handleLinkClick = (href) => {
    setIsMenuOpen(false);
    if (href.startsWith("/#")) {
      const id = href.replace("/#", "");
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
          window.history.pushState(null, "", `#${id}`);
        } else {
          router.push(href);
        }
      }, 150);
    } else if (href) {
      router.push(href);
    }
  };

  const accordionItems = [
    {
      id: "brand",
      label: "Shop by Brand",
      items: ["snifftok Atelier", "snifftok Reserve", "snifftok Discovery", "Collaborations"],
    },
    {
      id: "notes",
      label: "Shop by Notes",
      items: ["Oud", "Musk", "Amber", "Floral", "Fresh"],
    },
    {
      id: "gender",
      label: "Shop by Gender",
      items: ["Gender Neutral / Unisex", "Masculine Leaning", "Feminine Leaning"],
    },
    {
      id: "support",
      label: "Support",
      items: ["Track Your Order", "Fragrance Concierge (WhatsApp)", "Shipping & Returns Policy", "FAQ"],
    },
  ];

  return (
    <AnimatePresence>
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6 overflow-y-auto pointer-events-auto">
          {/* Backdrop on desktop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs hidden sm:block"
          />

          {/* Menu Panel */}
          <motion.div
            id="menu-overlay"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full sm:max-w-xl bg-[#EFEFEF] sm:rounded-[32px] sm:shadow-2xl overflow-y-auto min-h-screen sm:min-h-0 sm:max-h-[90vh] flex flex-col justify-between pt-20 sm:pt-10 pb-8 px-6 sm:px-10 z-10"
          >
            {/* Desktop Close button top right */}
            <div className="hidden sm:flex items-center justify-between pb-4 border-b border-[#E0E0E0]">
              <span className="font-wordmark text-[20px] text-[#0A0A0A]">snifftok</span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#0A0A0A] hover:bg-black hover:text-white transition-colors"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Top group: Bold links */}
            <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4 sm:gap-5 pt-3 sm:pt-4">
              {[
                { name: "New Arrivals", href: "/#new-arrivals" },
                { name: "Best Sellers", href: "/#best-sellers" },
                { name: "Trending", href: "/#new-arrivals" },
                { name: "Decants", href: "/#testers" },
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleLinkClick(item.href)}
                  className="text-left font-bold text-[19px] sm:text-[21px] tracking-tight text-[#0A0A0A] hover:opacity-75 transition-opacity"
                >
                  {item.name}
                </button>
              ))}
            </div>

            {/* Middle group: Accordion rows */}
            <div className="flex flex-col my-6 sm:my-8 divide-y divide-[#E0E0E0]/60 border-t border-b border-[#E0E0E0]/60">
              {accordionItems.map((acc) => {
                const isOpen = openAccordion === acc.id;
                return (
                  <div key={acc.id} className="py-3.5">
                    <button
                      onClick={() => toggleAccordion(acc.id)}
                      className="w-full flex items-center justify-between text-left text-[15px] sm:text-[16px] font-normal text-[#0A0A0A] hover:opacity-80 transition-opacity"
                      aria-expanded={isOpen}
                    >
                      <span>{acc.label}</span>
                      <span className="text-[#0A0A0A] w-5 h-5 flex items-center justify-center">
                        {isOpen ? (
                          <Minus className="w-4 h-4 stroke-[2]" />
                        ) : (
                          <Plus className="w-4 h-4 stroke-[2]" />
                        )}
                      </span>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden pt-2.5 pb-1 grid grid-cols-2 gap-2 pl-2"
                        >
                          {acc.items.map((subItem) => (
                            <button
                              key={subItem}
                              onClick={() => handleLinkClick("/#new-arrivals")}
                              className="text-left text-[13px] text-[#8A8A8A] hover:text-[#0A0A0A] transition-colors py-1"
                            >
                              {subItem}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Bottom group: Bold links */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6 mb-8 sm:mb-4">
              {[
                { name: "Our Story", href: "/#store-footer" },
                { name: "Contact", href: "/#store-footer" },
                { name: "Shipping & Returns", href: "/#store-footer" },
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleLinkClick(item.href)}
                  className="text-left font-bold text-[15px] sm:text-[14px] tracking-tight text-[#0A0A0A] hover:opacity-75 transition-opacity"
                >
                  {item.name}
                </button>
              ))}
            </div>

            {/* Centered Close Pill with Short Dash (Matches Screenshot 4 on mobile, clean close) */}
            <div className="flex flex-col items-center justify-center pt-2">
              <button
                onClick={() => setIsMenuOpen(false)}
                className="flex flex-col items-center gap-1 text-[#8A8A8A] hover:text-[#0A0A0A] transition-colors py-2 px-6 active:scale-95"
                aria-label="Close menu"
              >
                <div className="w-8 h-[2px] bg-[#0A0A0A]/40 rounded-full mb-0.5" />
                <span className="text-[13px] font-medium tracking-wide">Close</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
