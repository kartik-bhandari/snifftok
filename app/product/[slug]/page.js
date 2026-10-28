import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import ProductDetailClient from "@/components/ProductDetailClient";
import { fetchProduct, fetchProducts } from "@/lib/products";

/** Pre-render the first page of products at build time */
export async function generateStaticParams() {
  const res = await fetchProducts({ limit: 50 });
  return (res.data ?? []).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await fetchProduct(slug);
  if (!data) return { title: "Product Not Found | snifftok" };

  const { product } = data;
  return {
    title:       `${product.name} | snifftok`,
    description: product.description ?? `${product.name} — shop at snifftok`,
  };
}

/**
 * `params` and the product fetch are read inside <Suspense> so client
 * navigations show the skeleton instantly instead of blocking.
 * Slugs from generateStaticParams still ship fully rendered.
 */
export default function ProductPage({ params }) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductContent params={params} />
    </Suspense>
  );
}

async function ProductContent({ params }) {
  const { slug } = await params;
  const data = await fetchProduct(slug);

  if (!data) notFound();

  const { product, related } = data;

  return <ProductDetailClient product={product} relatedProducts={related} />;
}

/** Mirrors ProductDetailClient's layout so the page doesn't jump when it loads */
function ProductSkeleton() {
  return (
    <div className="flex flex-col w-full pt-16 sm:pt-20" aria-busy="true" aria-label="Loading product">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-6 animate-pulse">
        <div className="py-2.5">
          <div className="h-3 w-40 rounded bg-[#E2E2E2]" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start mt-2">
          <div className="lg:col-span-7">
            <div className="aspect-[4/5] w-full rounded-[16px] sm:rounded-[24px] bg-[#E2E2E2]" />
          </div>
          <div className="lg:col-span-5 space-y-4">
            <div className="h-3 w-24 rounded bg-[#E2E2E2]" />
            <div className="h-8 w-3/4 rounded bg-[#E2E2E2]" />
            <div className="h-6 w-28 rounded bg-[#E2E2E2]" />
            <div className="h-10 w-full rounded-full bg-[#E2E2E2]" />
            <div className="h-12 w-full rounded-full bg-[#E2E2E2]" />
            <div className="space-y-2 pt-2">
              <div className="h-3 w-full rounded bg-[#E2E2E2]" />
              <div className="h-3 w-5/6 rounded bg-[#E2E2E2]" />
              <div className="h-3 w-2/3 rounded bg-[#E2E2E2]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
