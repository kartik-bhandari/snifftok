/**
 * app/api/auth/[...path]/route.js
 * Proxies all /api/auth/* requests to the backend API.
 * Because this runs on the SAME domain as the storefront,
 * the session cookie is set/read as first-party — no cross-origin cookie issues.
 */

const API = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

// Headers that must NOT be forwarded — they'd conflict with the re-assembled body
const DROP_HEADERS = new Set([
  'host',
  'content-length',     // fetch recalculates from the body
  'transfer-encoding',  // we send a full body, not chunked
  'connection',
])

async function handler(req, { params }) {
  const path = (await params).path?.join('/') ?? ''
  const url  = `${API}/api/auth/${path}`

  // Read body for mutating methods
  let body = undefined
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    body = await req.text()
  }

  // Forward safe headers
  const headers = {}
  req.headers.forEach((val, key) => {
    if (!DROP_HEADERS.has(key.toLowerCase())) headers[key] = val
  })

  const upstream = await fetch(url, {
    method:  req.method,
    headers,
    body,
    redirect: 'manual',
  })

  // Copy response headers (including Set-Cookie)
  const resHeaders = {}
  upstream.headers.forEach((val, key) => {
    resHeaders[key] = val
  })

  const resBody = await upstream.arrayBuffer()

  return new Response(resBody, {
    status:  upstream.status,
    headers: resHeaders,
  })
}

export const GET    = handler
export const POST   = handler
export const PUT    = handler
export const PATCH  = handler
export const DELETE = handler
