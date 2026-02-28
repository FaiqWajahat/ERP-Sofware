import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import connectDB from "@/lib/mongodb";
import User from "@/models/user";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // 1. Connect to Database
    await connectDB();

    // 2. Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: "User not found", success: false },
        { status: 401 }
      );
    }

    // 3. Check Password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid password", success: false },
        { status: 401 }
      );
    }

    // 4. Generate JWT Token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const alg = "HS256";

    const token = await new SignJWT({ 
        
        userId: user._id.toString(),
        email: user.email,
        name: user.name ,
        role: user.role,
        profileImage:user.profileImage || ''
    })
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setExpirationTime("2h")
      .sign(secret);

    // 5. Create Response & Set Cookie
    // FIX: Create the response object FIRST
    const response = NextResponse.json(
      { message: "Login successfully", success: true },
      { status: 200 }
    );

    // FIX: Set the cookie on this specific response object
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7200, // 2 hours
      path: "/",
    });

    // FIX: Return the response object we just modified
    return response;

  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { message: "Server Error", error: error.message, success: false },
      { status: 500 }
    );
  }
}