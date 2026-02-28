

import connectDB from "@/lib/mongodb";
import Foreman from "@/models/foreman";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    // 1. Get the foremanId from the URL segments
    const { id: foremanId } = await params;

    if (!foremanId) {
      return NextResponse.json({ success: false, message: "Foreman ID is required" }, { status: 400 });
    }

    await connectDB();

    // 2. Search for assignments where foremanId matches the ID in the URL
    // We use .lean() for faster read-only performance
    const assignments = await Foreman.find({ foremanId: foremanId })
      .sort({ createdAt: -1 })
      .lean();

    // 3. Return the data in the format your frontend expects
    return NextResponse.json({
      success: true,
      message: "Projects fetched successfully",
      projects: assignments // This returns the array of projects for the table
    }, { status: 200 });

  } catch (error) {
    console.error("GET ASSIGNED PROJECTS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}