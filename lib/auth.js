// lib/auth.js — JWT helpers for signing & verifying tokens via httpOnly cookies
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = "snifftok_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

if (!JWT_SECRET) {
  throw new Error("Please define JWT_SECRET in your .env.local file");
}

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// Read the auth token from the request cookie header (for Route Handlers)
export function getTokenFromRequest(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  return match ? match[1] : null;
}

// Build a Set-Cookie header string that sets the auth token
export function buildSetCookieHeader(token) {
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}`;
}

// Build a Set-Cookie header that clears the auth token
export function buildClearCookieHeader() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}
