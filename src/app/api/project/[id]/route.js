import connectDB from '@/lib/mongodb';
import Project from '@/models/project';
import { NextResponse } from 'next/server';


export async function DELETE(request, { params }) {
  try {
    await connectDB();

    // The 'id' comes from the folder name [id]
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Find and delete the project in one go
    const deletedProject = await Project.findByIdAndDelete(id);

    if (!deletedProject) {
      return NextResponse.json(
        { message: 'Project not found', success:false },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Project deleted successfully', success:true },
      { status: 200 }
    );

  } catch (error) {
    console.error("Delete API Error:", error);
    return NextResponse.json(
      { message: 'Failed to delete project',success:false,  error: error.message },
      { status: 500 }
    );
  }
}