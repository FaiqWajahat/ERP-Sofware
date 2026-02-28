import { NextResponse } from "next/server";
import { cookies } from "next/headers"; 
import { jwtVerify } from "jose"; 
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/user";
import cloudinary from "@/lib/cloudinary";

export async function PUT(request) {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Authentication: Get Token from Cookie
    // FIX: Await cookies() for Next.js 15 compatibility
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
    } catch (err) {
      return NextResponse.json(
        { message: "Invalid or expired token", success: false },
        { status: 401 }
      );
    }

    // 4. Parse Form Data
    const formData = await request.formData();
    
    // UPDATED: Match your Schema fields
    const name = formData.get("name"); 
    const email = formData.get("email");
    const currentPassword = formData.get("currentPassword");
    const newPassword = formData.get("newPassword");
    
    // UPDATED: Expect 'profilePic' from frontend
    const profilePicFile = formData.get("profilePic"); 

    // 5. Find User
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { message: "User not found", success: false },
        { status: 404 }
      );
    }

    // 6. Handle Image Upload (Cloudinary)
    // UPDATED: Default to existing profilePic
    let profilePicUrl = user.profilePic; 

    if (profilePicFile && profilePicFile instanceof File) {
      const arrayBuffer = await profilePicFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload to Cloudinary
      const uploadResponse = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "seven_directions" }, 
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });

      profilePicUrl = uploadResponse.secure_url;
    }

    // 7. Handle Password Change
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return NextResponse.json(
          { message: "Current password is incorrect", success: false },
          { status: 400 }
        );
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    // 8. Update User Fields (Matching Schema)
    user.name = name || user.name;
    user.email = email || user.email;
    user.profilePic = profilePicUrl; // Update specific schema field

    // 9. Save Changes
    await user.save();

    // Remove password before sending back
    const userResponse = user.toObject();
    delete userResponse.password;

    return NextResponse.json({
      message: "Profile updated successfully",
      success: true,
      user: userResponse,
    });

  } catch (error) {
    console.error("Profile Update Error:", error);
    return NextResponse.json(
      { message: "Server Error", error: error.message, success: false },
      { status: 500 }
    );
  }
}