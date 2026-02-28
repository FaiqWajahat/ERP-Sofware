// app/api/employee/getEmployee/[id]/route.js
import connectDB from "@/lib/mongodb";
import Employee from "@/models/employee";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    // Connect to database
    await connectDB();

    // Get employee ID from params
    const { id } = await params;

    // Validate ID
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee ID is required",
        },
        { status: 400 }
      );
    }

    // Find employee by ID
    const employee = await Employee.findById(id);

    // Check if employee exists
    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee not found",
        },
        { status: 404 }
      );
    }

    // Return employee data
    return NextResponse.json(
      {
        success: true,
        message: "Employee fetched successfully",
        employee: {
          _id: employee._id,
          name: employee.name,
          iqamaNumber: employee.iqamaNumber,
          phone: employee.phone,
          nationality: employee.nationality,
          role: employee.role,
          joiningDate: employee.joiningDate,
          salary: employee.salary,
          status: employee.status,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching employee:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch employee data",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
