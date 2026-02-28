import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Quotation from "@/models/quotation";
import Client from "ssh2-sftp-client"; // Import SFTP

export async function DELETE(req) {
  
  const vps_id=process.env.VPS_IP;
  const vps_user=process.env.VPS_USER;
  const vps_password=process.env.VPS_PASSWORD;
  const vps_port=process.env.VPS_PORT;

  try {
    await connectDB();

    const body = await req.json();
    const { quotationId } = body;

    if (!quotationId) {
      return NextResponse.json(
        { success: false, message: "Quotation ID is required" },
        { status: 400 }
      );
    }

    // 1. Find the quotation first (to get the document URL)
    const quotation = await Quotation.findById(quotationId);

    if (!quotation) {
      return NextResponse.json(
        { success: false, message: "Quotation not found" },
        { status: 404 }
      );
    }

    // 2. Delete file from VPS (if it exists)
    if (quotation.documentUrl) {
      // Extract the filename from the URL
      // URL format: http://IP/uploads/filename.ext
      const fileName = quotation.documentUrl.split('/').pop(); 
      
      if (fileName) {
        const sftp = new Client();
        const config = {
          host: vps_id,
          port: vps_port,
          username: vps_user,
          password: vps_password,
        };

        const remotePath = `/var/www/html/uploads/${fileName}`;

        try {
          console.log(`Attempting to delete file from VPS: ${remotePath}`);
          await sftp.connect(config);
          
          // Check if file exists before trying to delete
          const fileExists = await sftp.exists(remotePath);
          if (fileExists) {
            await sftp.delete(remotePath);
            console.log("File deleted successfully from VPS");
          } else {
            console.log("File not found on VPS, skipping delete.");
          }
          
          await sftp.end();
        } catch (sftpError) {
          console.error("VPS Delete Error:", sftpError);
          // We continue execution even if VPS delete fails, 
          // so the user isn't stuck with a database record they can't delete.
        }
      }
    }

    // 3. Delete from Database
    await Quotation.findByIdAndDelete(quotationId);

    return NextResponse.json(
      { success: true, message: "Quotation and associated file deleted successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error deleting quotation:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete quotation" },
      { status: 500 }
    );
  }
}