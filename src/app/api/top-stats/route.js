import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Employee from "@/models/employee";
import Project from "@/models/project";
import Asset from "@/models/companyAssets";


export async function GET() {
  try {
    await connectDB();

    // Run all 3 queries at the same time (Parallel Execution)
    const [employeeCount, projectCount, assetCount] = await Promise.all([
      Employee.countDocuments(),
      Project.countDocuments(),
      Asset.countDocuments(),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          employeeCount,
          projectCount,
          assetCount: assetCount, 
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching top stats:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch top stats",
        error: error.message,
      },
      { status: 500 }
    );
  }
}