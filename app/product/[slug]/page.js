import React from "react";
import { notFound } from "next/navigation";
import ProductDetailClient from "@/components/ProductDetailClient";
import productsData from "@/data/products.json";

export function generateStaticParams() {
  return productsData.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const product = productsData.find((p) => p.slug === resolvedParams.slug);
  if (!product) return { title: "Product Not Found | snifftok" };

  return {
    title: `${product.name} | snifftok`,
    description: product.headline || product.description,
  };
}

export default async function ProductPage({ params }) {
  const resolvedParams = await params;
  const product = productsData.find((p) => p.slug === resolvedParams.slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = productsData
    .filter((p) => p.slug !== product.slug)
    .slice(0, 4);

  return (
    <ProductDetailClient
      product={product}
      relatedProducts={relatedProducts}
    />
  );
}
