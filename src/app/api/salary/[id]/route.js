import { NextResponse } from "next/server";

import EmployeeSalary from "@/models/employeeSalary";
import connectDB from "@/lib/mongodb";



export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params; // employeeId from URL

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Employee ID is required" },
        { status: 400 }
      );
    }

    // Fetch all salary records for this employee, sorted by latest first
    const salaryRecords = await EmployeeSalary.find({ employeeId: id })
      .sort({ createdAt: -1, fromDate: -1 }) // Latest records first
      .populate("employeeId", "name iqamaNumber role salary")
      .lean(); // Convert to plain JavaScript objects for better performance

    

    return NextResponse.json(
      {
        success: true,
        message: "Salary records fetched successfully",
        data: salaryRecords,
        count: salaryRecords.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching salary records:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch salary records",
      },
      { status: 500 }
    );
  }
}