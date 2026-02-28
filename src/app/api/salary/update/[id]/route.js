import { NextResponse } from "next/server";
import EmployeeSalary from "@/models/employeeSalary";
import employeeExpense from "@/models/employeeExpenses"; 
import SalaryList from "@/models/salaryList"; 
import connectDB from "@/lib/mongodb";

export async function PUT(req, { params }) {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Extract ID
    const { id } = await params;

    // 3. Parse Body
    const body = await req.json();
    const { status, paidDate } = body; 

    if (!id) {
      return NextResponse.json({ success: false, message: "Record ID is required" }, { status: 400 });
    }

    // 4. Fetch the CURRENT Salary Record
    const currentSalary = await EmployeeSalary.findById(id);

    if (!currentSalary) {
      return NextResponse.json({ success: false, message: "Salary record not found" }, { status: 404 });
    }

    // ---------------------------------------------------------
    // 5. SMART UPDATE LOGIC (Handle Expense Side Effects)
    // ---------------------------------------------------------
    
    // SCENARIO A: Moving from 'Pending' -> 'Paid' (APPLY DEDUCTIONS)
    if (currentSalary.status === 'Pending' && status === 'Paid') {
        if (currentSalary.linkedExpenses && currentSalary.linkedExpenses.length > 0) {
            console.log(`Applying deductions for Salary ${id}...`);
            await Promise.all(currentSalary.linkedExpenses.map(async (link) => {
                const { expenseId, amount } = link;
                const deductionAmount = parseFloat(amount);
                
                if (deductionAmount > 0) {
                    const expenseDoc = await employeeExpense.findById(expenseId);
                    if (expenseDoc) {
                        expenseDoc.paidAmount = (expenseDoc.paidAmount || 0) + deductionAmount;
                        expenseDoc.paidAmount = Math.round(expenseDoc.paidAmount * 100) / 100;

                        if (expenseDoc.paidAmount >= expenseDoc.amount) {
                            expenseDoc.status = 'Completed';
                        } else {
                            expenseDoc.status = 'Partial';
                        }
                        await expenseDoc.save();
                    }
                }
            }));
        }
    }

    // SCENARIO B: Moving from 'Paid' -> 'Pending' (REVERT DEDUCTIONS)
    else if (currentSalary.status === 'Paid' && status === 'Pending') {
        if (currentSalary.linkedExpenses && currentSalary.linkedExpenses.length > 0) {
            console.log(`Reverting deductions for Salary ${id}...`);
            await Promise.all(currentSalary.linkedExpenses.map(async (link) => {
                const { expenseId, amount } = link;
                const revertAmount = parseFloat(amount);

                if (revertAmount > 0) {
                    const expenseDoc = await employeeExpense.findById(expenseId);
                    if (expenseDoc) {
                        let newPaid = (expenseDoc.paidAmount || 0) - revertAmount;
                        if (newPaid < 0) newPaid = 0;
                        
                        expenseDoc.paidAmount = Math.round(newPaid * 100) / 100;

                        if (expenseDoc.paidAmount <= 0) {
                            expenseDoc.status = 'Pending';
                        } else if (expenseDoc.paidAmount < expenseDoc.amount) {
                            expenseDoc.status = 'Partial';
                        }
                        await expenseDoc.save();
                    }
                }
            }));
        }
    }

    // ---------------------------------------------------------
    // 6. Perform the Actual Salary Record Update
    // ---------------------------------------------------------
    currentSalary.status = status;
    currentSalary.paidDate = status === 'Paid' ? (paidDate || new Date()) : null;
    
    const updatedSalary = await currentSalary.save();

    // ---------------------------------------------------------
    // 7. UPDATE PARENT SALARY LIST STATUS (NEW ADDITION)
    // ---------------------------------------------------------
    if (currentSalary.salaryListId) {
       
        const listStatus = 'paid'

        await SalaryList.updateOne(
            { 
                _id: currentSalary.salaryListId, 
                "employeeList.employeeId": currentSalary.employeeId 
            },
            { 
                $set: { 
                    "employeeList.$.status": listStatus 
                } 
            }
        );
        console.log(`Updated Parent SalaryList ${currentSalary.salaryListId} status to: ${listStatus}`);
    }

    // 8. Return Success Response
    return NextResponse.json({
      success: true,
      message: `Salary marked as ${status}`,
      data: updatedSalary,
    });

  } catch (error) {
    console.error("Error updating salary:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}