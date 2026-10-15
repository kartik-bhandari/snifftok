// app/api/auth/me/route.js — GET current user from JWT cookie
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getTokenFromRequest, verifyToken, buildClearCookieHeader } from "@/lib/auth";

export async function GET(request) {
  const token = getTokenFromRequest(request);
  if (!token) {
    // No cookie = not logged in (not an error — return 200 with null user)
    return Response.json({ user: null }, { status: 200 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return Response.json(
      { user: null, error: "Session expired" },
      { status: 401, headers: { "Set-Cookie": buildClearCookieHeader() } }
    );
  }

  try {
    await connectDB();
    const user = await User.findById(payload.userId).select("-password");
    if (!user) {
      return Response.json({ user: null }, { status: 404 });
    }
    return Response.json({ user });
  } catch (err) {
    console.error("[me]", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// app/api/auth/logout — POST to clear the cookie
export async function POST() {
  return Response.json(
    { message: "Logged out" },
    { headers: { "Set-Cookie": buildClearCookieHeader() } }
  );
}
