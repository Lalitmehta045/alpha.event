import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ProductModel from "@/lib/models/Product.model";
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

/**
 * Helper function to generate fresh signed URLs for product images
 * Replaces S3 keys with temporary signed URLs (1 hour expiry)
 */
async function generateSignedUrls(products: any[]) {
  for (const product of products) {
    if (product.image && Array.isArray(product.image)) {
      const signedUrls = await Promise.all(
        product.image.map(async (key: string) => {
          // If already a full URL (starts with http), return as-is
          if (key.startsWith('http')) return key;

          try {
            const command = new GetObjectCommand({
              Bucket: process.env.AWS_S3_BUCKET!,
              Key: key,
            });
            return await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
          } catch (error) {
            console.error(`Failed to generate signed URL for key: ${key}`, error);
            return key; // Return original key if signing fails
          }
        })
      );
      product.image = signedUrls;
    }
  }
  return products;
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Get search query from URL
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";

    let filter = {};

    // If query exists, filter products by name or description (case-insensitive)
    if (query) {
      filter = {
        $or: [
          { name: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ],
      };
    }

    const products = await ProductModel.find(filter)
      .sort({ createdAt: -1 }) // ✅ -1 = descending (newest first)
      .lean();

    // ✅ Generate fresh signed URLs for all product images
    const productsWithSignedUrls = await generateSignedUrls(products);

    return NextResponse.json({
      success: true,
      message: query
        ? `Products matching "${query}"`
        : "Successfully GET ALL Products Data",
      count: productsWithSignedUrls.length,
      data: productsWithSignedUrls,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
