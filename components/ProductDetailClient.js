"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bookmark, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useStore } from "@/context/StoreContext";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";

export default function ProductDetailClient({ product, relatedProducts }) {
    const {
        isInWishlist,
        toggleWishlist,
        addToCart,
        setIsFragranceGuideOpen,
    } = useStore();

    const isWishlisted = isInWishlist(product.slug)

    // ── Images ────────────────────────────────────────────────────────────────
    // API: images is [{url, publicId, order, ...}], sorted by order ascending
    const rawImages = product.images ?? []
    const images = rawImages.length > 0
        ? [...rawImages].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map(img =>
            typeof img === 'string' ? img : img.url
        )
        : ["/images/products/santal.png"]
    const [activeImageIndex, setActiveImageIndex] = useState(0)

    // ── Variants ──────────────────────────────────────────────────────────────
    // API: variants is a flat array [{type:'bottle'|'tester', sizeMl, sku, stock, pricing}, ...]
    const bottles = (product.variants ?? []).filter(v => v.type === 'bottle')
    const testers = (product.variants ?? []).filter(v => v.type === 'tester')
    const hasBottles = bottles.length > 0
    const hasTesters = testers.length > 0

    // ?variant=decant (e.g. from the Decants section) is applied by <DecantFromUrl>
    // after hydration, so the rest of the page can still be prerendered.
    const [selectedVariantType, setSelectedVariantType] = useState(
        hasBottles ? "bottle" : "tester"
    )

    const availableSizes = selectedVariantType === 'bottle' ? bottles : testers

    const [selectedVariant, setSelectedVariant] = useState(() => {
        const pool = hasBottles ? bottles : testers
        return pool.find(v => (v.stock ?? 0) > 0) ?? pool[0] ?? null
    })

    const handleVariantChange = (type) => {
        setSelectedVariantType(type)
        const pool = type === 'bottle' ? bottles : testers
        setSelectedVariant(pool.find(v => (v.stock ?? 0) > 0) ?? pool[0] ?? null)
    }

    // Price formatting: API price is in paise (integer)
    function formatPaise(paise) {
        return `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
    }

    const displayPrice = selectedVariant?.pricing?.unitPriceExclDelivery
        ? formatPaise(selectedVariant.pricing.unitPriceExclDelivery)
        : "Price on request"

    // Tabs state
    const [activeTab, setActiveTab] = useState("details")

    const isInStock = (selectedVariant?.stock ?? 0) > 0

    const handleAddToBag = () => {
        if (!selectedVariant || !isInStock) return
        const paise = selectedVariant.pricing?.unitPriceExclDelivery ?? 0
        const sizeObj = {
            ml: `${selectedVariant.sizeMl}ml`,
            sku: selectedVariant.sku,   // lets the API look up cost for profit reporting
            price: formatPaise(paise),
            priceRaw: Math.round(paise / 100),   // rupees integer for calculations
            inStock: true,
        }
        addToCart(product, selectedVariantType, sizeObj, 1)
    }

    const handleBuyNow = () => {
        if (!selectedVariant || !isInStock) return
        const paise = selectedVariant.pricing?.unitPriceExclDelivery ?? 0
        const sizeObj = {
            ml: `${selectedVariant.sizeMl}ml`,
            sku: selectedVariant.sku,
            price: formatPaise(paise),
            priceRaw: Math.round(paise / 100),
            inStock: true,
        }
        addToCart(product, selectedVariantType, sizeObj, 1)
    }

    return (
        <div className="flex flex-col w-full pt-16 sm:pt-20 select-none">
            {/* useSearchParams must sit inside Suspense or the static build fails */}
            {hasTesters && (
                <Suspense fallback={null}>
                    <DecantFromUrl onDecant={() => handleVariantChange("tester")} />
                </Suspense>
            )}
            {/* Main Container: Split-screen on lg+ screens */}
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-6">
                {/* Breadcrumb */}
                <div className="py-2.5 flex items-center gap-1.5 text-[11px] sm:text-[12px] text-[#8A8A8A] font-medium tracking-tight overflow-hidden">
                    <Link href="/" className="hover:text-[#0A0A0A] transition-colors shrink-0">
                        Home
                    </Link>
                    {/* Category — hidden on mobile to keep breadcrumb single-line */}
                    <span className="text-[#A0A0A0] shrink-0 hidden sm:inline">&gt;</span>
                    <span className="uppercase tracking-wider font-semibold text-[#666666] truncate hidden sm:inline">
                        {product.categoryId?.name ?? product.category ?? "Fragrance"}
                    </span>
                    <span className="text-[#A0A0A0] shrink-0">&gt;</span>
                    <span className="text-[#0A0A0A] capitalize truncate min-w-0">
                        {product.name}
                    </span>
                </div>

                {/* 2-Column Responsive Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start mt-2">
                    {/* Left Column: Image Gallery (7 cols on lg) */}
                    <div className="lg:col-span-7 flex flex-col gap-4">
                        {/* Main Image */}
                        <div className="relative aspect-[4/5] w-full rounded-[16px] sm:rounded-[24px] overflow-hidden bg-[#E2E2E2] shadow-sm">
                            <Image
                                src={images[activeImageIndex] || images[0]}
                                alt={product.name}
                                fill
                                priority
                                unoptimized={images[activeImageIndex]?.startsWith('http')}
                                sizes="(max-width: 1024px) 100vw, 60vw"
                                className="object-cover object-center transition-all duration-300"
                            />

                            {/* Gallery Dots Indicator */}
                            <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-1.5 z-10">
                                {images.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImageIndex(idx)}
                                        aria-label={`View photo ${idx + 1}`}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${activeImageIndex === idx ? "w-4 bg-white" : "w-1.5 bg-white/60"
                                            }`}
                                    />
                                ))}
                            </div>

                            {/* Left / Right arrow tap buttons */}
                            <button
                                onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/70 hover:bg-white backdrop-blur-xs flex items-center justify-center text-[#0A0A0A] active:scale-95 transition-all shadow-xs"
                                aria-label="Previous image"
                            >
                                <ChevronLeft className="w-5 h-5 stroke-[2]" />
                            </button>
                            <button
                                onClick={() => setActiveImageIndex((prev) => (prev + 1) % images.length)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/70 hover:bg-white backdrop-blur-xs flex items-center justify-center text-[#0A0A0A] active:scale-95 transition-all shadow-xs"
                                aria-label="Next image"
                            >
                                <ChevronRight className="w-5 h-5 stroke-[2]" />
                            </button>
                        </div>

                        {/* Desktop Thumbnail Rail */}
                        <div className="hidden sm:flex items-center gap-3">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImageIndex(idx)}
                                    className={`relative w-20 h-24 rounded-[12px] overflow-hidden border-2 transition-all ${activeImageIndex === idx
                                            ? "border-[#0A0A0A] shadow-xs"
                                            : "border-transparent opacity-60 hover:opacity-100"
                                        }`}
                                >
                                    <Image src={img} alt={`Thumbnail ${idx + 1}`} fill unoptimized={img?.startsWith('http')} className="object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Sticky Product Detail Card & Tabs (5 cols on lg) */}
                    <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-20">
                        {/* White Rounded Card (24px radius) */}
                        <div className="bg-white rounded-[24px] sm:rounded-[28px] p-5 sm:p-7 shadow-xs space-y-4 sm:space-y-5">
                            {/* Title & Bookmark */}
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-[18px] sm:text-[22px] font-bold text-[#0A0A0A] capitalize tracking-tight leading-tight">
                                        {product.name}
                                    </h1>
                                    {/* Price under product name in grey */}
                                    <span className="text-[13px] sm:text-[15px] text-[#8A8A8A] font-medium block mt-1">
                                        {displayPrice}
                                    </span>
                                </div>

                                {/* Bookmark button */}
                                <button
                                    onClick={() => toggleWishlist(product)}
                                    aria-label={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
                                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 border shrink-0 mt-0.5 ${
                                        isWishlisted
                                            ? "bg-[#0A0A0A] border-[#0A0A0A] text-white"
                                            : "bg-[#F0F0F0] border-transparent hover:bg-[#E5E5E5] text-[#0A0A0A]"
                                    }`}
                                >
                                    <Bookmark
                                        className={`w-4 h-4 ${isWishlisted ? "fill-white stroke-white" : "stroke-[#0A0A0A]"}`}
                                    />
                                </button>
                            </div>

                            {/* Type Toggle — only show buttons for types that have variants */}
                            {(hasBottles || hasTesters) && (
                                <div className="bg-[#F2F2F2] p-1 rounded-full flex">
                                    {hasBottles && (
                                        <button
                                            id="toggle-bottle-btn"
                                            onClick={() => handleVariantChange("bottle")}
                                            className={`flex-1 py-1.5 sm:py-2 text-[12px] sm:text-[13px] font-semibold rounded-full transition-all ${selectedVariantType === "bottle"
                                                    ? "bg-white text-[#0A0A0A] shadow-xs"
                                                    : "text-[#8A8A8A] hover:text-[#0A0A0A]"
                                                }`}
                                        >
                                            Bottle
                                        </button>
                                    )}
                                    {hasTesters && (
                                        <button
                                            id="toggle-tester-btn"
                                            onClick={() => handleVariantChange("tester")}
                                            className={`flex-1 py-1.5 sm:py-2 text-[12px] sm:text-[13px] font-semibold rounded-full transition-all ${selectedVariantType === "tester"
                                                    ? "bg-white text-[#0A0A0A] shadow-xs"
                                                    : "text-[#8A8A8A] hover:text-[#0A0A0A]"
                                                }`}
                                        >
                                            Decant
                                        </button>
                                    )}
                                </div>
                            )}

                            <div>
                                <span className="text-[11px] sm:text-[12px] font-medium text-[#8A8A8A] uppercase tracking-wider block mb-2.5">
                                    Select Size
                                </span>
                                <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
                                    {availableSizes.map((v) => {
                                        const isSelected = selectedVariant?._id === v._id || selectedVariant?.sku === v.sku
                                        const outOfStock = (v.stock ?? 0) <= 0
                                        return (
                                            <button
                                                key={v.sku ?? v._id}
                                                disabled={outOfStock}
                                                onClick={() => setSelectedVariant(v)}
                                                className={`py-2 sm:py-2.5 px-1 text-center rounded-full text-[12px] sm:text-[13px] font-medium border transition-all ${isSelected
                                                        ? "bg-[#0A0A0A] text-white border-[#0A0A0A]"
                                                        : outOfStock
                                                            ? "bg-transparent text-[#BCBCBC] border-[#E8E8E8] line-through cursor-not-allowed"
                                                            : "bg-transparent text-[#0A0A0A] border-[#D6D6D6] hover:border-[#0A0A0A]"
                                                    }`}
                                            >
                                                {v.sizeMl}ml
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Decant Promo Info Line */}
                            {selectedVariantType === "tester" && (
                                <div className="bg-[#F6F8FB] border border-[#E3EDFD] rounded-[14px] p-3 flex items-center gap-2.5">
                                    <Sparkles className="w-4 h-4 text-[#2F80FF] shrink-0" />
                                    <p className="text-[12px] sm:text-[13px] text-[#0A0A0A] leading-tight">
                                        Buy 5 or more decants and get discounted shipping.
                                    </p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="space-y-2.5 pt-1">
                                <button
                                    id="add-to-bag-pdp-btn"
                                    onClick={handleAddToBag}
                                    disabled={!isInStock}
                                    className={`w-full py-3.5 sm:py-4 rounded-full text-[13px] sm:text-[14px] font-semibold tracking-wider uppercase border border-[#0A0A0A] text-[#0A0A0A] hover:bg-black/5 active:scale-98 transition-all ${!isInStock ? "opacity-40 cursor-not-allowed" : ""
                                        }`}
                                >
                                    {isInStock ? "Add to Bag" : "Out of Stock"}
                                </button>

                                <button
                                    id="buy-now-pdp-btn"
                                    onClick={handleBuyNow}
                                    disabled={!isInStock}
                                    className={`w-full py-3.5 sm:py-4 rounded-full text-[13px] sm:text-[14px] font-semibold tracking-wider uppercase bg-[#0A0A0A] text-white hover:bg-black/90 active:scale-98 transition-all shadow-md ${!isInStock ? "opacity-40 cursor-not-allowed" : ""
                                        }`}
                                >
                                    Buy Now
                                </button>

                                {/* Fragrance Guide — subtle link below action buttons */}
                                <button
                                    id="fragrance-guide-btn"
                                    onClick={() => setIsFragranceGuideOpen(true)}
                                    className="w-full text-center text-[12px] text-[#8A8A8A] hover:text-[#0A0A0A] underline underline-offset-2 transition-colors pt-1"
                                >
                                    Not sure about your scent? Try the Fragrance Guide →
                                </button>
                            </div>
                        </div>

                        {/* Tabs: Details & Notes, Care, Shipping */}
                        <div className="w-full">
                            {/* Tab Headers with Animated Underline */}
                            <div className="flex items-center gap-6 border-b border-[#D8D8D8] px-2 pb-2">
                                {[
                                    { id: "details", label: "Details & Notes" },
                                    { id: "care", label: "Care" },
                                    { id: "shipping", label: "Shipping" },
                                ].map((tab) => {
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`relative text-[13.5px] sm:text-[14px] font-bold tracking-tight pb-2 transition-colors ${isActive ? "text-[#0A0A0A]" : "text-[#8A8A8A] hover:text-[#0A0A0A]"
                                                }`}
                                        >
                                            {tab.label}
                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeTabUnderline"
                                                    className="absolute bottom-[-9px] left-0 right-0 h-[2.5px] bg-[#0A0A0A] rounded-full"
                                                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                                                />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Tab Content Panel (Rounded Grey Container) */}
                            <div className="bg-[#E4E4E4] rounded-[20px] p-5 sm:p-6 mt-4 text-[13px] sm:text-[13.5px] text-[#0A0A0A] space-y-4">
                                {activeTab === "details" && (
                                    <div className="space-y-4">
                                        {/* Bullet Details */}
                                        <div className="space-y-1.5">
                                            <p className="font-semibold text-[#0A0A0A] text-[12px] uppercase tracking-wider">
                                                Specifications
                                            </p>
                                            <ul className="space-y-1 text-[#4A4A4A] pl-3 list-disc">
                                                {product.concentration && <li>Concentration: {product.concentration}</li>}
                                                {product.origin && <li>Origin: {product.origin}</li>}
                                                {product.brand && <li>Brand: {product.brand}</li>}
                                            </ul>
                                        </div>

                                        {/* Notes Pyramid Block */}
                                        <div className="bg-white/60 p-4 rounded-[14px] space-y-2 border border-white/60">
                                            <span className="font-bold text-[12px] uppercase tracking-wider block text-[#0A0A0A]">
                                                Olfactive Pyramid
                                            </span>
                                            <div className="grid grid-cols-1 gap-1.5 text-[12.5px]">
                                                <div>
                                                    <span className="font-semibold text-[#0A0A0A]">Top Notes: </span>
                                                    <span className="text-[#666666]">{product.notes?.top.join(", ")}</span>
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-[#0A0A0A]">Heart Notes: </span>
                                                    <span className="text-[#666666]">{product.notes?.heart.join(", ")}</span>
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-[#0A0A0A]">Base Notes: </span>
                                                    <span className="text-[#666666]">{product.notes?.base.join(", ")}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Description Paragraph */}
                                        <div className="space-y-1">
                                            <span className="font-bold text-[12px] uppercase tracking-wider block text-[#0A0A0A]">
                                                About the Fragrance
                                            </span>
                                            <p className="text-[12.5px] sm:text-[13px] text-[#555555] leading-relaxed">
                                                {product.description}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "care" && (
                                    <div className="space-y-2">
                                        <span className="font-bold text-[12px] uppercase tracking-wider block text-[#0A0A0A]">
                                            Storage & Longevity
                                        </span>
                                        <p className="text-[12.5px] sm:text-[13px] text-[#555555] leading-relaxed">
                                            {product.care}
                                        </p>
                                        <ul className="space-y-1 text-[#4A4A4A] pl-3 list-disc text-[12px] pt-1">
                                            <li>Keep in a dark, dry space between 15°C and 22°C.</li>
                                            <li>Do not leave inside vehicles or direct sunlit shelves.</li>
                                            <li>Ensure the atomiser cap is tightly pressed after each ritual.</li>
                                        </ul>
                                    </div>
                                )}

                                {activeTab === "shipping" && (
                                    <div className="space-y-2">
                                        <span className="font-bold text-[12px] uppercase tracking-wider block text-[#0A0A0A]">
                                            Delivery & Returns
                                        </span>
                                        <p className="text-[12.5px] sm:text-[13px] text-[#555555] leading-relaxed">
                                            {product.shipping}
                                        </p>
                                        <div className="bg-white/60 p-3 rounded-[12px] text-[12px] text-[#555555] mt-2">
                                            <p className="font-medium text-[#0A0A0A]">Standard Shipping Rates:</p>
                                            <p>• Bottles: ₹80 each</p>
                                            <p>• Decants: ₹80 per bundle of 5</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* "You may also like" 4-Column Grid on Desktop */}
            <section className="w-full max-w-7xl mx-auto pt-12 sm:pt-16 pb-8 px-4 sm:px-6 lg:px-8">
                <h2 className="text-[18px] sm:text-[22px] font-bold text-[#0A0A0A] tracking-tight pb-4 px-0.5">
                    You may also like
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6 lg:gap-8">
                    {relatedProducts.map((p) => (
                        <ProductCard key={p._id ?? p.id} product={p} />
                    ))}
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
}

/** Switches to the decant tab when the URL has ?variant=decant. Renders nothing. */
function DecantFromUrl({ onDecant }) {
    const wantDecant = useSearchParams().get('variant') === 'decant'
    useEffect(() => {
        if (wantDecant) onDecant()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wantDecant])
    return null
}
