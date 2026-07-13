import { NextRequest, NextResponse } from "next/server";
import { ensureVendor, getCurrentVendor } from "@/lib/vendorGuard";
import { connectDB } from "@/lib/db";
import ProductModel from "@/lib/models/Product.model";

// PATCH resubmit vendor product
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureVendor(req);
    await connectDB();
    
    // In next.js 15 app router params must be awaited
    const { id } = await params;
    const vendorId = await getCurrentVendor(req);

    if (!id || !vendorId) {
      return NextResponse.json(
        { success: false, message: "Invalid request" },
        { status: 400 }
      );
    }

    const product = await ProductModel.findOne({
      _id: id,
      vendorId: vendorId,
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found or unauthorized" },
        { status: 404 }
      );
    }

    if (product.status !== "rejected") {
      return NextResponse.json(
        { success: false, message: "Only rejected products can be resubmitted" },
        { status: 400 }
      );
    }

    // Try to get body, but allow empty body for simple resubmit
    let body = {};
    try {
      body = await req.json();
    } catch (e) {
      // Ignore if no body provided
    }

    // Update with new data and reset status
    const updateData = {
      ...body,
      status: "pending",
      publish: false,
      vendorNote: "", // Clear the rejection note
    };

    const updatedProduct = await ProductModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Product resubmitted successfully.",
      data: updatedProduct,
    });
  } catch (error: any) {
    console.error("PATCH VENDOR PRODUCT RESUBMIT ERROR:", error);
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

// DELETE vendor product
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureVendor(req);
    await connectDB();
    
    const { id } = await params;
    const vendorId = await getCurrentVendor(req);

    if (!id || !vendorId) {
      return NextResponse.json(
        { success: false, message: "Invalid request" },
        { status: 400 }
      );
    }

    const product = await ProductModel.findOne({
      _id: id,
      vendorId: vendorId,
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found or unauthorized" },
        { status: 404 }
      );
    }

    await ProductModel.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error: any) {
    console.error("DELETE VENDOR PRODUCT ERROR:", error);
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
