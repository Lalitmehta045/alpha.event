import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// For App Router
export const runtime = "nodejs";
export const maxDuration = 30;

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

    // Convert file data to a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `recent/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;

    // Upload to S3 with optimized settings
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
      CacheControl: 'max-age=31536000', // 1 year cache
      // ACL removed - bucket should have public read policy
    };

    const command = new PutObjectCommand(uploadParams);

    // Add timeout for S3 upload
    const uploadPromise = s3Client.send(command);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Upload timeout')), 25000) // 25 second timeout
    );

    await Promise.race([uploadPromise, timeoutPromise]);

    // ✅ Return S3 key instead of signed URL
    // The frontend will store this key in the database
    // Fresh signed URLs will be generated when fetching products
    console.log("Uploaded to S3 with key:", fileName);

    return NextResponse.json({
      success: true,
      result: {
        url: fileName, // ✅ Return S3 key, not signed URL
        public_id: fileName,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Upload failed."
    });
  }
}
