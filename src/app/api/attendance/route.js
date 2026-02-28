import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { Attendance } from "@/models/employeeAttendance";
import connectDB from "@/lib/mongodb";


export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date"); // Format: YYYY-MM-DD

    if (!dateParam) {
      return NextResponse.json(
        { success: false, message: "Date is required" },
        { status: 400 }
      );
    }

    // Convert string date to Date object (UTC midnight)
    // matches how we save it in POST
    const queryDate = new Date(dateParam);

    const records = await Attendance.find({ date: queryDate }).lean();

    return NextResponse.json({
      success: true,
      marked: records.length > 0,
      records: records,
    });
  } catch (error) {
    console.error("GET Attendance Error:", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}

// POST: Save or Update (Batch Operation)
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { date, attendance } = body;

    // Validation
    if (!date || !Array.isArray(attendance) || attendance.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid payload data" },
        { status: 400 }
      );
    }

    const targetDate = new Date(date); // Ensures YYYY-MM-DD becomes UTC midnight

    // Construct Bulk Operations
    // We use 'updateOne' with 'upsert: true'. 
    // This creates the record if it doesn't exist, or updates it if it does.
    const bulkOps = attendance.map((record) => {
      // Safety check: ensure projectId is null if it's strictly not present/valid
      // to prevent CastErrors on ObjectId
      const safeProjectId = mongoose.Types.ObjectId.isValid(record.projectId) 
        ? record.projectId 
        : null;

      return {
        updateOne: {
          filter: { 
            employeeId: record.employeeId, 
            date: targetDate 
          },
          update: {
            $set: {
              employeeName: record.employeeName, // Snapshotting name
              iqama: record.iqama,               // Snapshotting iqama
              status: record.status,
              projectId: safeProjectId,
              projectName: record.projectName || "No project",
            },
          },
          upsert: true, // Crucial for "Edit Mode"
        },
      };
    });

    // Execute Bulk Write
    await Attendance.bulkWrite(bulkOps);

    return NextResponse.json({
      success: true,
      message: "Attendance saved successfully",
    });

  } catch (error) {
    console.error("POST Attendance Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}