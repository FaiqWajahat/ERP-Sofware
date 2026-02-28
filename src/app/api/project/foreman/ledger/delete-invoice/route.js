
import connectDB from "@/lib/mongodb";
import Foreman from "@/models/foreman";
import Project from "@/models/project"; 
import mongoose from "mongoose"; // <--- IMPORT MONGOOSE
import { NextResponse } from "next/server";

export async function DELETE(request) {
  try {
    await connectDB();
    const { ledgerId, recordId } = await request.json(); // recordId is the invoice ID (String)

    if (!ledgerId || !recordId) return NextResponse.json({ success: false, message: "Missing data" }, { status: 400 });

    const ledger = await Foreman.findById(ledgerId);
    if (!ledger) return NextResponse.json({ success: false, message: "Ledger not found" }, { status: 404 });

    // 1. Remove from MAIN PROJECT using the ID (Safe & Exact)
    if (ledger.projectId) {
      
      // CRITICAL FIX: Convert the string ID to a MongoDB ObjectId
      // $pull requires exact type matching
      const linkedIdToPull = new mongoose.Types.ObjectId(recordId);

      await Project.findByIdAndUpdate(
        ledger.projectId,
        {
          $pull: { 
            expenses: { 
              linkedInvoiceId: linkedIdToPull 
            } 
          }
        }
      );
    }

    // 2. Remove from Foreman Ledger
    ledger.invoicesReceived.pull(recordId);
    await ledger.save();

    return NextResponse.json({ success: true, message: "Record deleted safely from Ledger and Project" }, { status: 200 });

  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}