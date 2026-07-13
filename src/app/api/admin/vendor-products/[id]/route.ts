import { NextRequest, NextResponse } from "next/server";
import { ensureAdmin } from "@/lib/adminGuard";
import { connectDB } from "@/lib/db";
import ProductModel from "@/lib/models/Product.model";

// PATCH approve/reject vendor product
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Use Promise based params as recommended in Next.js 15
) {
  try {
    await ensureAdmin(req); // verify admin token
    await connectDB();
    
    // In next.js 15 app router params must be awaited
    const { id } = await params;

    const body = await req.json();
    const { action, note } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { success: false, message: "Invalid action. Must be 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    let updateData: any = {};

    if (action === "approve") {
      updateData = {
        status: "approved",
        publish: true, // Now visible on home page
        vendorNote: "",
      };
    } else if (action === "reject") {
      updateData = {
        status: "rejected",
        publish: false, // Not visible on home page
        vendorNote: note || "Product rejected by admin",
      };
    }

    const updatedProduct = await ProductModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Product successfully ${action}d.`,
      data: updatedProduct,
    });
  } catch (error: any) {
    console.error("PATCH VENDOR PRODUCT ADMIN ERROR:", error);
    const status = error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal Server Error",
      },
      { status }
    );
  }
}
