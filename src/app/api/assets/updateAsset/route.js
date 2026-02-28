import connectDB from "@/lib/mongodb";
import Asset from "@/models/companyAssets";
import { NextResponse } from "next/server";

export async function PUT(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json(
        { success: false, message: "Asset ID is required" },
        { status: 400 }
      );
    }

    // Check if updating serial number, ensure it doesn't conflict with another asset
    if (updateData.serialNumber) {
      const duplicate = await Asset.findOne({ 
        serialNumber: updateData.serialNumber, 
        _id: { $ne: _id } // Exclude current asset
      });
      
      if (duplicate) {
        return NextResponse.json(
          { success: false, message: "Serial Number already in use by another asset." },
          { status: 400 }
        );
      }
    }

    const updatedAsset = await Asset.findByIdAndUpdate(
      _id,
      updateData,
      { new: true, runValidators: true } // Return the updated document
    );

    if (!updatedAsset) {
      return NextResponse.json(
        { success: false, message: "Asset not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Asset updated successfully",
      asset: updatedAsset,
    });

  } catch (error) {
    console.error("Error updating asset:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update asset" },
      { status: 500 }
    );
  }
}