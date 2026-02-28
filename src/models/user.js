import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    profilePic: {
      type: String,
      default: "",
    },
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    resetToken: {
      type: String,
      required: false, // Not everyone has a token all the time
    },
    resetTokenExpiry: {
      type: Date,
      required: false,
    }
    , role: {
      type: String,
      enum: ["Admin", "User"],
      required: [true, "Role is required"],
      default: "User",
    },
  },
  { timestamps: true }
);

// Prevent model recompilation error in Next.js hot reloading
const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;