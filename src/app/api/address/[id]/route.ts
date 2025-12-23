import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import AddressModel from "@/lib/models/Address.model";
import { verifyUser } from "@/lib/verifyUser";

interface ParamsPromise {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: ParamsPromise) {
  try {
    await connectDB();

    const auth = verifyUser(req);
    if (!auth) {
      return NextResponse.json({ success: false, message: "Unauthorized" });
    }

    const { id } = await params; // ✅ FIX

    const address = await AddressModel.findById(id);

    if (!address || address.userId.toString() !== auth.userId) {
      return NextResponse.json(
        { success: false, message: "Address not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: address });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Server Error", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: ParamsPromise) {
  try {
    await connectDB();

    const auth = verifyUser(req);
    if (!auth) {
      return NextResponse.json({ success: false, message: "Unauthorized" });
    }

    const { id } = await params;

    const existingAddress = await AddressModel.findById(id);
    if (!existingAddress || existingAddress.userId.toString() !== auth.userId) {
      return NextResponse.json(
        { success: false, message: "Address not found" },
        { status: 404 }
      );
    }

    const data = await req.json();

    const allowedUpdates = [
      "address_line",
      "city",
      "state",
      "pincode",
      "country",
      "mobile",
      "status",
    ];

    const updates: any = {};
    Object.keys(data).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updates[key] = data[key];
      }
    });

    // Validate pincode
    if (updates.pincode && !/^\d{6}$/.test(updates.pincode)) {
      return NextResponse.json(
        { success: false, message: "Invalid Indian pincode format." },
        { status: 400 }
      );
    }

    // Validate mobile in required format (+91-8349020802)
    if (updates.mobile) {
      const mobileStr = String(updates.mobile).trim();

      const phoneRegex = /^[+\d][\d\s\-()]*$/;

      if (!phoneRegex.test(mobileStr)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid mobile format. Required: +CC-XXXXXXXXXX",
          },
          { status: 400 }
        );
      }

      updates.mobile = mobileStr; // normalized
    }

    const updated = await AddressModel.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json({
      success: true,
      message: "Address Updated Successfully",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Server Error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: ParamsPromise) {
  try {
    await connectDB();

    const auth = verifyUser(req);
    if (!auth) {
      return NextResponse.json({ success: false, message: "Unauthorized" });
    }

    const { id } = await params; // ✅ FIX

    const existingAddress = await AddressModel.findById(id);
    if (!existingAddress || existingAddress.userId.toString() !== auth.userId) {
      return NextResponse.json(
        { success: false, message: "Address not found" },
        { status: 404 }
      );
    }

    await AddressModel.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Server Error", error: error.message },
      { status: 500 }
    );
  }
}
