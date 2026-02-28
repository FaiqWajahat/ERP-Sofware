import connectDB from "@/lib/mongodb";
import Project from "@/models/project";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const projects = await Project.find({}).sort({ createdAt: -1 }).limit(6);
    return NextResponse.json({success:true, message:"project fetched successfylly", data:projects},{status:201});
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch projects', error: error.message ,success:false},
      { status: 500 }
    );
  }
}