import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import UserModel from "@/lib/models/User.model";
import { verifyUser } from "@/lib/verifyUser";

// 🔥 REQUIRED: Import referenced models so Mongoose can populate them
import "@/lib/models/Address.model";
import "@/lib/models/Cart.model";
import "@/lib/models/Order.model";
import mongoose from "mongoose";

interface ParamsPromise {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: ParamsPromise) {
  try {
    await connectDB();

    const auth = verifyUser(req);
    if (!auth) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access. Please login." },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
    }

    if (auth.userId !== id) {
      return NextResponse.json(
        { message: "Forbidden: You cannot view another user's profile" },
        { status: 403 }
      );
    }

    // Convert string ID to ObjectId for aggregation
    const userIdObjectId = new mongoose.Types.ObjectId(id);

    const user = await UserModel.aggregate([
      // Stage 1: Match the user by their _id
      {
        $match: { _id: userIdObjectId },
      },
      // Stage 2: Look up address_details
      // {
      //   $lookup: {
      //     from: "addresses", // The collection name for Address model (usually pluralized, lowercase)
      //     localField: "_id", // Field from the input documents (UserModel)
      //     foreignField: "userId", // Field from the "addresses" documents
      //     as: "address_details", // Name of the new array field to add to the input documents
      //   },
      // },
      // Stage 3: Look up shopping_cart
      {
        $lookup: {
          from: "carts", // The collection name for Cart model
          localField: "_id",
          foreignField: "userId",
          as: "shopping_cart",
        },
      },
      // Stage 4: Look up orderHistory
      {
        $lookup: {
          from: "orders", // The collection name for Order model
          localField: "_id",
          foreignField: "userId",
          as: "orderHistory",
        },
      },
      // Stage 5: Project to select fields and exclude sensitive ones
      {
        $project: {
          password: 0,
          refresh_token: 0,
          forgot_password_otp: 0,
          forgot_password_expiry: 0,
        },
      },
    ]);

    // Aggregation returns an array, so get the first element
    const userData = user.length > 0 ? user[0] : null;

    if (!userData) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "User fetched successfully",
      data: userData,
    });
  } catch (error) {
    console.error("GET USER PROFILE AGGREGATION ERROR:", error);
    return NextResponse.json(
      {
        message: "Server error",
        error: error instanceof Error ? error.message : error,
      },
      { status: 500 }
    );
  }
}

// ============================
// UPDATE USER
// ============================
export async function PUT(req: NextRequest, { params }: ParamsPromise) {
  try {
    await connectDB();

    const auth = verifyUser(req);
    if (!auth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // 1. Validate user ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid user ID format" },
        { status: 400 }
      );
    }

    if (auth.userId !== id) {
      return NextResponse.json(
        { message: "Forbidden: You cannot update another user's profile" },
        { status: 403 }
      );
    }

    let body: Record<string, any>;
    try {
      body = await req.json();
      if (Object.keys(body).length === 0) {
        return NextResponse.json(
          { message: "Request body cannot be empty" },
          { status: 400 }
        );
      }
    } catch (jsonError) {
      return NextResponse.json(
        { message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    // 2. Define the ONLY ALLOWED fields for update
    const allowedFields = ["fname", "lname", "avatar"];

    const updateData: Record<string, any> = {};
    for (const key of allowedFields) {
      // Iterate only over allowed fields
      if (body.hasOwnProperty(key)) {
        updateData[key] = body[key];
      }
    }

    // If no allowed fields were provided in the body, return an error
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          message:
            "No valid fields provided for update. Only fname, lname, and avatar can be updated.",
        },
        { status: 400 }
      );
    }

    // 4. Perform the update
    // Use `runValidators: true` to apply schema validators (e.g., `trim`, `minlength`, `enum`)
    // `new: true` returns the updated document
    const updatedUser = await UserModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true, // IMPORTANT: Ensure schema validators are applied on update
    })
      .select(
        "-password -refresh_token -forgot_password_otp -forgot_password_expiry"
      ) // Exclude sensitive fields from response
      .lean(); // Return a plain JavaScript object

    if (!updatedUser) {
      // This case might occur if the ID is valid but no document is found
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error: any) {
    console.error("UPDATE USER ERROR:", error);

    if (error.name === "ValidationError") {
      return NextResponse.json(
        { message: error.message, errors: error.errors },
        { status: 400 }
      );
    }

    if (error.code === 11000) {
      return NextResponse.json(
        {
          message: "A field with that value already exists.",
          field: Object.keys(error.keyValue)[0],
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        message: "Server error",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// ============================
// DELETE USER
// ============================
export async function DELETE(req: NextRequest, { params }: ParamsPromise) {
  try {
    await connectDB();

    const auth = verifyUser(req);
    if (!auth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (auth.userId !== id) {
      return NextResponse.json(
        { message: "Forbidden: You cannot delete another user's account" },
        { status: 403 }
      );
    }

    await UserModel.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
