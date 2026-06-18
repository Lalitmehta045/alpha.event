import { NextRequest, NextResponse } from "next/server";
import { ensureAdmin } from "@/lib/adminGuard";
import { connectDB } from "@/lib/db";
import { resendWhatsAppMessage } from "@/services/whatsapp.service";

export async function POST(req: NextRequest) {
  try {
    await ensureAdmin(req);
    await connectDB();

    const { logId } = await req.json();

    if (!logId) {
      return NextResponse.json(
        { success: false, message: "logId is required" },
        { status: 400 }
      );
    }

    await resendWhatsAppMessage(logId);

    return NextResponse.json({
      success: true,
      message: "WhatsApp message resent successfully"
    });
  } catch (error: any) {
    console.error("WhatsApp Resend API Error:", error);

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
        message: error.message || "Failed to resend WhatsApp message",
      },
      { status: 500 }
    );
  }
}
