"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { calculateShipping } from "@/lib/shipping";

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Overlays state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFragranceGuideOpen, setIsFragranceGuideOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [quickAddProduct, setQuickAddProduct] = useState(null);

  // Normalize image: old items stored the full {url, publicId} object; new items store a URL string
  const normalizeImage = (img) => {
    if (!img) return null;
    if (typeof img === "string") return img;
    return img?.url ?? null;
  };

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("snifftok_cart");
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        setCart(parsed.map((item) => ({ ...item, image: normalizeImage(item.image) })));
      }

      const savedWishlist = localStorage.getItem("snifftok_wishlist");
      if (savedWishlist) {
        const parsed = JSON.parse(savedWishlist);
        setWishlist(parsed.map((item) => ({ ...item, image: normalizeImage(item.image) })));
      }
    } catch (e) {
      console.error("Failed to load local storage state:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("snifftok_cart", JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to save cart to local storage:", e);
    }
  }, [cart, isLoaded]);

  // Save wishlist changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("snifftok_wishlist", JSON.stringify(wishlist));
    } catch (e) {
      console.error("Failed to save wishlist to local storage:", e);
    }
  }, [wishlist, isLoaded]);

  // Prevent scroll when any modal/overlay is open
  useEffect(() => {
    const isAnyOpen = isMenuOpen || isCartOpen || isSearchOpen || isFragranceGuideOpen || isCheckoutOpen || !!quickAddProduct;
    if (isAnyOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen, isCartOpen, isSearchOpen, isFragranceGuideOpen, isCheckoutOpen, quickAddProduct]);

  // Cart operations
  const addToCart = (product, variantType = "bottle", sizeObj = null, quantity = 1) => {
    // If sizeObj is not provided, pick first available size for that variant
    const variantData = product.variants?.[variantType.toLowerCase()] || product.variants?.bottle;
    const selectedSize = sizeObj || variantData?.sizes?.find((s) => s.inStock) || variantData?.sizes?.[0];

    if (!selectedSize) return;

    const pid     = product.id ?? product._id?.toString()
    const itemKey = `${pid}-${variantType}-${selectedSize.ml}`;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.itemKey === itemKey);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }

      return [
        ...prevCart,
        {
          itemKey,
          productId: pid,
          slug: product.slug,
          name: product.name,
          brand: product.brand,
          variantType,
          sku: selectedSize.sku,
          ml: selectedSize.ml,
          price: selectedSize.price,
          priceRaw: selectedSize.priceRaw,
          image: product.images?.[0]?.url || "/images/products/santal.png",

          quantity,
          isTester: variantType.toLowerCase() === "tester" || product.isTester,
        },
      ];
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (itemKey) => {
    setCart((prev) => prev.filter((item) => item.itemKey !== itemKey));
  };

  const updateQuantity = (itemKey, qty) => {
    if (qty <= 0) {
      removeFromCart(itemKey);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.itemKey === itemKey ? { ...item, quantity: qty } : item))
    );
  };

  const clearCart = () => setCart([]);

  // Wishlist operations
  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.slug === product.slug);
      if (exists) {
        return prev.filter((p) => p.slug !== product.slug);
      } else {
        return [
          ...prev,
          {
            id: product.id,
            slug: product.slug,
            name: product.name,
            price: product.variants?.bottle?.sizes?.[0]?.price || "₹5,800",
            image: product.images?.[0]?.url,

            brand: product.brand,
          },
        ];
      }
    });
  };

  const isInWishlist = (slug) => wishlist.some((p) => p.slug === slug);

  // Computed values
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotalRaw = cart.reduce((total, item) => total + (item.priceRaw || 0) * item.quantity, 0);
  const subtotalFormatted = `₹${subtotalRaw.toLocaleString("en-IN")}`;
  const shippingInfo = calculateShipping(cart);
  const totalAmountRaw = subtotalRaw + shippingInfo.totalShipping;
  const totalAmountFormatted = `₹${totalAmountRaw.toLocaleString("en-IN")}`;

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlist,
        cartCount,
        subtotalRaw,
        subtotalFormatted,
        shippingInfo,
        totalAmountRaw,
        totalAmountFormatted,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        // Overlays
        isMenuOpen,
        setIsMenuOpen,
        isCartOpen,
        setIsCartOpen,
        isSearchOpen,
        setIsSearchOpen,
        isFragranceGuideOpen,
        setIsFragranceGuideOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        quickAddProduct,
        setQuickAddProduct,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
