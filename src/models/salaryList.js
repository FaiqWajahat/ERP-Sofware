import mongoose from "mongoose";
const { Schema } = mongoose;

const employeeItemSchema = new Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee", // Assuming you have an Employee model
      required: true,
    },
    employeeName: {
      type: String,
      required: true,
    },
    iqamaNumber: {
      type: String,
      required: true,
    },
    salary: {
      type: Number, 
      required: true,
    },

    status: {
      type: String,
      enum: [ "pending", "draft", "paid"],
      default: "pending",
    },
  },
  { timestamps: false } 
);


const salaryListSchema = new Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    projectName: {
      type: String,
      required: true,
    },
    foremanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee", 
      required: true,
    },
    foremanName: {
      type: String,
      required: true,
    },

    // The date for which this salary list is applicable  

    date: {
      type: Date, 
      required: true,
    },
    // We explicitly name this 'items' or 'workers' usually, but 'employeeList' works
    employeeList: [employeeItemSchema], 
  },
  {
    timestamps: true,
  }
);

// --- CRITICAL FOR YOUR SEARCH ---
// This tells MongoDB to create a lookup list for every employeeId inside the array.
// Without this, searching for one employee checks every single document one by one (slow).
salaryListSchema.index({ "employeeList.employeeId": 1 });

// Optional: Index for filtering by Project and Date (common in salary sheets)
salaryListSchema.index({ projectId: 1, date: -1 });

const SalaryList = mongoose.models.SalaryList || mongoose.model("SalaryList", salaryListSchema);
export default SalaryList;