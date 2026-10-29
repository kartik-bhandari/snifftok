/**
 * lib/collections.js
 * The shop listing pages — /shop plus one page per home-page section.
 * `query` is passed straight to /api/storefront/products.
 */

export const PAGE_SIZE = 24;

export const COLLECTIONS = [
  {
    slug:        null,            // /shop
    label:       "All",
    title:       "All fragrances",
    description: "Every bottle we carry, A to Z.",
    query:       { sort: "name" },
  },
  {
    slug:        "new-arrivals",
    label:       "New arrivals",
    title:       "New arrivals",
    description: "Fresh additions to the collection.",
    query:       { tag: "new", sort: "newest" },   // same "new" tag as the home page section
  },
  {
    slug:        "best-sellers",
    label:       "Best sellers",
    title:       "Best sellers",
    description: "The fragrances our customers keep coming back for.",
    query:       { tag: "best-seller" },
  },
  {
    slug:         "decants",
    label:        "Decants",
    title:        "Decants",
    description:  "Try before the full bottle — every decant currently in stock.",
    query:        { type: "tester", inStock: "true" },
    preferDecant: true,           // product links open on the Decant tab
  },
];

export const hrefFor = (c) => (c.slug ? `/shop/${c.slug}` : "/shop");

export function collectionFor(slug) {
  return COLLECTIONS.find((c) => c.slug === (slug ?? null)) ?? null;
}
