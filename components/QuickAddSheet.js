"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/context/StoreContext";

export default function QuickAddSheet() {
  const { quickAddProduct, setQuickAddProduct, addToCart } = useStore();
  const [selectedVariantType, setSelectedVariantType] = useState("bottle");
  const [selectedSize, setSelectedSize] = useState(null);

  // Reset variant and size when product changes
  useEffect(() => {
    if (quickAddProduct) {
      const defaultType = quickAddProduct.isTester ? "tester" : "bottle";
      setSelectedVariantType(defaultType);
      const sizes = quickAddProduct.variants?.[defaultType]?.sizes || [];
      const firstAvailable = sizes.find((s) => s.inStock) || sizes[0];
      setSelectedSize(firstAvailable || null);
    }
  }, [quickAddProduct]);

  if (!quickAddProduct) return null;

  const currentVariantData = quickAddProduct.variants?.[selectedVariantType] || quickAddProduct.variants?.bottle;
  const sizes = currentVariantData?.sizes || [];

  const handleVariantSwitch = (type) => {
    setSelectedVariantType(type);
    const newSizes = quickAddProduct.variants?.[type]?.sizes || [];
    const firstAvailable = newSizes.find((s) => s.inStock) || newSizes[0];
    setSelectedSize(firstAvailable || null);
  };

  const handleAdd = () => {
    if (!selectedSize || !selectedSize.inStock) return;
    addToCart(quickAddProduct, selectedVariantType, selectedSize, 1);
    setQuickAddProduct(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setQuickAddProduct(null)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs"
        />

        {/* Sheet / Modal Content */}
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          className="relative w-full max-w-[480px] bg-white rounded-t-[24px] sm:rounded-[32px] p-5 sm:p-7 shadow-2xl z-10 select-none pb-9 sm:pb-7"
        >
          {/* Header Row */}
          <div className="flex items-start justify-between pb-4 border-b border-[#F0F0F0]">
            <div className="flex items-center gap-3">
              <div className="relative w-14 h-16 sm:w-16 sm:h-18 rounded-[14px] overflow-hidden bg-[#EAEAEA] shrink-0">
                <Image
                  src={quickAddProduct.images?.[0] || "/images/products/santal.png"}
                  alt={quickAddProduct.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-medium text-[#8A8A8A] uppercase tracking-wider">
                  {quickAddProduct.brand}
                </span>
                <h3 className="text-[15px] sm:text-[17px] font-bold text-[#0A0A0A] capitalize">
                  {quickAddProduct.name}
                </h3>
                <span className="text-[13px] sm:text-[14px] text-[#8A8A8A] font-medium mt-0.5">
                  {selectedSize?.price || "₹5,800"}
                </span>
              </div>
            </div>

            <button
              onClick={() => setQuickAddProduct(null)}
              className="w-8 h-8 rounded-full bg-[#F5F5F5] hover:bg-[#EAEAEA] flex items-center justify-center text-[#0A0A0A] active:scale-90 transition-transform"
              aria-label="Close quick add"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Bottle vs Tester Toggle */}
          <div className="py-4">
            <div className="flex bg-[#F5F5F5] p-1 rounded-full w-full">
              {["bottle", "tester"].map((type) => {
                const isActive = selectedVariantType === type;
                return (
                  <button
                    key={type}
                    onClick={() => handleVariantSwitch(type)}
                    className={`flex-1 py-1.5 sm:py-2 text-[12px] sm:text-[13px] font-semibold capitalize rounded-full transition-all ${
                      isActive ? "bg-white text-[#0A0A0A] shadow-xs" : "text-[#8A8A8A] hover:text-[#0A0A0A]"
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Chips */}
          <div className="pb-5">
            <span className="text-[11px] font-medium text-[#8A8A8A] uppercase tracking-wider block mb-2">
              Select Volume
            </span>
            <div className="grid grid-cols-5 gap-2">
              {sizes.map((s) => {
                const isSelected = selectedSize?.ml === s.ml;
                const isOutOfStock = !s.inStock;

                return (
                  <button
                    key={s.ml}
                    disabled={isOutOfStock}
                    onClick={() => setSelectedSize(s)}
                    className={`py-2 px-1 text-center rounded-full text-[12px] sm:text-[13px] font-medium border transition-all ${
                      isSelected
                        ? "bg-[#0A0A0A] text-white border-[#0A0A0A]"
                        : isOutOfStock
                        ? "bg-transparent text-[#BCBCBC] border-[#E5E5E5] line-through cursor-not-allowed"
                        : "bg-transparent text-[#0A0A0A] border-[#D6D6D6] hover:border-[#0A0A0A]"
                    }`}
                  >
                    {s.ml}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add to Bag CTA */}
          <button
            onClick={handleAdd}
            disabled={!selectedSize || !selectedSize.inStock}
            className={`w-full py-3.5 sm:py-4 rounded-full text-[13px] sm:text-[14px] font-semibold tracking-wider uppercase transition-all shadow-sm ${
              selectedSize && selectedSize.inStock
                ? "bg-[#0A0A0A] text-white hover:bg-black/90 active:scale-98"
                : "bg-[#E0E0E0] text-[#999999] cursor-not-allowed"
            }`}
          >
            {selectedSize && selectedSize.inStock ? `Add to Bag • ${selectedSize.price}` : "Out of Stock"}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
