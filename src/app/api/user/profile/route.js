import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import connectDB from "@/lib/mongodb";
import User from "@/models/user";

export async function GET(request) {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Get Token from Cookie
    // FIX 1: You must AWAIT cookies() in Next.js 15
    const cookieStore = await cookies(); 
    const token = cookieStore.get("auth_token");

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized. Please login.", success: false },
        { status: 401 }
      );
    }

    // 3. Verify Token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    let userId;

    try {
      const { payload } = await jwtVerify(token.value, secret);
      userId = payload.userId;
      
      // FIX 2: Handle "Dirty" ID from JWT (The CastError Fix)
      // If userId came back as an object (Buffer) instead of a string, we cannot use it.
      if (typeof userId === 'object' && userId !== null) {
        console.error("JWT Error: userId in token is an Object, not a String. Check your Login API.");
        // Attempt to convert to string if possible, otherwise fail gracefully
        userId = userId.toString(); 
        
        // If conversion results in "[object Object]", the token is invalid for Mongoose
        if (userId === "[object Object]") {
             return NextResponse.json(
                { message: "Token data invalid. Please Logout and Login again.", success: false },
                { status: 401 }
             );
        }
      }

    } catch (err) {
      console.error("Token verification failed:", err);
      return NextResponse.json(
        { message: "Invalid or expired token", success: false },
        { status: 401 }
      );
    }

    // 4. Find User
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return NextResponse.json(
        { message: "User not found", success: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: user,
    });

  } catch (error) {
    console.error("Profile Fetch Error:", error);
    return NextResponse.json(
      { message: "Server Error", error: error.message, success: false },
      { status: 500 }
    );
  }
}