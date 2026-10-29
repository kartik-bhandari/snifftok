/**
 * lib/categories.js
 * Server-side fetch helpers for the 5 scent families (Floral, Amber, Woody,
 * Fresh, Gourmand). The API is the source of truth — the admin panel uses the
 * same categories.
 */

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

/** All families in display order, each with `productCount`. Returns [] on error. */
export async function fetchCategories() {
  const res = await fetch(`${API}/api/storefront/categories`, {
    next: { revalidate: 60 },
  })
  if (!res.ok) return []
  const json = await res.json()
  return json.data ?? []
}

/** One family by slug, or null if it doesn't exist. */
export async function fetchCategory(slug) {
  const res = await fetch(`${API}/api/storefront/categories/${encodeURIComponent(slug)}`, {
    next: { revalidate: 60 },
  })
  if (!res.ok) return null
  const json = await res.json()
  return json.data ?? null
}
