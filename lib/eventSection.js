/**
 * lib/eventSection.js
 * The special event / offer section, managed from the admin panel
 * (Event Section page). Returns null when it's switched off.
 */

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

export async function fetchEventSection() {
  try {
    const res = await fetch(`${API}/api/storefront/event-section`, {
      next: { revalidate: 30 },   // turning it on/off shows within ~30s
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.enabled && data.products?.length ? data : null
  } catch {
    return null   // never break the home page over this section
  }
}
