/**
 * app/api/auth/[...path]/route.js
 * Proxies /api/auth/* to the backend — runs on the storefront domain so the
 * session cookie is set/read as first-party (no cross-origin cookie issues).
 */

const API = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

// Log on first load so we can confirm the env var is set in Render logs
console.log('[auth-proxy] target API:', API)

async function handler(req, { params }) {
  const path   = (await params).path?.join('/') ?? ''
  const search = new URL(req.url).search ?? ''
  const url    = `${API}/api/auth/${path}${search}`

  // ── Read body ────────────────────────────────────────────────────────────────
  let body = undefined
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    body = await req.text()
  }

  // ── Build request headers — only forward what the API needs ──────────────────
  const reqHeaders = {
    'content-type':    req.headers.get('content-type') ?? 'application/json',
    'x-requested-with': req.headers.get('x-requested-with') ?? 'snifftok-web',
  }
  const cookie = req.headers.get('cookie')
  if (cookie) reqHeaders['cookie'] = cookie

  // ── Forward to upstream API ──────────────────────────────────────────────────
  let upstream
  try {
    upstream = await fetch(url, {
      method:  req.method,
      headers: reqHeaders,
      body,
    })
  } catch (err) {
    console.error('[auth-proxy] upstream error:', err)
    return new Response(JSON.stringify({ message: 'API unavailable' }), {
      status:  502,
      headers: { 'content-type': 'application/json' },
    })
  }

  // ── Build response headers — only forward what the client needs ───────────────
  const resHeaders = {
    'content-type': upstream.headers.get('content-type') ?? 'application/json',
  }

  // Forward all Set-Cookie headers (session cookie)
  const raw = upstream.headers.raw?.()
  if (raw?.['set-cookie']) {
    resHeaders['set-cookie'] = raw['set-cookie'].join(', ')
  } else {
    const sc = upstream.headers.get('set-cookie')
    if (sc) resHeaders['set-cookie'] = sc
  }

  const resBody = await upstream.text()

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
