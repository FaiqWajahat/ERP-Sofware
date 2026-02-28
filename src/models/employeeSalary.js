// /models/EmployeeSalary.js

import mongoose from 'mongoose';

// 1. Schema for Manual Ad-hoc expenses (typed manually)
const ManualExpenseSchema = new mongoose.Schema({
  description: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, default: 0, min: 0 }
}, { _id: false });

// 2. Schema for Linking DB Loans (The new feature)
const LinkedExpenseSchema = new mongoose.Schema({
  expenseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Expense', // Links to your Expense Model
    required: true 
  },
  amount: { type: Number, required: true, min: 0 } // Amount deducted from this specific loan
}, { _id: false });

const EmployeeSalarySchema = new mongoose.Schema({
  // --- Core Reference ---
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },

  salaryListId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SalaryList',
    required: false,
  },
  
  // --- Period Details ---
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  month: { type: String, required: false },

  // --- Earnings ---
  baseSalary: { type: Number, required: true, min: 0 },
  allowances: { type: Number, required: true, default: 0, min: 0 },
  projectName: { type: String, required: false, default: null },

  // --- Deductions Inputs ---
  absentDays: { type: Number, required: true, default: 0, min: 0 },
  deductions: { type: Number, required: true, default: 0, min: 0 }, // Other fixed deductions
  
  // *** UPDATED: Renamed to match frontend "manualExpenses" ***
  manualExpenses: [ManualExpenseSchema], 
  
  // *** NEW: Store the IDs of the loans paid off ***
  linkedExpenses: [LinkedExpenseSchema], 
  
  notes: { type: String, trim: true },

  // --- Calculated Outputs (Snapshot for History) ---
  absentDeduction: { type: Number, required: true, default: 0 },
  
  // *** UPDATED: Snapshot of totals ***
  manualExpensesTotal: { type: Number, required: true, default: 0 },
  
  // *** NEW: Snapshot of total DB loans deducted ***
  dbExpensesTotal: { type: Number, required: true, default: 0 },

  totalDeductions: { type: Number, required: true }, // Sum of all deduction types
  netSalary: { type: Number, required: true, min: 0 },



  // --- Status & Payment ---
  status: {
    type: String,
    enum: ['Pending', 'Paid'],
    required: true,
    default: 'Pending',
  },
  paidDate: {
    type: Date,
    required: function() { return this.status === 'Paid'; },
    default: null,
  }

}, { timestamps: true });

const EmployeeSalary = mongoose.models.EmployeeSalary || mongoose.model('EmployeeSalary', EmployeeSalarySchema);

export default EmployeeSalary;