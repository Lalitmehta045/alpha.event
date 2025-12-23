import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import AddressModel from "@/lib/models/Address.model";
import { verifyUser } from "@/lib/verifyUser";
import UserModel from "@/lib/models/User.model";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const auth = verifyUser(req);
    if (!auth) {
      return NextResponse.json({ success: false, message: "Unauthorized" });
    }

    const addresses = await AddressModel.find({ userId: auth.userId });

    return NextResponse.json({
      success: true,
      message: "GET ALL Address Successfully",
      data: addresses,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Server Error", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // 🛡 Verify User
    const auth = verifyUser(req);
    if (!auth) {
      return NextResponse.json({ success: false, message: "Unauthorized" });
    }

    // 📌 Read incoming data
    const data = await req.json();
    const userId = auth.userId;

    const { address_line, city, state, pincode, mobile, country } = data;

    // 📝 Required field validation
    if (!address_line || !city || !state || !pincode) {
      return NextResponse.json(
        { success: false, message: "All required fields must be provided." },
        { status: 400 }
      );
    }

    // 📌 Validate pincode (Indian 6 digits)
    if (!/^\d{6}$/.test(pincode)) {
      return NextResponse.json(
        { success: false, message: "Invalid Indian pincode format." },
        { status: 400 }
      );
    }

    // 📌 Validate mobile number (optional)
    // Force mobile to string (preserve formatting) and trim
    const mobileStr = mobile ? String(mobile).trim() : null;

    if (mobileStr) {
      // Allowed characters: +, digits, spaces, hyphens, parentheses
      if (!/^[+\d][\d\s\-()]*$/.test(mobileStr)) {
        return NextResponse.json(
          { success: false, message: "Invalid mobile number characters." },
          { status: 400 }
        );
      }

      // Count digits only (ignore separators) and enforce 10-15 digits
      const digitCount = mobileStr.replace(/\D/g, "").length;
      if (digitCount < 10 || digitCount > 15) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid mobile number length (should have 10–15 digits).",
          },
          { status: 400 }
        );
      }
    }

    // Create address — saving mobileStr exactly as provided (trimmed)
    const newAddress = await AddressModel.create({
      address_line,
      city,
      state,
      pincode,
      mobile: mobileStr,
      country: country || "India",
      userId,
    });

    await UserModel.findByIdAndUpdate(userId, {
      $push: { address_details: newAddress._id },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Address created successfully",
        data: newAddress,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("ADDRESS_POST_API_ERROR:", error.message);
    return NextResponse.json(
      { success: false, message: "Server Error", error: error.message },
      { status: 500 }
    );
  }
}
