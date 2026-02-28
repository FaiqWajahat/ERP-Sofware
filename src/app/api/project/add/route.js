import connectDB from "@/lib/mongodb";
import Project from "@/models/project";
import { NextResponse } from "next/server";

export async function PUT(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { 
      name, 
      clientName, 
      location, 
      startDate, 
      estimatedBudget, 
      status
    
    } = body;

    // 1. Basic Validation
    if (!name || !location ) {
      return NextResponse.json(
        { message: 'Project Name, Location, and Start Date are required.' },
        { status: 400 }
      );
    }

    // 2. DUPLICATE CHECK
    // Use regex for case-insensitive match (e.g., "Villa A" == "villa a")
    const existingProject = await Project.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
    });

    if (existingProject) {
      return NextResponse.json(
        { message: 'A project with this name already exists. Please choose a unique name.' },
        { status: 409 } // 409 Conflict status code
      );
    }

    // 3. Create the project
    const newProject = await Project.create({
      name: name.trim(),
      clientName: clientName?.trim(),
      location: location.trim(),
      startDate,
      estimatedBudget: Number(estimatedBudget),
     
      status: status || 'active',
    });

    return NextResponse.json({success:true, message:"project added",data:newProject}, { status: 201 });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { message: 'Failed to create project', error: error.message },
      { status: 500 }
    );
  }
}