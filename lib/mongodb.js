// lib/mongodb.js — Singleton Mongoose connection for Next.js (App Router)
import mongoose from "mongoose";
import dns from "dns";

// Force IPv4 DNS resolution — fixes ECONNREFUSED on Windows where Node.js
// SRV lookups prefer IPv6 but the network only supports IPv4
dns.setDefaultResultOrder("ipv4first");

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in your .env.local file");
}

// Use a global cache to survive hot-reloads in dev
let cached = global._mongooseCache;
if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      family: 4, // Force IPv4 TCP connections
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
