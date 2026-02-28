import connectDB from "@/lib/mongodb";
import  Foreman from "@/models/foreman";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectDB();

    // 1. Parse the body
    const { 
      foremanId, 
      foremanName, 
      projectId, 
      projectName, 
      projectLocation 
    } = await request.json();

    // 2. Validation
    if (!foremanId || !projectId || !projectName) {
      return NextResponse.json(
        { success: false, message: "Foreman ID, Project ID, and Project Name are required." },
        { status: 400 }
      );
    }

    // 3. Prevent Duplicate Assignment
    // We check if this foreman is already assigned to this specific project
    const existingLink = await Foreman.findOne({ foremanId, projectId });
    if (existingLink) {
      return NextResponse.json(
        { success: false, message: "This project is already assigned to this foreman." },
        { status: 400 }
      );
    }

    // 4. Create the assignment document
    // The pre-save hook in your schema will handle totalSent, totalInvoiced, and remainingBalance
    const newAssignment = new Foreman({
      foremanId,
      foremanName,
      projectId,
      projectName,
      projectLocation: projectLocation || "",
      amountSent: [],
      invoicesReceived: []
    });

    await newAssignment.save();

    return NextResponse.json({
      success: true,
      message: "Project successfully linked to foreman",
      data: newAssignment
    }, { status: 201 });

  } catch (error) {
    console.error("ASSIGN_PROJECT_ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}