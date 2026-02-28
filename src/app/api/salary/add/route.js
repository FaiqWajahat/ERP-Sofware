import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import calculateSalaryPeriodMonth from '@/lib/utils'; 
import EmployeeSalary from '@/models/employeeSalary';
import employeeExpense from '@/models/employeeExpenses'; 
import SalaryList from '@/models/salaryList'; // <--- IMPORT THIS

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    
    const { 
      employeeId, fromDate, toDate, baseSalary, absentDays, allowances, deductions, 
      manualExpenses, linkedExpenses, notes, status, 
      absentDeduction, manualExpensesTotal, dbExpensesTotal, totalDeductions, netSalary, 
      paidDate, projectName, salaryListId 
    } = body;

    // 1. Validation
    if (!employeeId || !fromDate || !toDate || netSalary === undefined) {
      return NextResponse.json({ success: false, message: 'Missing fields.' }, { status: 400 });
    }

    // 2. Conflict Check
    const existingRecord = await EmployeeSalary.findOne({
      employeeId,
      $and: [{ fromDate: { $lte: new Date(toDate) } }, { toDate: { $gte: new Date(fromDate) } }]
    });

    if (existingRecord) {
      return NextResponse.json({ success: false, message: 'Salary for this period already exists.' }, { status: 409 });
    }

    // 3. Create Salary Record (Now storing salaryListId)
    const newRecord = await EmployeeSalary.create({
      employeeId, fromDate, toDate,
      month: calculateSalaryPeriodMonth(fromDate, toDate),
      baseSalary, absentDays, allowances, deductions,
      manualExpenses: manualExpenses || [],
      linkedExpenses: linkedExpenses || [],
      projectName: projectName || null,
      notes, status,
      absentDeduction, 
      manualExpensesTotal: manualExpensesTotal || 0,
      dbExpensesTotal: dbExpensesTotal || 0,
      totalDeductions, netSalary,
      paidDate: status === 'Paid' ? (paidDate ? new Date(paidDate) : new Date()) : null,
      salaryListId: salaryListId || null 
    });

    // ---------------------------------------------------------
    // 4. UPDATE PARENT SALARY LIST STATUS
    // ---------------------------------------------------------
    if (salaryListId) {
      // Logic: If we are just saving as 'Pending', mark list as 'draft'. 
      // If we are paying, mark list as 'paid'.
      const listStatus = status === 'Paid' ? 'paid' : 'draft';

      await SalaryList.updateOne(
        { 
          _id: salaryListId, 
          "employeeList.employeeId": employeeId 
        },
        { 
          $set: { 
            "employeeList.$.status": listStatus // The $ updates the specific array item found
          } 
        }
      );
     
    }

    // ---------------------------------------------------------
    // 5. ROBUST EXPENSE UPDATE (PARALLEL EXECUTION)
    // ---------------------------------------------------------
    if (status === 'Paid' && linkedExpenses?.length > 0) {
      console.log(`Processing ${linkedExpenses.length} expense updates...`);

      await Promise.all(linkedExpenses.map(async (link) => {
        try {
          const { expenseId, amount } = link;
          const deductionAmount = parseFloat(amount);

          if (!deductionAmount || deductionAmount <= 0) return;

          const expenseDoc = await employeeExpense.findById(expenseId);
          
          if (expenseDoc) {
            // A. Update Paid Amount
            const currentPaid = expenseDoc.paidAmount || 0;
            const newPaidTotal = currentPaid + deductionAmount;
            
            // B. Fix Floating Point Math (Round to 2 decimals)
            expenseDoc.paidAmount = Math.round(newPaidTotal * 100) / 100;

            // C. Update Status
            if (expenseDoc.paidAmount >= expenseDoc.amount) {
              expenseDoc.status = 'Completed';
            } else {
              expenseDoc.status = 'Partial';
            }

            await expenseDoc.save();
          }
        } catch (innerError) {
          console.error(`Failed to update expense ${link.expenseId}:`, innerError);
        }
      }));
    }

    return NextResponse.json({ success: true, message: 'Salary saved successfully', data: newRecord }, { status: 201 });

  } catch (error) {
    console.error("Salary Add Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}