import connectDB from "@/lib/mongodb";
import Quotation from "@/models/quotation";
import { NextResponse } from "next/server";
import Client from "ssh2-sftp-client"; 

export async function POST(request) {
 
  const vps_id=process.env.VPS_IP;
  const vps_user=process.env.VPS_USER;
  const vps_password=process.env.VPS_PASSWORD;
  const vps_port=process.env.VPS_PORT;

  try {
    await connectDB();

    const formData = await request.formData();

    // Extract fields
    const clientName = formData.get("clientName");
    const projectName = formData.get("projectName");
    const referenceNo = formData.get("referenceNo");
    const date = formData.get("date");
    const status = formData.get("status");
    const file = formData.get("file");
 

    // Validation
    if (!clientName || !referenceNo || !date) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400 }
      );
    }


    // Duplicate Check
    const existingRef = await Quotation.findOne({ referenceNo: referenceNo.trim() });
    if (existingRef) {
      return NextResponse.json(
        { success: false, message: "A quotation with this Reference No already exists." },
        { status: 409 }
      );
    }

    // File Upload Logic (VPS)
    let uploadedFileUrl = "";

    if (file && typeof file === "object" && file.size > 0) {
      const sftp = new Client();
      const config = {
        host: vps_id, 
        port: vps_port,
        username: vps_user,
        password: vps_password,
      };

      const remoteDir = "/var/www/html/uploads";
      const cleanFileName = file.name.replace(/\s+/g, "_");
      const uniqueFileName = `${Date.now()}_${cleanFileName}`;
      const remotePath = `${remoteDir}/${uniqueFileName}`;

      try {
        await sftp.connect(config);
        const dirExists = await sftp.exists(remoteDir);
        if (!dirExists) {
          await sftp.mkdir(remoteDir, true);
        }
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await sftp.put(buffer, remotePath);
        await sftp.end();

        uploadedFileUrl = `http://${config.host}/uploads/${uniqueFileName}`;
      } catch (uploadError) {
        console.error("VPS Upload Failed:", uploadError);
      }
    }

    // Create Document
    const newQuotation = await Quotation.create({
      clientName: clientName.trim(),
      projectName: projectName.trim(),
      referenceNo: referenceNo.trim(),
      date: new Date(date),
      
      status: status || "Draft",
      documentUrl: uploadedFileUrl,
    });

    return NextResponse.json({
      success: true,
      message: "Quotation created successfully!",
      data: newQuotation
    }, { status: 201 });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create quotation", error: error.message },
      { status: 500 }
    );
  }
}