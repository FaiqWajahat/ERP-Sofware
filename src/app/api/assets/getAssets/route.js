import connectDB from "@/lib/mongodb";
import Asset from "@/models/companyAssets";
import { NextResponse } from "next/server";


export async function GET() {
  try {
    await connectDB();

    // Fetch assets and sort by newest first
    const assets = await Asset.find({}).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      assets,
    });
  } catch (error) {
    console.error("Error fetching assets:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch assets" },
      { status: 500 }
    );
  }
}