import connectDB from "@/lib/mongodb";
import Foreman from "@/models/foreman"; 
import { NextResponse } from "next/server";

export async function DELETE(request) {
  try {
    await connectDB();

  
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Record ID is required" },
        { status: 400 }
      );
    }

    // Use findByIdAndDelete because we are providing the document's direct _id
    const deletedRecord = await Foreman.findByIdAndDelete(id);

    if (!deletedRecord) {
      return NextResponse.json(
        { success: false, message: "Record not found (ID mismatch)" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Project unassigned successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error during deletion" },
      { status: 500 }
    );
  }
}