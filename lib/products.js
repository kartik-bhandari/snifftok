/**
 * lib/products.js
 * Server-side fetch helpers for public product data from the API.
 * Used in Next.js Server Components and generateStaticParams.
 *
 * NOTE: Next.js Server Components can use fetch() with revalidation.
 *       We use { next: { revalidate: 60 } } so pages refresh every 60s
 *       without a full rebuild.
 */

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

/** Shape of a public product from /api/storefront/products */

/**
 * Fetch paginated product list.
 * @param {Object} params - search, category, tag, type, page, limit
 */
export async function fetchProducts(params = {}) {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v))
  })

  const res = await fetch(`${API}/api/storefront/products?${qs}`, {
    next: { revalidate: 60 },
  })

  if (!res.ok) return { data: [], total: 0, page: 1, totalPages: 0 }
  return res.json()
}

/**
 * Fetch a single product by slug.
 * Returns { product, related } or null if not found.
 */
export async function fetchProduct(slug) {
  const res = await fetch(`${API}/api/storefront/products/${slug}`, {
    next: { revalidate: 60 },
  })

  if (!res.ok) return null
  return res.json()
}
