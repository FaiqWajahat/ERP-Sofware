
import connectDB from "@/lib/mongodb";
import Employee from "@/models/employee";

import { NextResponse } from "next/server";



export async function GET() {
  try {
    // Connect to database
    await connectDB();

    // Get all employees, sorted by creation date (newest first)
    const employees = await Employee.find({}).sort({ createdAt: -1 });

    return NextResponse.json(
      { 
        success: true, 
        count: employees.length,
        employees: employees 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error fetching employees:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch employees",
        error: error.message 
      },
      { status: 500 }
    );
  }
}