import { NextResponse } from "next/server";

import Employee from "@/models/employee";
import connectDB from "@/lib/mongodb";


export async function GET() {
  try {
    await connectDB();

    // Fetch all employees, sorted by name
    const employees = await Employee.find({status:true}).sort({ name: 1 }).lean();

    return NextResponse.json({
      success: true,
      employees: employees,
    });
  } catch (error) {
    console.error("GET Employees Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch employees" },
      { status: 500 }
    );
  }
}