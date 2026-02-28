import connectDB from "@/lib/mongodb";
import Employee from "@/models/employee";
import { NextResponse } from "next/server";

export async function DELETE(request) {
  try {
    await connectDB();

    const { employeeId } = await request.json();

    if (!employeeId) {
      return NextResponse.json(
        { success: false, message: "Employee ID is required" },
        { status: 400 }
      );
    }

    // Delete employee by employeeId field
    const deletedEmployee = await Employee.findByIdAndDelete( employeeId );

    if (!deletedEmployee) {
      return NextResponse.json(
        { success: false, message: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Employee deleted successfully",
        data: deletedEmployee,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error deleting employee:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete employee",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
