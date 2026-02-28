import connectDB from "@/lib/mongodb";
import Foreman from "@/models/foreman"; 
import Project from "@/models/project"; 
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectDB();
    const { ledgerId, amount, invoiceNo, category, remarks, date } = await request.json();

    if (!ledgerId || !amount) return NextResponse.json({ success: false, message: "Missing data" }, { status: 400 });

    const ledger = await Foreman.findById(ledgerId);
    if (!ledger) return NextResponse.json({ success: false, message: "Ledger not found" }, { status: 404 });

    // 1. Create the Subdocument Object manually first
    // This allows us to access its _id immediately before saving
    const newInvoiceData = {
      amount: Number(amount),
      invoiceNo,
      category,
      remarks,
      date: new Date(date)
    };

    // Mongoose allows pushing the object, and it will assign an _id automatically.
    // However, to be safe, we push and then access the last item to get the ID.
    ledger.invoicesReceived.push(newInvoiceData);
    
    // We save the ledger first to ensure the invoice exists and has a permanent ID
    await ledger.save();

    // 2. Get the ID of the newly created invoice (it's the last one in the array)
    const createdInvoice = ledger.invoicesReceived[ledger.invoicesReceived.length - 1];

    // 3. Update the Main Project with the "Hard Link"
    if (ledger.projectId) {
      const expenseDescription = `${category} - ${remarks || ''} (Inv: ${invoiceNo}) - by ${ledger.foremanName}`;

      await Project.findByIdAndUpdate(
        ledger.projectId,
        {
          $push: {
            expenses: {
              description: expenseDescription,
              amount: Number(amount),
              date: new Date(date),
              linkedInvoiceId: createdInvoice._id // <--- THE HARD LINK
            }
          }
        }
      );
    }

    return NextResponse.json({ success: true, message: "Saved successfully", data: ledger }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}