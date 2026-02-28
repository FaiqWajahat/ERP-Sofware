

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import employeeExpense from "@/models/employeeExpenses";

export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid expense ID format",
        },
        { status: 400 }
      );
    }

    // Find and delete expense
    const expense = await employeeExpense.findByIdAndDelete(id);

    if (!expense) {
      return NextResponse.json(
        {
          success: false,
          message: "Expense not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Expense deleted successfully",
      data: {
        _id: expense._id,
      },
    });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to delete expense",
      },
      { status: 500 }
    );
  }
}