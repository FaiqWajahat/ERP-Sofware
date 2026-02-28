import { NextResponse } from "next/server";
import SalaryList from "@/models/salaryList";
import connectDB from "@/lib/mongodb"; // Ensure path matches your setup

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { 
      projectId, 
      projectName, 
      foremanId, 
      foremanName, 
      date, 
      items 
    } = body;

    // 1. Basic Validation
    if (!projectId || !foremanId || !date || !items || items.length === 0) {
      return NextResponse.json(
        { message: "Missing required fields or empty employee list.", success: false },
        { status: 400 }
      );
    }

    // 2. CHECK FOR DUPLICATES
    // We convert the incoming date string to a Date object to match MongoDB storage
    const queryDate = new Date(date);

    const existingList = await SalaryList.findOne({
      projectId: projectId,
      foremanId: foremanId,
      date: queryDate,
    });

    if (existingList) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Already added this list" 
        },
        { status: 409 } 
      );
    }

    // 3. Format Data
    const formattedEmployeeList = items.map((item) => ({
      employeeId: item.employeeId,
      employeeName: item.name, 
      iqamaNumber: item.iqama, 
      salary: Number(item.salary),
      status: item.status || "pending",
    }));

    // 4. Create the Document
    const newSalarySheet = await SalaryList.create({
      projectId,
      projectName,
      foremanId,
      foremanName,
      date: queryDate, 
      employeeList: formattedEmployeeList,
    });

    return NextResponse.json(
      { 
        success: true,
        message: "Salary list created successfully", 
        data: newSalarySheet 
      }, 
      { status: 201 }
    );

  } catch (error) {
    console.error("Error creating salary list:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}