import mongoose from "mongoose";

const AssetSchema = new mongoose.Schema(
  {
    // --- 1. Your Existing Fields ---
    name: {
      type: String,
      required: [true, "Please provide the asset name (e.g., Excavator 01)"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Please provide a category (e.g., Heavy Machinery, Vehicle)"],
      trim: true,
    },
    model: {
      type: String,
      trim: true, // e.g., "320 GC"
    },
    manufacturer: {
      type: String,
      trim: true, // e.g., "Caterpillar"
    },
    serialNumber: {
      type: String,
      required: [true, "Serial Number or License Plate is required"],
      unique: true, // Ensures you don't add the same machine twice
      trim: true,
    },
    status: {
      type: String,
      enum: ["Operational", "Maintenance", "Repair", "Inactive", "Sold"],
      default: "Operational",
    },
    purchaseDate: {
      type: Date,
    },
    price: {
      type: Number, // Cost of the asset
    },

    // --- 2. NEW FIELDS (For Project Assignment Dropdown) ---
    
    // This object allows the frontend dropdown to show the current project 
    // instantly without needing complex database lookups.
    currentProject: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        default: null
      },
      name: {
        type: String, 
        default: null
      },
      assignedDate: {
        type: Date,
        default: null
      }
    },

    // --- 3. NEW FIELDS (For History/Reporting) ---
    
    // Keeps a log of where the asset has been.
    projectHistory: [
      {
        projectId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Project",
        },
        projectName: String,
        assignedDate: {
          type: Date,
          default: Date.now,
        },
        unassignedDate: {
          type: Date,
        },
        notes: String,
      },
    ],
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Prevent model overwrite error in Next.js hot reloading
const Asset = mongoose.models.Asset || mongoose.model("Asset", AssetSchema);

export default Asset;