import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import RecentModel from "@/lib/models/Recent.model";
import { attachSignedUrlsAndThumbnails, clearS3Cache } from "@/utils/s3Signer";

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
    console.error("Get admin recent error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent products" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    let { image, title, description, order } = await req.json();

    if (!image || order === undefined) {
      return NextResponse.json(
        { error: "Image and order are required" },
        { status: 400 }
      );
    }

    // Set default title if empty
    if (!title || title.trim() === "") {
      title = "Untitled";
    }

    const existing = await RecentModel.findOne({ order });
    let recent;
    if (existing) {
      existing.image = image;
      existing.title = title;
      existing.description = description;
      recent = await existing.save();
    } else {
      recent = await RecentModel.create({ image, title, description, order });
    }

    // Clear cache for this image so fresh URL is generated
    clearS3Cache(image);

    return NextResponse.json({
      success: true,
      data: recent,
    });
  } catch (error) {
    console.error("Create recent error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to create recent product" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 }
      );
    }

    await RecentModel.findByIdAndDelete(id);
    return NextResponse.json({
      success: true,
      message: "Recent product deleted",
    });
  } catch (error) {
    console.error("Delete recent error:", error);
    return NextResponse.json(
      { error: "Failed to delete recent product" },
      { status: 500 }
    );
  }
}