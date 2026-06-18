import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const urlCache = new Map<string, { url: string; expiry: number }>();
const CACHE_DURATION = 50 * 60 * 1000; // 50 minutes (URLs expire in 1 hour)

function extractS3Key(key: string): string {
  if (typeof key !== 'string') return key;
  const s3Domain = "alpha-arts.s3.eu-north-1.amazonaws.com";
  if (key.includes(s3Domain)) {
    const parts = key.split(`${s3Domain}/`);
    if (parts.length > 1) {
      return parts[1];
    }
  }
  return key;
}

export const getS3SignedUrl = async (key: string, expiresIn: number = 3600): Promise<string> => {
  // Extract key if it's a full S3 URL
  let s3Key = extractS3Key(key);

  // If it's still an http URL (e.g., Cloudinary), don't sign it
  if (s3Key.startsWith("http")) return s3Key;

  const cached = urlCache.get(s3Key);
  if (cached && Date.now() < cached.expiry) {
    return cached.url;
  }

  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: s3Key,
    });
    const signedUrl = await getSignedUrl(s3Client as any, command as any, { expiresIn });
    urlCache.set(s3Key, { url: signedUrl, expiry: Date.now() + CACHE_DURATION });
    return signedUrl;
  } catch (error) {
    console.error(`Failed to generate signed URL for key: ${s3Key}`, error);
    return key; // Fallback to original
  }
};

export const clearS3Cache = (key: string) => {
  urlCache.delete(key);
};

/**
 * Mutates the items array by replacing S3 keys in the `image` field with
 * presigned URLs, and adding a `thumbnails` array with presigned thumb URLs.
 */
export async function attachSignedUrlsAndThumbnails(items: any[]) {
  for (const item of items) {
    if (item.image && Array.isArray(item.image)) {
      const originalKeys = [...item.image];

      // Sign original images
      item.image = await Promise.all(
        originalKeys.map((key) => getS3SignedUrl(key))
      );

      // Sign thumbnails
      item.thumbnails = await Promise.all(
        originalKeys.map(async (key) => {
          const s3Key = extractS3Key(key);
          if (s3Key.startsWith("http")) return s3Key;
          const parts = s3Key.split("/");
          const filename = parts.pop();
          const dir = parts.length > 0 ? parts.join("/") + "/" : "";
          const thumbKey = `${dir}thumb-${filename}`;
          return getS3SignedUrl(thumbKey);
        })
      );
    } else if (item.image && typeof item.image === "string") {
      // Single image string (e.g. recent.image)
      const originalKey = item.image;
      item.image = await getS3SignedUrl(originalKey);
      
      const s3Key = extractS3Key(originalKey);
      if (!s3Key.startsWith("http")) {
        const parts = s3Key.split("/");
        const filename = parts.pop();
        const dir = parts.length > 0 ? parts.join("/") + "/" : "";
        const thumbKey = `${dir}thumb-${filename}`;
        item.thumbnail = await getS3SignedUrl(thumbKey);
      } else {
        item.thumbnail = originalKey;
      }
    }
    
    // For cart items which might have `productId` object that contains `image`
    if (item.productId && item.productId.image && Array.isArray(item.productId.image)) {
      const originalKeys = [...item.productId.image];
      item.productId.image = await Promise.all(originalKeys.map(key => getS3SignedUrl(key)));
      item.productId.thumbnails = await Promise.all(
        originalKeys.map(async (key) => {
          const s3Key = extractS3Key(key);
          if (s3Key.startsWith("http")) return s3Key;
          const parts = s3Key.split("/");
          const filename = parts.pop();
          const dir = parts.length > 0 ? parts.join("/") + "/" : "";
          const thumbKey = `${dir}thumb-${filename}`;
          return getS3SignedUrl(thumbKey);
        })
      );
    }
  }
  return items;
}
