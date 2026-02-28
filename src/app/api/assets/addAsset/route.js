import connectDB from "@/lib/mongodb";
import Asset from "@/models/companyAssets";
import { NextResponse } from "next/server";


export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const { name, category, serialNumber, model, manufacturer, status, purchaseDate, price } = body;

    // Basic Validation
    if (!name || !serialNumber) {
      return NextResponse.json(
        { success: false, message: "Name and Serial Number are required." },
        { status: 400 }
      );
    }

    // Check for duplicate serial number
    const existingAsset = await Asset.findOne({ serialNumber });
    if (existingAsset) {
      return NextResponse.json(
        { success: false, message: "An asset with this Serial Number already exists." },
        { status: 400 }
      );
    }

    // Create Asset
    const newAsset = await Asset.create({
      name,
      category,
      serialNumber,
      model,
      manufacturer,
      status: status || "Operational",
      purchaseDate,
      price,
    });

    return NextResponse.json(
      { success: true, message: "Asset added successfully", asset: newAsset },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding asset:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add asset", error: error.message },
      { status: 500 }
    );
  }
}