import { NextResponse } from "next/server";
import { sendCallNowAlert } from "@/services/whatsapp.service";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      customerName,
      customerPhone,
      orderDate,
      orderItems,
      totalAmount,
      deliveryAddress,
    } = body;

    // We do not wait for this to finish to avoid blocking the client response.
    // However, on Vercel serverless, fire-and-forget might be killed if the response returns.
    // So we await it here, but it returns quickly or catches internally.
    await sendCallNowAlert({
      customerName,
      customerPhone,
      orderDate,
      orderItems,
      totalAmount,
      deliveryAddress,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("API error in call-now-alert:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
