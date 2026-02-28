

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Employee from "@/models/employee";
import employeeExpense from "@/models/employeeExpenses";
import connectDB from "@/lib/mongodb";

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { employeeId, type, amount, date, description, status } = body;

    // Validation
    if (!employeeId || !type || !amount || !date || !description) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required",
        },
        { status: 400 }
      );
    }

    // Validate employeeId format
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid employee ID format",
        },
        { status: 400 }
      );
    }

    // Check if employee exists
    const employeeExists = await Employee.findById(employeeId);
    if (!employeeExists) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee not found",
        },
        { status: 404 }
      );
    }

    // Validate amount
    if (parseFloat(amount) <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Amount must be greater than 0",
        },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ["Loan", "Reimbursement", "Advance", "Other"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid expense type",
        },
        { status: 400 }
      );
    }

    // Create expense
    const expense = await employeeExpense.create({
      employeeId,
      type,
      amount: parseFloat(amount),
      date: new Date(date),
      description: description.trim(),
      status: status || "Pending",
    });

    // Populate employee details for response
    await expense.populate("employeeId", "name iqamaNumber role");

    return NextResponse.json(
      {
        success: true,
        message: "Expense created successfully",
        data: expense,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating expense:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((e) => e.message);
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create expense",
      },
      { status: 500 }
    );
  }
}