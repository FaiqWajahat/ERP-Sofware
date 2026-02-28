import connectDB from "@/lib/mongodb";
import Foreman from "@/models/foreman";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectDB();

    const { ledgerId, amount, paymentMode, referenceNo, remarks, date } = await request.json();

    // 1. Validation
    if (!ledgerId || !amount) {
      return NextResponse.json(
        { success: false, message: "Ledger ID and Amount are required" },
        { status: 400 }
      );
    }

    // 2. Find the Ledger Document
    const ledger = await Foreman.findById(ledgerId);

    if (!ledger) {
      return NextResponse.json(
        { success: false, message: "Ledger record not found" },
        { status: 404 }
      );
    }

    // 3. Push the new Cash Entry
    ledger.amountSent.push({
      amount: Number(amount),
      paymentMode,
      referenceNo,
      remarks,
      date: new Date(date)
    });

    // 4. Save (This triggers your pre('save') hook to recalculate totals)
    await ledger.save();

    return NextResponse.json(
      { success: true, message: "Cash added successfully", data: ledger },
      { status: 200 }
    );

  } catch (error) {
    console.error("Add Cash Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error while adding cash" },
      { status: 500 }
    );
  }
}