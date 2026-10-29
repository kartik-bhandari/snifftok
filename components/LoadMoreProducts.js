"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import ProductCard from "@/components/ProductCard";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

/**
 * Renders pages 2+ of a shop listing on demand. Page 1 is server-rendered by
 * ShopListing; this appends the rest when the shopper asks for more.
 */
export default function LoadMoreProducts({ query, pageSize, total, preferDecant }) {
  const [items, setItems]     = useState([]);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const shown     = pageSize + items.length;
  const remaining = Math.max(0, total - shown);

  const loadMore = async () => {
    setLoading(true);
    setError("");
    try {
      const qs  = new URLSearchParams({ ...query, page: String(page + 1), limit: String(pageSize) });
      const res = await fetch(`${API}/api/storefront/products?${qs}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setItems((prev) => [...prev, ...(data.data ?? [])]);
      setPage((p) => p + 1);
    } catch {
      setError("Couldn't load more right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {items.length > 0 && (
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 lg:gap-8 mt-3.5 sm:mt-6 lg:mt-8">
          {items.map((product) => (
            <ProductCard key={product._id} product={product} preferDecant={preferDecant} />
          ))}
        </div>
      )}

      {remaining > 0 && (
        <div className="flex flex-col items-center mt-8 sm:mt-10 gap-2">
          <button
            onClick={loadMore}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-[#0A0A0A] hover:bg-black/85 active:scale-95 text-white text-[13px] font-medium px-6 py-3 rounded-full transition-transform disabled:opacity-60"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Load more
          </button>
          <p className="text-[11px] text-[#8A8A8A] tabular-nums">
            Showing {shown} of {total}
          </p>
          {error && <p className="text-[12px] text-red-600">{error}</p>}
        </div>
      )}
    </>
  );
}
