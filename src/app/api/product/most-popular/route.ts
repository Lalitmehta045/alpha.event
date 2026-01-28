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
 */
async function generateSignedUrls(products: any[]) {
  for (const product of products) {
    if (product.image && Array.isArray(product.image)) {
      const signedUrls = await Promise.all(
        product.image.map(async (key: string) => {
          if (key.startsWith('http')) return key;

          try {
            const command = new GetObjectCommand({
              Bucket: process.env.AWS_S3_BUCKET!,
              Key: key,
            });
            return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
          } catch (error) {
            console.error(`Failed to generate signed URL for key: ${key}`, error);
            return key;
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

    // 2. Calculate the date exactly 7 days ago.
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 3. Query products created on or after the calculated date.
    // We sort by 'createdAt' descending (-1) to show the newest items first.
    const popularProducts = await ProductModel.find({
      publish: true, // Only fetch published products (best practice)
      createdAt: { $gte: sevenDaysAgo },
    })
      .sort({ createdAt: 1 }) // Sort newest first
      .lean();

    // ✅ Generate fresh signed URLs for all product images
    const productsWithSignedUrls = await generateSignedUrls(popularProducts);

    // 4. Return the response
    return NextResponse.json({
      success: true,
      message: "Successfully fetched Most Popular Products (Last 7 Days)",
      count: productsWithSignedUrls.length,
      data: productsWithSignedUrls,
    });
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error fetching popular products:", error);

    // Return a generic error response
    return NextResponse.json(
      { error: "Failed to fetch popular products" },
      { status: 500 }
    );
  }
}
