import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import UserModel from "@/lib/models/User.model";
import { ensureAdmin } from "@/lib/adminGuard";

export async function GET(req: NextRequest) {
  try {
    await ensureAdmin(req); // this checks admin + super-admin
    await connectDB();

    const search = req.nextUrl.searchParams.get("search")?.trim() || "";

    let filter: any = { role: "USER" };

    if (search) {
      filter.$or = [
        { fname: { $regex: search, $options: "i" } },
        { lname: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const users = await UserModel.find(filter).select(
      "fname lname email phone role status last_login_date verify_email createdAt updatedAt"
    );

    return NextResponse.json(
      {
        success: true,
        message: "Fetched all USER role data successfully",
        data: users,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("GET USERS ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
