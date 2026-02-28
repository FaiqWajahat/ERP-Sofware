import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Quotation from "@/models/quotation";

export async function POST(req) { // Using POST to send ID in body safely, or use GET with params
  try {
    await connectDB();
    const { quotationId } = await req.json();

    if (!quotationId) {
      return NextResponse.json(
        { success: false, message: "Quotation ID is required" },
        { status: 400 }
      );
    }

    const quotation = await Quotation.findById(quotationId);

    if (!quotation) {
      return NextResponse.json(
        { success: false, message: "Quotation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, quotation },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error fetching single quotation:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}