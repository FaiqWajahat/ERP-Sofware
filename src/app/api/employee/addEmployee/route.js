import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Employee from "@/models/employee";


export async function POST(request) {
  try {
    // Connect to database
    await connectDB();

    // Parse request body
    const body = await request.json();
    const { name, iqamaNumber, phone, nationality, role, joiningDate, salary, status } = body;

    // Validate required fields
    if (!name || !iqamaNumber || !nationality || !role) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate Iqama number (must be 10 digits)
    if (!/^\d{10}$/.test(iqamaNumber)) {
      return NextResponse.json(
        { success: false, message: "Iqama number must be exactly 10 digits" },
        { status: 400 }
      );
    }

    // Check if employee with this Iqama number already exists
    const existingEmployee = await Employee.findOne({ iqamaNumber });
    if (existingEmployee) {
      return NextResponse.json(
        { success: false, message: "Employee with this Iqama number already exists" },
        { status: 409 }
      );
    }

    // Create new employee
    const newEmployee = await Employee.create({
      name: name.trim(),
      iqamaNumber: iqamaNumber.trim(),
      phone: phone?.trim() || "",
      nationality: nationality.trim(),
      role: role.trim(),
      joiningDate: joiningDate || null,
      salary: salary || 0.00,
      status: status !== undefined ? status : true
    });

    return NextResponse.json(
      { 
        success: true, 
        message: "Employee added successfully",
        data: newEmployee 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error adding employee:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to add employee",
        error: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    // Connect to database
    await connectDB();

    // Get all employees, sorted by creation date (newest first)
    const employees = await Employee.find({}).sort({ createdAt: -1 });

    return NextResponse.json(
      { 
        success: true, 
        count: employees.length,
        data: employees 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error fetching employees:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch employees",
        error: error.message 
      },
      { status: 500 }
    );
  }
}