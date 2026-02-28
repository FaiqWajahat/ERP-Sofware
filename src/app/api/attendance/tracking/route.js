import connectDB from "@/lib/mongodb";
import { Attendance } from "@/models/employeeAttendance";
import { NextResponse } from "next/server";


export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (!employeeId || !from || !to) {
      return NextResponse.json(
        { success: false, message: "Missing parameters" },
        { status: 400 }
      );
    }

    // Convert strings to Date objects for comparison
    const startDate = new Date(from);
    const endDate = new Date(to);
    // Set endDate to end of day to include records on that day
    endDate.setHours(23, 59, 59, 999);

    const records = await Attendance.find({
      employeeId: employeeId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: -1 }); // Newest first

    return NextResponse.json({
      success: true,
      data: records,
    });
  } catch (error) {
    console.error("Tracking Data Error:", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}