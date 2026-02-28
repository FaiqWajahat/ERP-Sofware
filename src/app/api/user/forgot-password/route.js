import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import User from "@/models/user";
import { sendEmail } from "@/lib/nodemailer";


export async function POST(req) {
  try {
    await connectDB();
    
    const { email } = await req.json();

    // 1. Validation
    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    // 2. Find User
    const user = await User.findOne({ email });
    
    // Security: even if user not found, don't reveal it. 
    // But for this internal tool, we can return 404 if you prefer strict feedback.
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User with this email does not exist" },
        { status: 404 }
      );
    }

    // 3. Generate Token
    // Create a random hex string
    const resetToken = crypto.randomBytes(32).toString("hex");
    
    // Set expiry to 1 hour from now
    // logic: Current Time + 1 hour (3600000 ms)
    const resetTokenExpiry = new Date(Date.now() + 3600000);

    // 4. Save to Database
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // 5. Create Reset Link
    // ${process.env.NEXT_PUBLIC_APP_URL} should be http://localhost:3000 in dev
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #0056b3;">Password Reset Request</h2>
        <p>You requested a password reset for your Construction ERP account.</p>
        <p>Click the button below to set a new password:</p>
        <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px 0;">Reset Password</a>
        <p style="font-size: 12px; color: #666;">This link expires in 1 hour.</p>
        <p style="font-size: 12px; color: #666;">If you didn't request this, please ignore this email.</p>
      </div>
    `;

    // 6. Send Email
    const emailResponse = await sendEmail({
      to: user.email,
      subject: "Reset Your Password",
      html: emailHtml,
    });

    // Check if email failed to send
    if (!emailResponse.success) {
      return NextResponse.json(
        { success: false, message: "Failed to send email. Check server logs for details." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Reset link sent to your email",
    });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}