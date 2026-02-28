import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Quotation from "@/models/quotation";
import Client from "ssh2-sftp-client"; // Import SFTP

export async function PUT(req) {
 
  const vps_id=process.env.VPS_IP;
  const vps_user=process.env.VPS_USER;
  const vps_password=process.env.VPS_PASSWORD;
  const vps_port=process.env.VPS_PORT;  

  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Parse FormData (Changed from req.json())
    const formData = await req.formData();
    
    // Extract Text Fields
    const id = formData.get("_id");
    const clientName = formData.get("clientName");
    const projectName = formData.get("projectName");
    const referenceNo = formData.get("referenceNo");
    const date = formData.get("date");
    const totalAmount = formData.get("totalAmount");
    const status = formData.get("status");
    
    // Extract File Logic Fields
    const file = formData.get("file"); // The new file object (if any)
    const isFileRemoved = formData.get("isFileRemoved") === "true"; // Check if user clicked "X"

    // 3. Validation: Check if ID exists
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Quotation ID is required for updates" },
        { status: 400 }
      );
    }

    // 4. Validation: Check required fields
    if (  !referenceNo  || !clientName || !date) {
      return NextResponse.json(
        { success: false, message: "All fields are required." },
        { status: 400 }
      );
    }

    // 5. Find the EXISTING Quotation first (Crucial for getting the old file URL)
    const existingQuotation = await Quotation.findById(id);
    if (!existingQuotation) {
      return NextResponse.json(
        { success: false, message: "Quotation not found" },
        { status: 404 }
      );
    }

    let finalDocumentUrl = existingQuotation.documentUrl; // Start with the current URL

    // --- VPS FILE HANDLING LOGIC ---
    const sftp = new Client();
    const config = {
      host: vps_id,
      port: vps_port,
      username: vps_user,
      password: vps_password,
    };
    const remoteDir = "/var/www/html/uploads";

    try {
      // Logic A: If user removed the file OR is uploading a new one, DELETE the old file
      if ((isFileRemoved || file) && existingQuotation.documentUrl) {
        const oldFileName = existingQuotation.documentUrl.split('/').pop();
        
        if (oldFileName) {
          await sftp.connect(config);
          
          const oldFilePath = `${remoteDir}/${oldFileName}`;
          const exists = await sftp.exists(oldFilePath);
          
          if (exists) {
            await sftp.delete(oldFilePath);
            console.log("Old file deleted from VPS");
          }
          await sftp.end(); // Close connection
        }

        // If explicitly removed and no new file, clear the URL
        if (isFileRemoved && !file) {
          finalDocumentUrl = "";
        }
      }

      // Logic B: If there is a NEW file, UPLOAD it
      if (file && typeof file === "object" && file.size > 0) {
        // Create unique name
        const cleanFileName = file.name.replace(/\s+/g, "_");
        const uniqueFileName = `${Date.now()}_${cleanFileName}`;
        const remotePath = `${remoteDir}/${uniqueFileName}`;

        // Reconnect for upload
        await sftp.connect(config);
        
        // Ensure folder exists
        const dirExists = await sftp.exists(remoteDir);
        if (!dirExists) {
          await sftp.mkdir(remoteDir, true);
        }

        // Upload
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await sftp.put(buffer, remotePath);
        await sftp.end();

        // Update the URL to the new file
        finalDocumentUrl = `http://${config.host}/uploads/${uniqueFileName}`;
      }

    } catch (sftpError) {
      console.error("VPS File Error:", sftpError);
      // We continue execution to update the text fields even if file upload fails
    }

    // 6. Perform the Database Update
    const updatedQuotation = await Quotation.findByIdAndUpdate(
      id,
      {
        clientName: clientName.trim(),
        projectName: projectName.trim(),
        referenceNo: referenceNo.trim(),
        date: new Date(date),
         status,
        documentUrl: finalDocumentUrl, // Save the new (or cleared) URL
      },
      { new: true, runValidators: true }
    );

    // 7. Return Success
    return NextResponse.json(
      { success: true, message: "Quotation updated successfully", data: updatedQuotation },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error updating quotation:", error);

    // Handle Duplicate Reference Number Error
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "A quotation with this Reference Number already exists." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to update quotation" },
      { status: 500 }
    );
  }
}