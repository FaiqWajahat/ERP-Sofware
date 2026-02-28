import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import SalaryList from "@/models/salaryList";
import mongoose from "mongoose";

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = params;
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    // 1. Validation
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid Employee ID" },
        { status: 400 }
      );
    }

    // 2. Build Query
    // We are looking for documents where:
    // A. The employeeList array contains this specific employeeId
    // B. The date is within the requested range (if provided)
    const query = {
      "employeeList.employeeId": id,
    };

    if (from && to) {
      query.date = {
        $gte: new Date(from),
        $lte: new Date(to),
      };
    }

    // 3. Execute Query
    // .lean() converts Mongoose Documents to plain JS objects (faster)
    // .sort({ date: -1 }) shows newest records first
    const salarySheets = await SalaryList.find(query)
      .select("date projectName foremanName employeeList") 
      .sort({ date: -1 })
      .lean();

    // 4. Data Transformation
    // The query returns the *entire* salary sheet. We need to extract ONLY 
    // the specific employee's data from the 'employeeList' array.
    const employeeHistory = salarySheets.map((sheet) => {
      // Find the specific employee sub-document inside the array
      const workerDetails = sheet.employeeList.find(
        (emp) => emp.employeeId.toString() === id
      );

      // Return a flattened object for the frontend
      return {
        _id: sheet._id, // Sheet ID (useful for linking back)
        date: sheet.date,
        projectName: sheet.projectName,
        foremanName: sheet.foremanName,
        // Specifics for this employee:
        salary: workerDetails ? workerDetails.salary : 0,
        status: workerDetails ? workerDetails.status : "pending",
      };
    });

    return NextResponse.json(
      {
        success: true,
        count: employeeHistory.length,
        data: employeeHistory,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error fetching employee salary history:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}