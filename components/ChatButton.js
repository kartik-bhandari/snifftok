"use client";

import React from "react";
import { MessageCircle } from "lucide-react";
import { whatsappUrl, WHATSAPP_MESSAGES } from "@/lib/whatsapp";

/**
 * Floating WhatsApp button for desktop. On mobile the same button lives in the
 * bottom navigation bar (BottomNav), so this one is hidden below `md`.
 */
export default function ChatButton() {
  return (
    <aside aria-label="Customer Support Chat" className="hidden md:block fixed bottom-8 right-8 z-40 pointer-events-auto">
      <a
        id="whatsapp-chat-btn-desktop"
        href={whatsappUrl(WHATSAPP_MESSAGES.general)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with snifftok on WhatsApp"
        className="group flex items-center h-14 rounded-full bg-[#0A0A0A] text-white shadow-lg hover:shadow-xl active:scale-95 transition-all"
      >
        {/* Label slides out on hover / keyboard focus */}
        <span className="max-w-0 overflow-hidden whitespace-nowrap text-[13px] font-medium opacity-0 transition-all duration-300 group-hover:max-w-[160px] group-hover:pl-5 group-hover:opacity-100 group-focus-visible:max-w-[160px] group-focus-visible:pl-5 group-focus-visible:opacity-100">
          Chat on WhatsApp
        </span>
        <span className="w-14 h-14 flex items-center justify-center shrink-0">
          <MessageCircle className="w-6 h-6 fill-white stroke-none" />
        </span>
      </a>
    </aside>
  );
}
