import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    iqamaNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    nationality: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    joiningDate: {
      type: Date,
      default: null,
    },
    salary: {
      type: Number,
      default: 0.00,
    },
    status: {
      type: Boolean,
      default:true
    },
  },
  { 
    timestamps: true
  }
);

const Employee = mongoose.models.Employee || mongoose.model("Employee", EmployeeSchema);

export default Employee;