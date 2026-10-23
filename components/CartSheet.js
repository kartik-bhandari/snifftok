"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Plus, Minus, Trash2, ShoppingBag, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/context/StoreContext";

export default function CartSheet() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotalFormatted,
    shippingInfo,
    totalAmountFormatted,
    setIsCheckoutOpen,
  } = useStore();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end pointer-events-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          />

          {/* Slide-over Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="relative w-full max-w-[420px] bg-white h-full shadow-2xl z-10 flex flex-col justify-between select-none"
          >
            {/* Header */}
            <div className="p-4.5 border-b border-[#F0F0F0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#0A0A0A]" />
                <h2 className="text-[17px] font-bold text-[#0A0A0A]">Shopping Bag</h2>
                <span className="text-[12px] text-[#8A8A8A] font-medium">
                  ({cart.reduce((sum, item) => sum + item.quantity, 0)})
                </span>
              </div>

              <button
                id="close-cart-btn"
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#0A0A0A] active:scale-90 transition-transform"
                aria-label="Close shopping bag"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tester Discount Promo Banner (Prompt Requirement) */}
            {shippingInfo.testersCount > 0 && (
              <div className="bg-[#F8F9FA] px-4 py-2.5 border-b border-[#EAEAEA] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#2F80FF] shrink-0" />
                <span className="text-[12px] text-[#0A0A0A] leading-tight">
                  {shippingInfo.isTesterDiscountEligible ? (
                    <span className="font-medium text-emerald-600">
                      Tester bundle applied: Flat ₹80 shipping per 5 testers!
                    </span>
                  ) : (
                    <span>
                      Add <strong>{shippingInfo.testersNeededForNextBundle} more tester</strong> to maximize bundle shipping savings!
                    </span>
                  )}
                </span>
              </div>
            )}

            {/* Item List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 divide-y divide-[#F5F5F5]">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-16 px-6">
                  <div className="w-16 h-16 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#8A8A8A] mb-4">
                    <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <h3 className="text-[16px] font-bold text-[#0A0A0A]">Your bag is empty</h3>
                  <p className="text-[13px] text-[#8A8A8A] mt-1 max-w-[240px]">
                    Discover artisanal extraits or sample iconic fragrances with our discovery testers.
                  </p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-6 px-6 py-2.5 rounded-full bg-[#0A0A0A] text-white text-[13px] font-medium hover:bg-black/90 active:scale-95 transition-all"
                  >
                    Explore Perfumes
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.itemKey} className="pt-3.5 first:pt-0 flex gap-3.5">
                    {/* Thumbnail */}
                    <div className="relative w-18 h-22 rounded-[14px] overflow-hidden bg-[#F0F0F0] shrink-0">
                      <Image
                        src={
                          typeof item.image === "string"
                            ? item.image
                            : item.image?.url || "/images/products/santal.png"
                        }
                        alt={item.name}
                        fill
                        sizes="72px"
                        className="object-cover"
                      />
                    </div>

                    {/* Details & Controls */}
                    <div className="flex-1 flex flex-col justify-between py-0.5">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-[14px] font-bold text-[#0A0A0A] capitalize leading-tight">
                            {item.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.itemKey)}
                            aria-label={`Remove ${item.name}`}
                            className="text-[#8A8A8A] hover:text-rose-500 p-1 active:scale-90 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-[12px] text-[#8A8A8A] mt-0.5 flex items-center gap-1.5">
                          <span className="capitalize">{item.variantType}</span>
                          <span>•</span>
                          <span>{item.ml}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        {/* Stepper */}
                        <div className="flex items-center border border-[#E0E0E0] rounded-full h-7 px-1.5 gap-2 bg-white">
                          <button
                            onClick={() => updateQuantity(item.itemKey, item.quantity - 1)}
                            className="w-5 h-5 flex items-center justify-center text-[#0A0A0A] hover:bg-black/5 rounded-full active:scale-90"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3 stroke-[2.2]" />
                          </button>
                          <span className="text-[12px] font-semibold text-[#0A0A0A] min-w-[12px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.itemKey, item.quantity + 1)}
                            className="w-5 h-5 flex items-center justify-center text-[#0A0A0A] hover:bg-black/5 rounded-full active:scale-90"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3 stroke-[2.2]" />
                          </button>
                        </div>

                        {/* Price */}
                        <span className="text-[13px] font-semibold text-[#0A0A0A]">
                          {item.price}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary & Checkout */}
            {cart.length > 0 && (
              <div className="p-4.5 bg-[#FAF9F8] border-t border-[#EAEAEA] space-y-3">
                <div className="space-y-1.5 text-[13px]">
                  <div className="flex justify-between text-[#8A8A8A]">
                    <span>Subtotal</span>
                    <span className="text-[#0A0A0A] font-medium">{subtotalFormatted}</span>
                  </div>
                  <div className="flex justify-between text-[#8A8A8A]">
                    <span>
                      Delivery{" "}
                      <span className="text-[11px] text-[#A0A0A0]">
                        ({shippingInfo.bottlesCount > 0 ? `${shippingInfo.bottlesCount} bottles` : ""}
                        {shippingInfo.bottlesCount > 0 && shippingInfo.testersCount > 0 ? " + " : ""}
                        {shippingInfo.testersCount > 0 ? `${shippingInfo.testersCount} testers` : ""})
                      </span>
                    </span>
                    <span className="text-[#0A0A0A] font-medium">
                      {shippingInfo.formattedShipping}
                    </span>
                  </div>
                  <div className="flex justify-between text-[15px] font-bold text-[#0A0A0A] pt-2 border-t border-[#E5E5E5]">
                    <span>Estimated Total</span>
                    <span>{totalAmountFormatted}</span>
                  </div>
                </div>

                <button
                  id="checkout-cta-btn"
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full py-3.5 rounded-full bg-[#0A0A0A] text-white text-[13px] font-semibold tracking-wider uppercase hover:bg-black/90 active:scale-98 transition-all shadow-md"
                >
                  Proceed to Checkout
                </button>

                <p className="text-[11px] text-center text-[#8A8A8A]">
                  Taxes calculated at checkout. Express delivery across India.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
