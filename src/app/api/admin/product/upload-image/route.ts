import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("my_file") as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file received." });
    }

    // Convert the file data to a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `recent/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;

    // Upload to S3
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
      // ACL removed - bucket should have public read policy
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    // Generate presigned URL for viewing
    const getObjectCommand = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: fileName,
    });
    const url = await getSignedUrl(s3Client, getObjectCommand, { expiresIn: 3600 }); // 1 hour expiry
    console.log("Generated presigned URL:", url);

    return NextResponse.json({
      success: true,
      result: {
        url: url,
        public_id: fileName,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, error: "Upload failed." });
  }
}
