import connectDB from "@/lib/mongodb";
import { Attendance } from "@/models/employeeAttendance";
import { NextResponse } from "next/server";


export async function GET(request) {
  try {
    await connectDB();

    // 1. Get the year from the URL query parameters
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get("year");

    if (!yearParam) {
      return NextResponse.json(
        { success: false, message: "Year is required" },
        { status: 400 }
      );
    }

    const year = parseInt(yearParam);

    // 2. Define the date range (Jan 1st to Dec 31st of selected year)
    // We use Date.UTC to ensure we don't miss records due to timezone offsets
    const startDate = new Date(Date.UTC(year, 0, 1)); 
    const endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59));

    // 3. Run the Aggregation Pipeline
    const stats = await Attendance.aggregate([
      {
        // Filter records for the specific year
        $match: {
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        // Group by Month
        $group: {
          _id: { $month: "$date" }, // Returns month number (1 = Jan, 2 = Feb...)
          present: {
            $sum: {
              $cond: [{ $eq: ["$status", "Present"] }, 1, 0],
            },
          },
          absent: {
            $sum: {
              $cond: [{ $eq: ["$status", "Absent"] }, 1, 0],
            },
          },
          leave: {
            $sum: {
              $cond: [{ $eq: ["$status", "Leave"] }, 1, 0],
            },
          },
        },
      },
      {
        // Sort by month (Jan -> Dec)
        $sort: { _id: 1 },
      },
    ]);

    // 4. Map the numeric month IDs to Month Names for the frontend
    const monthNames = [
      "", "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const formattedData = stats.map((item) => ({
      month: monthNames[item._id], // Convert "1" to "January"
      present: item.present,
      absent: item.absent,
      leave: item.leave,
    }));

    return NextResponse.json({
      success: true,
      data: formattedData,
    });

  } catch (error) {
    console.error("Stats API Error:", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}