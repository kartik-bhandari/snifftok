// app/api/auth/login/route.js
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { signToken, buildSetCookieHeader } from "@/lib/auth";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json({ error: "Email and password are required" }, { status: 400 });
    }

    await connectDB();

    // Find user and include password field (excluded by default)
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user) {
      return Response.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return Response.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = signToken({ userId: user._id, email: user.email, name: user.name });

    return Response.json(
      {
        user: { id: user._id, name: user.name, email: user.email },
        message: "Logged in successfully",
      },
      {
        status: 200,
        headers: { "Set-Cookie": buildSetCookieHeader(token) },
      }
    );
  } catch (err) {
    console.error("[login]", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
