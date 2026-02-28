import connectDB from "@/lib/mongodb";
import Foreman from "@/models/foreman";

import { NextResponse } from "next/server";


export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    // Fetch the specific assignment record
    const ledger = await Foreman.findById(id);

    if (!ledger) {
      return NextResponse.json(
        { success: false, message: "Ledger record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: ledger },
      { status: 200 }
    );
  } catch (error) {
    console.error("Ledger Fetch Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}