// app/api/auth/register/route.js
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { signToken, buildSetCookieHeader } from "@/lib/auth";

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    // Basic validation
    if (!name || !email || !password) {
      return Response.json({ error: "All fields are required" }, { status: 400 });
    }
    if (password.length < 6) {
      return Response.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    await connectDB();

    // Check if user already exists
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return Response.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    // Create user (password is hashed by the pre-save hook in the model)
    const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), password });

    // Issue JWT
    const token = signToken({ userId: user._id, email: user.email, name: user.name });

    return Response.json(
      {
        user: { id: user._id, name: user.name, email: user.email },
        message: "Account created successfully",
      },
      {
        status: 201,
        headers: { "Set-Cookie": buildSetCookieHeader(token) },
      }
    );
  } catch (err) {
    console.error("[register]", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
