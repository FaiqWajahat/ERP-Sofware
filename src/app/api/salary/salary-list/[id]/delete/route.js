import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import SalaryList from "@/models/salaryList";
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Salary List ID is required" },
        { status: 400 }
      );
    }

    // Attempt to find and delete
    const deletedList = await SalaryList.findByIdAndDelete(id);

    if (!deletedList) {
      return NextResponse.json(
        { success: false, message: "Salary List not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "Salary List deleted successfully",
        data: deletedList 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error deleting salary list:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Internal Server Error", 
        error: error.message 
      },
      { status: 500 }
    );
  }
}