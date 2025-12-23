import { NextRequest, NextResponse } from "next/server";
import { ensureAdmin } from "@/lib/adminGuard";
import { connectDB } from "@/lib/db";
import OrderModel from "@/lib/models/Order.model";
import { endOfDay, startOfDay } from "date-fns";
import "@/lib/models/Address.model";
import "@/lib/models/Product.model";

// GET all orders
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    // Ensure the token is valid and the user is an admin
    await ensureAdmin(req);

    const searchParams = req.nextUrl.searchParams;
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    // ⭐ 1. Build the filter object based on query parameters
    const filter: any = {};
    const status = searchParams.get("status");
    const payment = searchParams.get("payment");
    const search = searchParams.get("search");

    // Optional Date Filters
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    if (status) {
      filter.order_status = status;
    }
    if (payment) {
      filter.payment_status = payment;
    }

    // Handle Search Term (searching by Order ID)
    if (search) {
      // Allows searching by partial OrderId (case-insensitive)
      filter.orderId = { $regex: search, $options: "i" };
    }

    // ⭐ Implemented Date Range filtering
    if (startDateParam && endDateParam) {
      const start = new Date(startDateParam);
      const end = new Date(endDateParam);

      // Ensure dates are valid before applying filter
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filter.createdAt = {
          // Query orders created from the start of the start date to the end of the end date
          $gte: startOfDay(start),
          $lte: endOfDay(end),
        };
      }
    }

    // ⭐ 2. Apply the filter to find and count operations
    const orders = await OrderModel.find(filter)
      // Selecting relevant user fields for lighter payload
      .populate("userId", "fname lname email")
      .populate("delivery_address")
      .populate("products.productId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await OrderModel.countDocuments(filter); // Count filtered documents

    return NextResponse.json({
      success: true,
      message: "Admin orders fetched successfully",
      page,
      totalPages: Math.ceil(total / limit),
      totalOrders: total,
      data: orders,
    });
  } catch (error: any) {
    // ⭐ FIX: Implement robust error handling
    console.error("Error fetching admin orders:", error);

    let status = 500;
    let message = "An internal server error occurred.";

    // Handle specific application errors (like authorization failures)
    if (
      error.message &&
      (error.message.includes("Unauthorized") ||
        error.message.includes("Forbidden"))
    ) {
      status = 403; // Forbidden
      message = error.message;
    }

    // Fallback for Mongoose errors, etc.
    return NextResponse.json(
      {
        success: false,
        message: message,
        // Return the error message for better debugging on the client
        error: error.message || "Unknown error",
      },
      { status: status }
    );
  }
}
