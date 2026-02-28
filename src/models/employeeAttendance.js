import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },

    employeeName: { type: String, required: true },
    iqama: { type: String, required: true },

    date: {
      type: Date,
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["Present", "Absent", "Leave", "Not Marked"],
      default: "Not Marked",
    },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",

      default: null,
    },

    projectName: {
      type: String,
      default: "No project",
    },
  },
  { timestamps: true }
);

// 6. Compound Index (Prevents duplicate entries for the same person on the same day)
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

// Prevent Next.js hot-reload model overwrite error
export const Attendance =
  mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema);
