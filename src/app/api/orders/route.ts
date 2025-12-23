import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import OrderModel from "@/lib/models/Order.model";
import { verifyUser } from "@/lib/verifyUser";
import "@/lib/models/Address.model";
import "@/lib/models/Product.model";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const auth = verifyUser(req);
    if (!auth) {
      return NextResponse.json({ success: false, message: "Unauthorized" });
    }

    const orders = await OrderModel.find({ userId: auth.userId })
      .populate({
        path: "userId",
        select: "fname lname email phone",
      })
      .populate({
        path: "delivery_address",
        select: "address_line city state pincode country mobile",
      })
      .populate({
        path: "products.productId",
        select: "name image category subCategory price stock unit",
      })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        message: "Orders fetched successfully",
        data: orders,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("ORDER FETCH ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const auth = verifyUser(req);

    if (!auth) {
      return NextResponse.json({ success: false, message: "Unauthorized" });
    }

    const data = await req.json();

    // Attach userId automatically
    const order = await OrderModel.create({
      ...data,
      userId: auth.userId,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully",
        data: order,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Server error" },
      { status: 500 }
    );
  }
}
