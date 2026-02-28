import connectDB from "@/lib/mongodb";
import { Attendance } from "@/models/employeeAttendance";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get("year");
    const monthParam = searchParams.get("month"); // e.g., "January"

    if (!yearParam || !monthParam) {
      return NextResponse.json(
        { success: false, message: "Year and Month are required" },
        { status: 400 }
      );
    }

    const year = parseInt(yearParam);
    
    // Map month name to index (0-11)
    const monthMap = {
      "January": 0, "February": 1, "March": 2, "April": 3, "May": 4, "June": 5,
      "July": 6, "August": 7, "September": 8, "October": 9, "November": 10, "December": 11
    };

    const monthIndex = monthMap[monthParam];

    if (monthIndex === undefined) {
      return NextResponse.json(
        { success: false, message: "Invalid month name" },
        { status: 400 }
      );
    }

    // Create Date Range (UTC to avoid timezone issues)
    const startDate = new Date(Date.UTC(year, monthIndex, 1));
    // Setting day to 0 of next month gets the last day of current month
    const endDate = new Date(Date.UTC(year, monthIndex + 1, 0, 23, 59, 59));

    // Fetch records
    const records = await Attendance.find({
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: -1 }); // Sort newest first

    return NextResponse.json({
      success: true,
      records: records,
    });

  } catch (error) {
    console.error("Month Attendance API Error:", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}