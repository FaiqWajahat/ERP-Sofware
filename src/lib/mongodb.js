import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI ;

console.log("MONGODB_URI:", MONGODB_URI);
if (!MONGODB_URI) throw new Error("Please add your MongoDB URI");

let isConnected = false;

export default async function connectDB() {
  if (isConnected) return;
  try {
    const db = await mongoose.connect(MONGODB_URI);
    isConnected = db.connections[0].readyState;
  
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}