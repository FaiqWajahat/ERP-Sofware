import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import SalaryList from "@/models/salaryList";
import mongoose from "mongoose";

export async function GET(request, { params }) {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Extract ID and Search Params
    const { id } = await params; // This is the Employee ID
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from"); // "YYYY-MM"
    const to = searchParams.get("to");     // "YYYY-MM"

    // 3. Validation
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid Employee ID" },
        { status: 400 }
      );
    }

    // 4. Build the Database Query
    // We are searching for SalaryList documents that satisfy two conditions:
    // A. The 'employeeList' array contains an item with this 'employeeId'
    // B. The 'date' falls within the requested range (if provided)
    const query = {
      "employeeList.employeeId": id,
    };

    if (from && to) {
      // Create date objects for the start and end of the range
      // "2024-01" becomes 2024-01-01
      const startDate = new Date(from);
      
      // For the end date, we accept the input. 
      // Note: A simpler comparison usually works fine for salary months.
      const endDate = new Date(to);

      query.date = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    // 5. Execute Query
    // .lean() is crucial here: it gives us plain JS objects, which are faster to process
    const salarySheets = await SalaryList.find(query)
      .select("date projectName foremanName employeeList") // Fetch only necessary fields
      .sort({ date: -1 }) // Sort by newest first
      .lean();

    // 6. Data Transformation (CRITICAL STEP)
    // The query returns the *entire* salary sheet (with all employees).
    // We need to loop through the results and extract ONLY this specific employee's data.
    const employeeHistory = salarySheets.map((sheet) => {
      
      // Find the specific sub-document for this employee inside the array
      const workerDetails = sheet.employeeList.find(
        (emp) => emp.employeeId.toString() === id
      );

      // Return a clean, flattened object for the frontend
      return {
        _id: sheet._id, // The ID of the salary sheet
        date: sheet.date,
        projectName: sheet.projectName,
        foremanName: sheet.foremanName,
        // Extracted details specific to this employee:
        salary: workerDetails ? workerDetails.salary : 0,
        status: workerDetails ? workerDetails.status : "pending",
        iqamaNumber: workerDetails ? workerDetails.iqamaNumber : "N/A"
      };
    });

    // 7. Return Response
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
      { 
        success: false, 
        message: "Internal Server Error", 
        error: error.message 
      },
      { status: 500 }
    );
  }
}