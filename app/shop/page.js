import ShopListing from "@/components/ShopListing";
import { collectionFor } from "@/lib/collections";

export const metadata = {
  title:       "Shop All Fragrances | snifftok",
  description: "Browse every fragrance at snifftok.",
};

export default function ShopPage() {
  return <ShopListing collection={collectionFor(null)} />;
}
