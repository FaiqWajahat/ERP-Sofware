import { NextResponse } from "next/server";
import SalaryList from "@/models/salaryList";
import connectDB from "@/lib/mongodb";

export async function PUT(request, { params }) {
  try {
    // 1. Initialize
    const { id } = await params;
    await connectDB();
    const body = await request.json();

    const { 
      projectId, 
      projectName, 
      foremanId, 
      foremanName, 
      date, 
      items // Frontend sends 'items'
    } = body;

    // 2. Basic Validation
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Salary List ID is missing" },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Employee list cannot be empty" },
        { status: 400 }
      );
    }

    // 3. DUPLICATE CHECK (Excluding Current Record)
    // Scenario: You are editing Sheet A. You change the date to "Feb 2024".
    // We must check if a Sheet B already exists for "Feb 2024" with this Project/Foreman.
    const queryDate = new Date(date);
    
    const existingDuplicate = await SalaryList.findOne({
      _id: { $ne: id }, // $ne = Not Equal to the current ID
      projectId: projectId,
      foremanId: foremanId,
      date: queryDate,
    });

    if (existingDuplicate) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Conflict: Another salary sheet for this Project, Foreman, and Month already exists." 
        },
        { status: 409 } 
      );
    }

    // 4. DATA MAPPING (Critical Step)
    // Mapping frontend state keys to Mongoose Schema keys
    const formattedEmployeeList = items.map((item) => ({
      employeeId: item.employeeId,
      employeeName: item.name,        // Frontend: 'name' -> Schema: 'employeeName'
      iqamaNumber: item.iqama,        // Frontend: 'iqama' -> Schema: 'iqamaNumber'
      salary: Number(item.salary),
      status: item.status || "pending",
    }));

    // 5. PERFORM UPDATE
    const updatedList = await SalaryList.findByIdAndUpdate(
      id,
      {
        projectId,
        projectName,
        foremanId,
        foremanName,
        date: queryDate,
        employeeList: formattedEmployeeList, // Save the mapped list
      },
      { 
        new: true,           // Return the updated document
        runValidators: true  // Ensure schema validation runs
      } 
    );

    if (!updatedList) {
      return NextResponse.json(
        { success: false, message: "Salary List not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "Salary List updated successfully", 
        data: updatedList 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error updating salary list:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update salary list",
        error: error.message,
      },
      { status: 500 }
    );
  }
}