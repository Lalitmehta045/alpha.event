import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import RecentModel from "@/lib/models/Recent.model";
import { attachSignedUrlsAndThumbnails } from "@/utils/s3Signer";

export async function GET() {
  try {
    await connectDB();
    const recents = await RecentModel.find({ order: { $exists: true } }).sort({ order: 1 });

    const recentsLean = recents.map((r: any) => r.toObject());
    const recentsWithUrls = await attachSignedUrlsAndThumbnails(recentsLean);

    return NextResponse.json({
      success: true,
      data: recentsWithUrls,
    });
  } catch (error) {
    console.error("Get recent error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent products" },
      { status: 500 }
    );
  }
}