import connectDB from '@/lib/mongodb';
import Project from '@/models/project';
import { NextResponse } from 'next/server';



export async function PUT(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { 
      projectId, // ID passed from frontend
      name, 
      clientName, 
      location, 
      startDate, 
      estimatedBudget, 
      status 
    } = body;

    // 1. Validation
    if (!projectId) {
      return NextResponse.json(
        { success: false, message: 'Project ID is required' },
        { status: 400 }
      );
    }

    if (!name || !location) {
        return NextResponse.json(
          { success: false, message: 'Project Name and Location are required' },
          { status: 400 }
        );
    }

    // 2. Find and Update
    // { new: true } ensures we get the updated document back
    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      {
        name,
        clientName,
        location,
        startDate: new Date(startDate), // Ensure valid Date object
        estimatedBudget: Number(estimatedBudget), // Ensure valid Number
        status
      },
      { new: true, runValidators: true }
    );

    if (!updatedProject) {
      return NextResponse.json(
        { success: false, message: 'Project not found' },
        { status: 404 }
      );
    }

    // 3. Success Response
    return NextResponse.json(
      { 
        success: true, 
        message: 'Project updated successfully', 
        data: updatedProject 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}