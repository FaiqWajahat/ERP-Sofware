import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/user";
import bcrypt from "bcryptjs"; 

export async function POST(request) {
  try {
    await connectDB();
    const { name, email, password, role } = await request.json();
      
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists", sucess: false },
        { status: 400 }
      );
    }

    // --- HASHING LOGIC START ---
    // 1. Generate a "salt" (random data to make the hash unique)
    const salt = await bcrypt.genSalt(10);
    // 2. Hash the plain password with the salt
    const hashedPassword = await bcrypt.hash(password, salt);
    // --- HASHING LOGIC END ---

    const newUser = new User({
      name,
      email,
      role,
      password: hashedPassword, // Store the HASHED password, not the plain one
    });

    await newUser.save();

    return NextResponse.json(
      { message: "User created successfully", user: newUser, sucess: true },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { message: "Error creating user", error: error.message, sucess: false },
      { status: 500 }
    );
  }
}   