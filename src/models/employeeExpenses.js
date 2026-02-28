import mongoose from "mongoose";


const ExpenseSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["Loan", "Reimbursement", "Advance", "Other"],
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
      default: 0.00,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    paidAmount: { type: Number, default: 0 },
   status: {
    type: String,
    enum: ["Pending", "Partial", "Completed"], 
    default: "Pending", 
  },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries by employee and date
ExpenseSchema.index({ employeeId: 1, date: -1 });
ExpenseSchema.index({ status: 1 });

const employeeExpense = mongoose.models.Expense || mongoose.model("Expense", ExpenseSchema);

export default employeeExpense ;