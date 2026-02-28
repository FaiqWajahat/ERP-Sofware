import connectDB from "@/lib/mongodb";
import Asset from "@/models/companyAssets";
import { NextResponse } from "next/server";


export async function PUT(request) {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Parse Request Body
    const { assetId, projectId, projectName, assignedDate } = await request.json();

    // Basic Validation
    if (!assetId) {
      return NextResponse.json(
        { success: false, message: "Asset ID is required" },
        { status: 400 }
      );
    }

    // 3. Find the Asset
    const asset = await Asset.findById(assetId);

    if (!asset) {
      return NextResponse.json(
        { success: false, message: "Asset not found" },
        { status: 404 }
      );
    }

    const actionDate = assignedDate ? new Date(assignedDate) : new Date();

    // --- STEP 4: Close the PREVIOUS Assignment History (if valid) ---
    // If the asset is currently assigned to a project, we need to mark that assignment as finished.
    if (asset.currentProject && asset.currentProject.id) {
      
      // Find the specific history entry for the current project that is still "open" (no unassignedDate)
      const openHistoryIndex = asset.projectHistory.findIndex(
        (h) => 
          h.projectId.toString() === asset.currentProject.id.toString() && 
          !h.unassignedDate
      );

      // If found, close it by setting the unassignedDate
      if (openHistoryIndex !== -1) {
        asset.projectHistory[openHistoryIndex].unassignedDate = actionDate;
      }
    }

    // --- STEP 5: Handle the NEW State ---

    if (!projectId) {
      // SCENARIO A: Moving to Storage (Unassigning)
      
      // Clear current project
      asset.currentProject = {
        id: null,
        name: null,
        assignedDate: null
      };
      
      // We do NOT create a new history entry for "Storage", we just ensure the old one is closed (done above).
      
    } else {
      // SCENARIO B: Assigning to a New Project

      // 1. Update Current Project Fields (For fast frontend access)
      asset.currentProject = {
        id: projectId,
        name: projectName,
        assignedDate: actionDate
      };

      // 2. Push to Project History (For reporting/logs)
      asset.projectHistory.push({
        projectId: projectId,
        projectName: projectName,
        assignedDate: actionDate,
        notes: "Assigned via Asset Manager",
        // unassignedDate is left undefined/null intentionally
      });
    }

    // 6. Save Changes
    await asset.save();

    return NextResponse.json({
      success: true,
      message: projectId 
        ? `Asset successfully assigned to ${projectName}` 
        : "Asset successfully moved to Storage",
      asset: asset, // Return updated asset so frontend can update state immediately
    });

  } catch (error) {
    console.error("Asset Assignment Error:", error);
    return NextResponse.json(
      { success: false, message: "Server Error", error: error.message },
      { status: 500 }
    );
  }
}