import SalaryList from "@/models/salaryList";
import connectDB from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {

    const { id } = await params;
  try {
    await connectDB();
    const salaryLists = await SalaryList.findById(id);

    if (!salaryLists) { 
    return NextResponse.json(
        {
            success: false,
            message: "Salary List not found",
        },
        { status: 404 }
    );
    }
    return NextResponse.json(
        {
            success: true,
            message: "Salary List fetched successfully",
            data: salaryLists,
        },
        { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching salary lists:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch salary lists",
      },
      { status: 500 }
    );
  }
}

