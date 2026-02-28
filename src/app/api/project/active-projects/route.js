import Project from "@/models/project";
import connectDB from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const activeProjects = await Project.find({ status: "active" }).sort({ createdAt: -1 });
    return NextResponse.json(
        {
            success: true,
            message: "Active projects fetched successfully",
            data: activeProjects,
        },
        { status: 200 }
    );
  }
    catch (error) {
    console.error("Error fetching active projects:", error);
    return NextResponse.json(
        {
            success: false,
            message: "Failed to fetch active projects",
        },
        { status: 500 }

    );
  }
}
