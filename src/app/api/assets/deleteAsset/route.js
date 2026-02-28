import connectDB from "@/lib/mongodb";
import Asset from "@/models/companyAssets";
import { NextResponse } from "next/server";

export async function DELETE(request) {
  try {
    await connectDB();
    
    // In Next.js App Router, we parse the body for DELETE requests slightly differently
    const body = await request.json();
    const { assetId } = body;

    if (!assetId) {
      return NextResponse.json(
        { success: false, message: "Asset ID is required" },
        { status: 400 }
      );
    }

    const deletedAsset = await Asset.findByIdAndDelete(assetId);

    if (!deletedAsset) {
      return NextResponse.json(
        { success: false, message: "Asset not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Asset deleted successfully",
    });

  } catch (error) {
    console.error("Error deleting asset:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete asset" },
      { status: 500 }
    );
  }
}