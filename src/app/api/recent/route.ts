import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import RecentModel from "@/lib/models/Recent.model";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// ✅ In-memory cache for signed URLs (avoids regenerating on every request)
const urlCache = new Map<string, { url: string; expiry: number }>();
const CACHE_DURATION = 50 * 60 * 1000; // 50 minutes (URLs expire in 1 hour)

function getCachedSignedUrl(key: string): string | null {
  const cached = urlCache.get(key);
  if (cached && Date.now() < cached.expiry) {
    return cached.url;
  }
  return null;
}

export async function GET() {
  try {
    await connectDB();
    const recents = await RecentModel.find({ order: { $exists: true } }).sort({ order: 1 });

    // Generate presigned URLs with caching
    const recentsWithUrls = await Promise.all(
      recents.map(async (recent: any) => {
        try {
          // Handle both full S3 URLs (old data) and plain S3 keys (new data)
          let key = recent.image;
          try {
            const url = new URL(recent.image);
            key = url.pathname.substring(1);
          } catch {
            // Plain S3 key
          }

          // Check cache first
          let signedUrl = getCachedSignedUrl(key);
          if (!signedUrl) {
            const command = new GetObjectCommand({
              Bucket: process.env.AWS_S3_BUCKET!,
              Key: key,
            });
            signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
            urlCache.set(key, { url: signedUrl, expiry: Date.now() + CACHE_DURATION });
          }

          return {
            ...recent.toObject(),
            image: signedUrl,
          };
        } catch (error) {
          console.error("Error generating signed URL for", recent.image, error);
          return recent.toObject();
        }
      })
    );

    return NextResponse.json({
      success: true,
      data: recentsWithUrls,
    });
  } catch (error) {
    console.error("Get recent error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent products" },
      { status: 500 }
    );
  }
}