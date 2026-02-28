import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Asset from "@/models/companyAssets";


export async function POST(request) {
  try {
    // 1. Connect to the Database
    await connectDB();

    // 2. Get the Asset ID from the frontend request
    const { assetId } = await request.json();

    if (!assetId) {
      return NextResponse.json(
        { success: false, message: "Asset ID is required" },
        { status: 400 }
      );
    }

    // 3. Find the Asset
    // We don't strictly need .populate() because your schema stores 
    // the 'projectName' as a string in the history array, which makes loading faster.
    const asset = await Asset.findById(assetId);

    if (!asset) {
      return NextResponse.json(
        { success: false, message: "Asset not found" },
        { status: 404 }
      );
    }

    // 4. Return the data
    return NextResponse.json({
      success: true,
      asset: asset,
    });

  } catch (error) {
    console.error("Error fetching asset details:", error);
    return NextResponse.json(
      { success: false, message: "Server Error", error: error.message },
      { status: 500 }
    );
  }
}