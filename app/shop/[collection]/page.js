import { Suspense } from "react";
import { notFound } from "next/navigation";
import ShopListing, { ShopListingSkeleton } from "@/components/ShopListing";
import { COLLECTIONS, collectionFor } from "@/lib/collections";

/** /shop/new-arrivals, /shop/best-sellers, /shop/decants — all prerendered */
export function generateStaticParams() {
  return COLLECTIONS.filter((c) => c.slug).map((c) => ({ collection: c.slug }));
}

export async function generateMetadata({ params }) {
  const { collection: slug } = await params;
  const c = collectionFor(slug);
  if (!c?.slug) return { title: "Not Found | snifftok" };
  return { title: `${c.title} | snifftok`, description: c.description };
}

/**
 * `params` is read inside <Suspense> so client navigations show the skeleton
 * instantly instead of blocking.
 */
export default function CollectionPage({ params }) {
  return (
    <Suspense fallback={<ShopListingSkeleton />}>
      <CollectionContent params={params} />
    </Suspense>
  );
}

async function CollectionContent({ params }) {
  const { collection: slug } = await params;
  const collection = collectionFor(slug);
  if (!collection?.slug) notFound();
  return <ShopListing collection={collection} />;
}
