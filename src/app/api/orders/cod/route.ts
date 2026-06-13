import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import mongoose from "mongoose";
import OrderModel from "@/lib/models/Order.model";
import CartModel from "@/lib/models/Cart.model";
import UserModel from "@/lib/models/User.model";
import { verifyUser } from "@/lib/verifyUser";
import { sendAdminNewOrder, sendCustomerOrderReceived } from "@/services/whatsapp.service";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Authenticate user
    const auth = verifyUser(req);
    if (!auth) {
      return NextResponse.json(
        { message: "Unauthorized", success: false },
        { status: 401 }
      );
    }

    const userId = auth.userId;
    const { list_items, addressId, subTotalAmt, totalAmt, deliveryDate } = await req.json();

    // Validation
    if (!list_items || !list_items.length) {
      return NextResponse.json(
        { message: "Order must contain at least one product", success: false },
        { status: 400 }
      );
    }

    if (!addressId) {
      return NextResponse.json(
        { message: "Delivery address is required", success: false },
        { status: 400 }
      );
    }

    // Generate a readable unique Order ID
    const orderId = `ORD-${new mongoose.Types.ObjectId()
      .toString()
      .slice(-6)
      .toUpperCase()}`;

    // Prepare products for the order schema
    const orderProducts = list_items.map((item: any) => ({
      productId: item.product._id,
      quantity: item.quantity || 1,
      product_details: {
        name: item.product.name,
        price: item.product.price,
        image: item.product.image?.[0] || "",
        unit: item.product.unit,
        category: item.product.category,
        subCategory: item.product.subCategory,
      },
    }));

    // Final order data
    const orderData = {
      userId,
      orderId,
      products: orderProducts,
      paymentId: "",
      payment_status: "COD",
      delivery_address: addressId,
      deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,
      subTotalAmt,
      totalAmt,
      order_status: "Processing",
    };

    // Create order
    const createdOrder = await OrderModel.create(orderData);

    // Clear cart after order
    await CartModel.deleteMany({ userId });
    await UserModel.updateOne({ _id: userId }, { shopping_cart: [] });
    await UserModel.findByIdAndUpdate(userId, {
      $push: { orderHistory: createdOrder._id },
    });

    // 🔔 Send WhatsApp notifications (fire-and-forget, never fails the order)
    try {
      const populatedOrder = await OrderModel.findById(createdOrder._id)
        .populate("userId", "fname lname phone email")
        .populate("delivery_address", "address_line city state pincode country mobile")
        .lean();

      if (populatedOrder) {
        // Send to ADMIN
        sendAdminNewOrder(populatedOrder, list_items).catch((err) =>
          console.error("WhatsApp admin notification failed:", err)
        );

        // Send to CUSTOMER
        sendCustomerOrderReceived(populatedOrder, list_items).catch((err) =>
          console.error("WhatsApp customer notification failed:", err)
        );
      }
    } catch (waError) {
      console.error("WhatsApp notification setup failed (order still OK):", waError);
    }

    return NextResponse.json(
      {
        message: "Order placed successfully with Cash on Delivery",
        success: true,
        data: createdOrder,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("COD ORDER ERROR:", error);
    return NextResponse.json(
      {
        message: error.message || "Internal Server Error",
        success: false,
      },
      { status: 500 }
    );
  }
}
