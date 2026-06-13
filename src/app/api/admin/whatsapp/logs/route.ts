import { NextRequest, NextResponse } from "next/server";
import { ensureAdmin } from "@/lib/adminGuard";
import { connectDB } from "@/lib/db";
import WhatsappLogModel from "@/lib/models/WhatsappLog.model";

export async function GET(req: NextRequest) {
  try {
    await ensureAdmin(req);
    await connectDB();

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "orderId query parameter is required" },
        { status: 400 }
      );
    }

    const logs = await WhatsappLogModel.find({ orderId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      message: "WhatsApp logs fetched successfully",
      data: logs,
    });
  } catch (error: any) {
    console.error("WhatsApp Logs API Error:", error);

    if (
      error.message?.includes("Unauthorized") ||
      error.message?.includes("Forbidden")
    ) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch WhatsApp logs",
      },
      { status: 500 }
    );
  }
}
