import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Quotation from "@/models/quotation"; 

export async function GET(req) {
  try {
    await connectDB();
    // Fetch all quotations and sort by createdAt descending (newest first)
    // You can also sort by 'date' if you prefer: .sort({ date: -1 })
    const quotations = await Quotation.find({}).sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, quotations },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error fetching quotations:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch quotations" },
      { status: 500 }
    );
  }
}