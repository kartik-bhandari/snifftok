/**
 * app/api/auth/[...path]/route.js
 * Proxies all /api/auth/* requests to the backend API.
 * Because this runs on the SAME domain as the storefront,
 * the session cookie is set/read as first-party — no cross-origin cookie issues.
 */

const API = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

async function handler(req, { params }) {
  const path = (await params).path?.join('/') ?? ''
  const url  = `${API}/api/auth/${path}`

  // Forward the incoming request body
  let body = undefined
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    body = await req.text()
  }

  // Forward all headers except host
  const headers = {}
  req.headers.forEach((val, key) => {
    if (key.toLowerCase() !== 'host') headers[key] = val
  })

  const upstream = await fetch(url, {
    method:  req.method,
    headers,
    body,
    // Don't follow redirects — proxy them raw
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
