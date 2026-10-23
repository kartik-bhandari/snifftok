"use client";

import React from "react";
import { AuthProvider } from "@/context/AuthContext";
import { StoreProvider } from "@/context/StoreContext";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import MenuOverlay from "@/components/MenuOverlay";
import CartSheet from "@/components/CartSheet";
import SearchOverlay from "@/components/SearchOverlay";
import FragranceGuideModal from "@/components/FragranceGuideModal";
import CheckoutModal from "@/components/CheckoutModal";

export default function AppShell({ children }) {
  return (
    <AuthProvider>
      <StoreProvider>
        <div className="min-h-screen bg-[#EFEFEF] text-[#0A0A0A] flex flex-col selection:bg-[#0A0A0A] selection:text-white relative overflow-x-hidden">
          {/* Header */}
          <Header />

          {/* Page Main Content */}
          <main className="flex-1 w-full flex flex-col">{children}</main>

          {/* Floating UI Elements */}
          <BottomNav />

          {/* Global Drawers & Overlays */}
          <MenuOverlay />
          <CartSheet />
          <SearchOverlay />
          <FragranceGuideModal />
          <CheckoutModal />
        </div>
      </StoreProvider>
    </AuthProvider>
  );
}
