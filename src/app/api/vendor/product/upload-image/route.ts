import { NextRequest, NextResponse } from "next/server";
import { ensureVendor } from "@/lib/vendorGuard";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

// For App Router
export const runtime = "nodejs";
export const maxDuration = 60; // Allow more time for image processing + S3 upload

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

/**
 * Maximum dimension (width or height) for server-side resize.
 */
const MAX_DIMENSION = 1920;

/**
 * JPEG quality for server-side compression (1–100 for sharp).
 */
const JPEG_QUALITY = 80;

/**
 * Max file size accepted (10 MB). Files beyond this are rejected early.
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Checks if a file is HEIC/HEIF by name or MIME type.
 */
function isHeicFile(name: string, type: string): boolean {
  const n = name.toLowerCase();
  const t = type.toLowerCase();
  return (
    n.endsWith(".heic") ||
    n.endsWith(".heif") ||
    t === "image/heic" ||
    t === "image/heif"
  );
}

export async function POST(request: NextRequest) {
  try {
    await ensureVendor(request);
    
    const data = await request.formData();
    const file: File | null = data.get("my_file") as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file received." });
    }

    // Convert file data to a buffer
    const bytes = await file.arrayBuffer();
    let buffer: Buffer = Buffer.from(bytes);

    console.log(
      `[vendor-upload-image] Received: ${file.name} | ${file.type} | ${(buffer.length / 1024).toFixed(0)} KB`
    );

    // Reject files that are way too large
    if (buffer.length > MAX_FILE_SIZE) {
      return NextResponse.json({
        success: false,
        error: `File too large (${(buffer.length / 1024 / 1024).toFixed(1)} MB). Maximum is 10 MB.`,
      });
    }

    // ── Server-side image processing with sharp ──
    try {
      let pipeline = sharp(buffer);
      const metadata = await pipeline.metadata();

      console.log(
        `[vendor-upload-image] Metadata: ${metadata.width}×${metadata.height} | format: ${metadata.format}`
      );

      // Resize if larger than MAX_DIMENSION
      const needsResize =
        (metadata.width && metadata.width > MAX_DIMENSION) ||
        (metadata.height && metadata.height > MAX_DIMENSION);

      // Convert if HEIC or if file is large enough to benefit from recompression
      const needsConvert =
        isHeicFile(file.name, file.type) ||
        metadata.format === "heif" ||
        buffer.length > 1 * 1024 * 1024; // recompress anything over 1 MB

      if (needsResize || needsConvert) {
        pipeline = sharp(buffer); // fresh pipeline

        if (needsResize) {
          pipeline = pipeline.resize(MAX_DIMENSION, MAX_DIMENSION, {
            fit: "inside",
            withoutEnlargement: true,
          });
        }

        buffer = Buffer.from(
          await pipeline
            .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
            .toBuffer()
        );

        console.log(
          `[vendor-upload-image] Processed: ${(buffer.length / 1024).toFixed(0)} KB (resized: ${needsResize}, converted: ${needsConvert})`
        );
      }
    } catch (sharpError) {
      // If sharp fails (unsupported format etc.), continue with original buffer
      console.error("[vendor-upload-image] Sharp processing failed, using original:", sharpError);
    }

    // Generate unique filename — always .jpg since we convert to JPEG
    const originalExt = file.name.split(".").pop()?.toLowerCase();
    const ext = isHeicFile(file.name, file.type) ? "jpg" : (originalExt || "jpg");
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
    const fileName = `recent/${uniqueId}.${ext}`;
    const thumbFileName = `recent/thumb-${uniqueId}.${ext}`;

    // Generate thumbBuffer
    let thumbBuffer: Buffer;
    try {
      thumbBuffer = Buffer.from(
        await sharp(buffer)
          .resize(400, 400, { fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
          .toBuffer()
      );
    } catch (e) {
      console.error("Thumb generation failed:", e);
      thumbBuffer = buffer;
    }

    // Upload to S3
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: fileName,
      Body: buffer,
      ContentType: "image/jpeg",
      CacheControl: "max-age=31536000", // 1 year cache
    };

    const command = new PutObjectCommand(uploadParams);
    
    // Upload thumbnail to S3
    const thumbUploadParams = {
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: thumbFileName,
      Body: thumbBuffer,
      ContentType: "image/jpeg",
      CacheControl: "max-age=31536000",
    };
    const thumbCommand = new PutObjectCommand(thumbUploadParams);

    // Add timeout for S3 upload
    const uploadPromise = Promise.all([
      s3Client.send(command),
      s3Client.send(thumbCommand)
    ]);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Upload timeout")), 50000) // 50 second timeout
    );

    await Promise.race([uploadPromise, timeoutPromise]);

    console.log("[vendor-upload-image] Uploaded to S3 with key:", fileName, "and thumb:", thumbFileName);

    return NextResponse.json({
      success: true,
      result: {
        url: fileName, // S3 key, not signed URL
        public_id: fileName,
      },
    });
  } catch (error) {
    console.error("[vendor-upload-image] Upload error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Upload failed.",
    });
  }
}
