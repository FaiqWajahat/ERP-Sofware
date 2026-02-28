import connectDB from "@/lib/mongodb";
import EmployeeSalary from "@/models/employeeSalary";
import employeeExpense from "@/models/employeeExpenses"; 
import SalaryList from "@/models/salaryList"; // Ensure this model file exists
import { NextResponse } from "next/server";

export async function DELETE(req, { params }) {
  try {
    await connectDB();

    // 1. Extract ID
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ success: false, message: "Record ID is required" }, { status: 400 });
    }

    // 2. Find the record FIRST
    const salaryRecord = await EmployeeSalary.findById(id);

    if (!salaryRecord) {
      return NextResponse.json({ success: false, message: "Salary record not found" }, { status: 404 });
    }

    // 3. REVERSE EXPENSE LOGIC (Only if Salary was "Paid")
    if (salaryRecord.status === 'Paid' && salaryRecord.linkedExpenses?.length > 0) {
      console.log(`Reverting ${salaryRecord.linkedExpenses.length} linked expenses...`);

      // Use Promise.all to await all updates, but without a transaction session
      await Promise.all(salaryRecord.linkedExpenses.map(async (link) => {
        try {
          const { expenseId, amount } = link;
          const amountToRevert = parseFloat(amount);

          if (!amountToRevert || amountToRevert <= 0) return;

          // Find the original expense
          const expenseDoc = await employeeExpense.findById(expenseId);

          if (expenseDoc) {
            // A. Decrease the paidAmount
            const currentPaid = expenseDoc.paidAmount || 0;
            let newPaidTotal = currentPaid - amountToRevert;

            if (newPaidTotal < 0) newPaidTotal = 0;

            // Fix floating point precision
            expenseDoc.paidAmount = Math.round(newPaidTotal * 100) / 100;

            // B. Re-evaluate Status
            if (expenseDoc.paidAmount <= 0) {
              expenseDoc.status = 'Pending';
            } else if (expenseDoc.paidAmount < expenseDoc.amount) {
              expenseDoc.status = 'Partial';
            }
            // If still fully paid, status remains Completed

            await expenseDoc.save(); 
            // Note: Removed { session } argument
          }
        } catch (innerError) {
          console.error(`Failed to revert expense ${link.expenseId}:`, innerError);
        }
      }));
    }

    // 4. UPDATE SALARY LIST STATUS (If applicable)
    if (salaryRecord.salaryListId) {
      try {
        await SalaryList.updateOne(
          { 
            _id: salaryRecord.salaryListId, 
            "employeeList.employeeId": salaryRecord.employeeId 
          },
          { 
            $set: { "employeeList.$.status": "pending" } 
          }
        );
      } catch (listError) {
        console.error("Failed to update SalaryList status:", listError);
      }
    }

    // 5. Delete the Salary Record
    await EmployeeSalary.findByIdAndDelete(id);

    // 6. Return Success Response
    return NextResponse.json({
      success: true,
      message: "Salary record deleted and expenses reverted successfully",
      id: salaryRecord._id
    });

  } catch (error) {
    console.error("Error deleting salary record:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}