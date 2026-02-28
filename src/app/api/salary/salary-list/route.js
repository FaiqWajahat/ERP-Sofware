import SalaryList from "@/models/salaryList";
import connectDB from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const salaryLists = await SalaryList.find().sort({ date: -1 });

    return NextResponse.json(
      {
        success: true,
        message: "Salary lists fetched successfully",
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
