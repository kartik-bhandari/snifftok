import Link from "next/link";
import { PackageOpen } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import LoadMoreProducts from "@/components/LoadMoreProducts";
import WhatsAppRequestBanner from "@/components/WhatsAppRequestBanner";
import { fetchProducts } from "@/lib/products";
import { COLLECTIONS, PAGE_SIZE, hrefFor } from "@/lib/collections";

/**
 * Shared listing for /shop and /shop/[collection]: header, collection tabs,
 * the first page of products (server-rendered) and "Load more" for the rest.
 */
export default async function ShopListing({ collection }) {
  const res   = await fetchProducts({ ...collection.query, limit: PAGE_SIZE });
  const items = res.data ?? [];
  const total = res.total ?? items.length;

  return (
    <main className="min-h-screen bg-[#EFEFEF] pb-40 md:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-28">
        {/* ── Header ─────────────────────────────────────────── */}
        <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-[#8A8A8A] mb-2">Shop</p>
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-wordmark text-[#0A0A0A] text-[32px] md:text-[44px] leading-[1.02]">
              {collection.title}
            </h1>
            <p className="text-[13px] md:text-[15px] text-[#666666] mt-1.5 max-w-md">{collection.description}</p>
          </div>
          <span className="text-[12px] sm:text-[13px] text-[#8A8A8A] tabular-nums">
            {total} {total === 1 ? "fragrance" : "fragrances"}
          </span>
        </div>

        {/* ── Collection tabs ────────────────────────────────── */}
        <nav aria-label="Collections" className="mt-5 mb-6 sm:mb-8 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ul className="flex gap-2 w-max">
            {COLLECTIONS.map((c) => {
              const active = c.slug === collection.slug;
              return (
                <li key={c.slug ?? "all"}>
                  <Link
                    href={hrefFor(c)}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex items-center text-[13px] font-medium px-4 py-2 rounded-full border transition-colors ${
                      active
                        ? "bg-[#0A0A0A] text-white border-[#0A0A0A]"
                        : "bg-white text-[#0A0A0A] border-[#E8E8E8] hover:border-[#0A0A0A]/25"
                    }`}
                  >
                    {c.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ── Products ───────────────────────────────────────── */}
        {items.length === 0 ? (
          <div className="bg-white rounded-[24px] border border-[#E8E8E8] px-6 py-14 text-center">
            <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-[#F0F0F0] text-[#0A0A0A]">
              <PackageOpen className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-[#0A0A0A]">Nothing here yet</p>
            <p className="text-xs text-[#8A8A8A] mt-1">
              New bottles land often — <Link href="/shop" className="underline underline-offset-2">browse everything</Link> meanwhile.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 lg:gap-8">
              {items.map((product) => (
                <ProductCard key={product._id} product={product} preferDecant={collection.preferDecant} />
              ))}
            </div>
            <LoadMoreProducts
              query={collection.query}
              pageSize={PAGE_SIZE}
              total={total}
              preferDecant={collection.preferDecant}
            />
          </>
        )}

        <WhatsAppRequestBanner className="mt-12 sm:mt-16" />
      </div>
    </main>
  );
}

/** Mirrors the listing layout while it loads */
export function ShopListingSkeleton() {
  return (
    <main className="min-h-screen bg-[#EFEFEF] pb-40 md:pb-16" aria-busy="true" aria-label="Loading products">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-28 animate-pulse">
        <div className="h-3 w-12 rounded bg-[#E2E2E2] mb-3" />
        <div className="h-9 w-56 rounded bg-[#E2E2E2]" />
        <div className="h-4 w-72 rounded bg-[#E2E2E2] mt-3" />
        <div className="flex gap-2 mt-5 mb-8">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-9 w-24 rounded-full bg-[#E2E2E2]" />)}
        </div>
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 lg:gap-8">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[4/5] rounded-[16px] bg-[#E2E2E2]" />)}
        </div>
      </div>
    </main>
  );
}
