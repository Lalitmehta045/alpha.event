import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import AIConceptModel from "@/lib/models/AIConcept.model";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    // Next.js 15+ requires params to be awaited
    const params = await context.params;
    const id = params.id;

    await connectDB();
    const concept = await AIConceptModel.findById(id);
    if (!concept) return new NextResponse("Not Found", { status: 404 });

    const opt = req.nextUrl.searchParams.get("opt") || "A";
    const dataUri = opt === "B" ? concept.variationBUrl : concept.variationAUrl;

    if (!dataUri) return new NextResponse("Image not available", { status: 404 });

    // Handle base64 Data URI
    if (dataUri.startsWith("data:")) {
      const parts = dataUri.split(",");
      if (parts.length === 2) {
        const mime = parts[0].split(":")[1].split(";")[0];
        const base64 = parts[1];
        const buffer = Buffer.from(base64, "base64");
        
        return new NextResponse(buffer, {
          headers: {
            "Content-Type": mime,
            "Cache-Control": "public, max-age=31536000",
          },
        });
      }
    }

    // Fallback if it's a regular URL
    return NextResponse.redirect(dataUri);
  } catch (error) {
    console.error("Image route error:", error);
    return new NextResponse("Server Error", { status: 500 });
  }
}
