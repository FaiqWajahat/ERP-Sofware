import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import SalaryList from "@/models/salaryList";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params; // Ensure params are awaited (Next.js 15+)

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Employee ID is required" },
        { status: 400 }
      );
    }

    // --- FIX START ---
    const draft = await SalaryList.findOne(
      {
        // Use $elemMatch to ensure BOTH conditions apply to the SAME sub-document
        employeeList: { 
          $elemMatch: { 
            employeeId: id, 
            status: "pending" 
          } 
        }
      },
      {
        projectId: 1,
        projectName: 1,
        date: 1,
        "employeeList.$": 1 // This projection now strictly follows the $elemMatch result
      }
    ).sort({ date: 1 }); // Oldest pending first
    // --- FIX END ---

    if (!draft) {
      return NextResponse.json(
        { success: false, message: "No pending salary record found" },
        { status: 200 } 
      );
    }

    const employeeData = draft.employeeList[0];

    const flattenedRecord = {
      salaryListId: draft._id, 
      projectId: draft.projectId,
      projectName: draft.projectName,
      date: draft.date,
      fromDate: draft.date, 
      toDate: draft.date,
      employeeId: employeeData.employeeId,
      employeeName: employeeData.employeeName,
      salary: employeeData.salary,
      status: employeeData.status,
    };

    return NextResponse.json({
      success: true,
      record: flattenedRecord,
    });

  } catch (error) {
    console.error("Error fetching draft salary:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}