import { NextResponse } from "next/server";

import Project from "@/models/project";
import connectDB from "@/lib/mongodb";

export async function GET() {
  try {
    await connectDB();

    // Fetch active projects
    const projects = await Project.find({status:"active"}).sort({ name: 1 }).lean();

    return NextResponse.json({
      success: true,
      projects: projects,
    });
  } catch (error) {
    console.error("GET Projects Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}