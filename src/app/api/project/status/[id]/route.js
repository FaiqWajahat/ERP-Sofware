import { NextResponse } from "next/server";


import connectDB from "@/lib/mongodb";
import Project from "@/models/project";




export async function PATCH(req, { params }) {
  try {
    connectDB();
    
    const { id } = await params;

    
    const reqBody = await req.json();
    const { status } = reqBody;

   
    if (!status) {
      return NextResponse.json(
        { success: false, message: "Status is required" },
        { status: 400 }
      );
    }

   
    const updatedProject = await Project.findByIdAndUpdate(
      id,
      { status: status },
      { new: true }
    );

    // 4. Check if project existed
    if (!updatedProject) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      );
    }

    // 5. Return success response
    return NextResponse.json({
      success: true,
      message: "Project status updated successfully",
      data: updatedProject,
    });

  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}