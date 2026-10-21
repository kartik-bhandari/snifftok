import React from "react";
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

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const data = await fetchProduct(slug);

  if (!data) notFound();

  const { product, related } = data;

  return <ProductDetailClient product={product} relatedProducts={related} />;
}
