import { NextRequest, NextResponse } from "next/server";
import { ensureAdmin } from "@/lib/adminGuard";
import { connectDB } from "@/lib/db";
import ProductModel from "@/lib/models/Product.model";
import { Category, SubCategory } from "@/@types/catregory";
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

interface ProductPayload {
  name: string;
  image: string[];
  category: Category[]; // full objects in form
  subCategory: SubCategory[];
  unit: string;
  stock?: number;
  price: number;
  discount?: number;
  description: string;
  more_details?: Record<string, string>;
}

// GET all products
// GET all products for Admin
export async function GET(req: NextRequest) {
  try {
    await ensureAdmin(req); // verify admin token

    await connectDB();

    const products = await ProductModel.find()
      .populate("category")
      .populate("subCategory")
      .sort({ createdAt: -1 })
      .lean();

    // ✅ Generate fresh signed URLs for all product images
    const productsWithSignedUrls = await generateSignedUrls(products);

    return NextResponse.json({
      success: true,
      message: "Successfully fetched all products",
      data: productsWithSignedUrls,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Unauthorized",
      },
      { status: 401 }
    );
  }
}

// POST new product
export async function POST(req: NextRequest) {
  try {
    // ✅ Ensure Admin Authentication
    await ensureAdmin(req);

    // ✅ Connect to DB
    await connectDB();

    // ✅ Parse the request body
    const body: ProductPayload = await req.json();
    const {
      name,
      image,
      category,
      subCategory,
      unit,
      stock,
      price,
      discount,
      description,
      more_details,
    } = body;

    // ✅ Validate required fields
    if (
      !name ||
      !image?.[0] ||
      !category?.[0] ||
      !subCategory?.[0] ||
      !unit ||
      !price ||
      !description
    ) {
      return NextResponse.json(
        {
          success: false,
          error: true,
          message: "Enter required fields",
        },
        { status: 400 }
      );
    }

    // ✅ Create new product
    const newProduct = await ProductModel.create({
      name,
      image,
      category,
      subCategory,
      unit,
      stock,
      price,
      discount,
      description,
      more_details,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        data: newProduct,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("CREATE PRODUCT ERROR:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    // Log validation errors specifically
    if (error.name === 'ValidationError') {
      console.error("Validation errors:", error.errors);
    }

    return NextResponse.json(
      {
        success: false,
        error: true,
        message: error.message || "Internal server error",
        details: error.errors || error.toString(),
      },
      { status: 500 }
    );
  }
}
