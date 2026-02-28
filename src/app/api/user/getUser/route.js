import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/user";

export async function GET(request) {
    try {
        await connectDB();
        const users = await User.find();
        return NextResponse.json(
            { message: "Users fetched successfully", users: users, sucess: true },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { message: "Error fetching users", error: error.message, sucess: false },
            { status: 500 }
        );
    }
}