import connectDB from "@/lib/mongodb";
import { Attendance } from "@/models/employeeAttendance";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view") || "month"; // 'month' or 'year'
    
    // Default to current date
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // 1-12

    let pipeline = [];

    if (view === "month") {
      // --- MONTH VIEW: Group by Day (1-31) ---
      // 1. Filter: Get records for the current month/year and only "Present" status
      const startDate = new Date(`${currentYear}-${currentMonth}-01`);
      const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);

      pipeline = [
        {
          $match: {
            date: { $gte: startDate, $lte: endDate },
            status: "Present", // Only count present employees
          },
        },
        {
          $group: {
            _id: { $dayOfMonth: "$date" }, // Group by Day 1, 2, 3...
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } }, // Sort by day
      ];
    } else {
      // --- YEAR VIEW: Group by Month (Jan-Dec) ---
      const startDate = new Date(`${currentYear}-01-01`);
      const endDate = new Date(`${currentYear}-12-31`);

      pipeline = [
        {
          $match: {
            date: { $gte: startDate, $lte: endDate },
            status: "Present",
          },
        },
        {
          $group: {
            _id: { $month: "$date" }, // Group by Month 1, 2, 3...
            count: { $sum: 1 }, // Total man-days per month
          },
        },
        { $sort: { _id: 1 } },
      ];
    }

    const results = await Attendance.aggregate(pipeline);

    // --- Format Data for Recharts ---
    let formattedData = [];

    if (view === "month") {
      // Fill in empty days (1 to 30/31) so the chart isn't broken
      const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        const record = results.find((r) => r._id === i);
        formattedData.push({
          name: i.toString(), // "1", "2", "3"
          present: record ? record.count : 0,
        });
      }
    } else {
      // Fill in empty months (Jan to Dec)
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      formattedData = monthNames.map((name, index) => {
        const record = results.find((r) => r._id === index + 1);
        return {
          name: name,
          present: record ? record.count : 0,
        };
      });
    }

    return NextResponse.json({ success: true, data: formattedData });

  } catch (error) {
    console.error("Chart API Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}