import { NextRequest, NextResponse } from "next/server";
import { twilioClient } from "@/lib/twilio";

// Define the required Country Code (e.g., India)
const COUNTRY_CODE = "+91";

export async function POST(req: NextRequest) {
  try {
    const { phone: rawPhone } = await req.json(); // Get the raw number

    if (!rawPhone) {
      return NextResponse.json(
        { error: "Phone number required" },
        { status: 400 }
      );
    }

    // 1. Clean up the phone number (remove spaces, hyphens, etc.)
    const cleanedPhone = rawPhone.replace(/[\s\-\(\)]/g, "");

    // 2. Format the phone number to E.164: +[CountryCode][SubscriberNumber]
    // Check if the number already has the country code prefix (starts with '+')
    const phone = cleanedPhone.startsWith("+")
      ? cleanedPhone
      : `${COUNTRY_CODE}${cleanedPhone}`; // Add prefix if missing

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // ✅ Send OTP SMS
    const msg = await twilioClient.messages.create({
      body: `Your OTP is ${otp}`,
      from: process.env.TWILIO_PHONE!,
      to: phone, // This will now be in E.164 format (e.g., "+91834902XXXX")
    });

    // ... rest of your code
    const response = NextResponse.json({
      message: "OTP sent successfully",
      otpId: msg.sid, // optional
    });

    response.cookies.set("otp_code", otp, {
      httpOnly: true,
      maxAge: 60 * 5, // expires in 5 minutes
      path: "/",
    });

    // Save the E.164 formatted number
    response.cookies.set("otp_phone", phone, {
      httpOnly: true,
      maxAge: 60 * 5,
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("OTP Error:", err);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
