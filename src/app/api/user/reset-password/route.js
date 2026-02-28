import { NextResponse } from "next/server";


import bcrypt from "bcryptjs";
import User from "@/models/user";
import connectDB from "@/lib/mongodb";


export async function POST(req) {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Parse the request body
    const { token, newPassword } = await req.json();

    // 3. Validation
    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Missing token or password" },
        { status: 400 }
      );
    }

    // 4. Find User by Token AND Check Expiry
    // We look for a user where:
    // - resetToken matches the one sent
    // - resetTokenExpiry is greater than ($gt) the current time (Date.now())
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token. Please request a new link." },
        { status: 400 }
      );
    }

    
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 6. Update User Record
    user.password = hashedPassword;
    user.resetToken = undefined;       // Remove the used token
    user.resetTokenExpiry = undefined; // Remove the expiry date
    
    // 7. Save changes
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    });

  } catch (error) {
    console.error("Reset Password API Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}