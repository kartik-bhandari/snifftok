"use client";

import React from "react";
import { MessageCircle } from "lucide-react";

export default function ChatButton() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919876543210";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Hello snifftok, I would like to inquire about fragrance recommendations."
  )}`;

  return (
    <aside aria-label="Customer Support Chat" className="fixed bottom-6 right-4 sm:bottom-8 sm:right-8 z-40 pointer-events-auto">
      <a
        id="whatsapp-chat-btn"
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with snifftok concierge on WhatsApp"
        className="w-[52px] h-[52px] sm:w-[56px] sm:h-[56px] rounded-full bg-[#0A0A0A] text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
      >
        <MessageCircle className="w-6 h-6 fill-white stroke-none" />
      </a>
    </aside>
  );
}
