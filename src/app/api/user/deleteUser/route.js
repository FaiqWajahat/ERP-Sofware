import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/user";

export async function DELETE(request) {
    try {
        await connectDB();
        const { userId } = await request.json();
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return NextResponse.json(
                { message: "User not found", sucess: false },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { message: "User deleted successfully", user: deletedUser, sucess: true },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json(
            { message: "Error deleting user", error: error.message, sucess: false },
            { status: 500 }
        );
    }
}
