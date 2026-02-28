
import connectDB from '@/lib/mongodb';
import Project from '@/models/project';
import { NextResponse } from 'next/server';

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Project ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { description, amount, date } = body;

    // Basic validation
    if (!description || !amount || !date) {
      return NextResponse.json(
        { success: false, message: "Description, amount, and date are required" },
        { status: 400 }
      );
    }

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      {
        $push: {
          expenses: {
            description,
            amount,
            date,
            createdAt: new Date()
          }
        }
      },
      { new: true }
    );

    if (!updatedProject) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Expense added successfully",
      data: updatedProject
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
