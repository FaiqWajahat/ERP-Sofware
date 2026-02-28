import connectDB from "@/lib/mongodb";
import Foreman from "@/models/foreman";
import { NextResponse } from "next/server";

export async function DELETE(request) {
  try {
    await connectDB();
    const { ledgerId, recordId } = await request.json();

    if (!ledgerId || !recordId) return NextResponse.json({ success: false, message: "Missing data" }, { status: 400 });

    const updatedLedger = await Foreman.findByIdAndUpdate(
      ledgerId,
      { $pull: { amountSent: { _id: recordId } } },
      { new: true }
    );

    if (!updatedLedger) return NextResponse.json({ success: false, message: "Ledger not found" }, { status: 404 });

    await updatedLedger.save(); // Trigger pre-save calculation

    return NextResponse.json({ success: true, message: "Cash deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}