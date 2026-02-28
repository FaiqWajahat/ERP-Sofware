


import connectDB from "@/lib/mongodb";
import Employee from "@/models/employee";

import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
  try {
    // Connect to database
    await connectDB();

    // Get employee ID from params
    const { id } = await params;
   

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Employee ID is required" },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      name,
      iqamaNumber,
      phone,
      nationality,
      role,
      joiningDate,
      salary,
      status
    } = body;

    // ============================================
    // VALIDATION
    // ============================================

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Employee name is required" },
        { status: 400 }
      );
    }

    if (!iqamaNumber || !iqamaNumber.trim()) {
      return NextResponse.json(
        { success: false, message: "Iqama number is required" },
        { status: 400 }
      );
    }

    // Validate Iqama number format (exactly 10 digits)
    const iqamaRegex = /^\d{10}$/;
    if (!iqamaRegex.test(iqamaNumber.trim())) {
      return NextResponse.json(
        { success: false, message: "Iqama number must be exactly 10 digits" },
        { status: 400 }
      );
    }

    if (!nationality || !nationality.trim()) {
      return NextResponse.json(
        { success: false, message: "Nationality is required" },
        { status: 400 }
      );
    }

    if (!role || !role.trim()) {
      return NextResponse.json(
        { success: false, message: "Role/Position is required" },
        { status: 400 }
      );
    }

    // ============================================
    // CHECK IF EMPLOYEE EXISTS
    // ============================================

    const existingEmployee = await Employee.findById(id);

    if (!existingEmployee) {
      return NextResponse.json(
        { success: false, message: "Employee not found" },
        { status: 404 }
      );
    }

    // ============================================
    // CHECK FOR DUPLICATE IQAMA NUMBER
    // ============================================

    // Check if another employee has the same Iqama number (excluding current employee)
    const duplicateIqama = await Employee.findOne({
      iqamaNumber: iqamaNumber.trim(),
      _id: { $ne: id } // Exclude current employee
    });

    if (duplicateIqama) {
      return NextResponse.json(
        { 
          success: false, 
          message: "An employee with this Iqama number already exists" 
        },
        { status: 409 }
      );
    }

    // ============================================
    // PREPARE UPDATE DATA
    // ============================================

    const updateData = {
      name: name.trim(),
      iqamaNumber: iqamaNumber.trim(),
      nationality: nationality.trim(),
      role: role.trim(),
      status: status ?? true,
    };

    // Add optional fields only if provided
    if (phone && phone.trim()) {
      updateData.phone = phone.trim();
    } else {
      updateData.phone = ""; // Clear phone if empty
    }

    if (joiningDate) {
      updateData.joiningDate = new Date(joiningDate);
    } else {
      updateData.joiningDate = null; // Clear date if empty
    }

    if (salary !== undefined && salary !== null && salary !== "") {
      updateData.salary = Number(salary);
    } else {
      updateData.salary = 0;
    }

    // Add updatedAt timestamp
    updateData.updatedAt = new Date();

    // ============================================
    // UPDATE EMPLOYEE
    // ============================================

    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, // Return updated document
        runValidators: true // Run model validators
      }
    );

    if (!updatedEmployee) {
      return NextResponse.json(
        { success: false, message: "Failed to update employee" },
        { status: 500 }
      );
    }

    // ============================================
    // SUCCESS RESPONSE
    // ============================================

    return NextResponse.json(
      {
        success: true,
        message: "Employee updated successfully",
        employee: updatedEmployee
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error updating employee:", error);

    // Handle specific MongoDB errors
    if (error.name === "CastError") {
      return NextResponse.json(
        { success: false, message: "Invalid employee ID format" },
        { status: 400 }
      );
    }

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { success: false, message: errors.join(", ") },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        message: "Internal server error. Please try again later." 
      },
      { status: 500 }
    );
  }
}