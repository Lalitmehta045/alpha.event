import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Server-side HEIC → JPEG conversion endpoint.
 *
 * Uses `heic-convert` (pure JS decoder) for HEIC→raw conversion,
 * then `sharp` for resize + JPEG compression.
 *
 * This two-step approach works on all platforms (including Windows
 * where sharp's built-in HEIF codec may not be available).
 */
export async function POST(request: NextRequest) {
    try {
        const buffer = Buffer.from(await request.arrayBuffer());

        if (buffer.length === 0) {
            return NextResponse.json(
                { error: "Empty request body" },
                { status: 400 }
            );
        }

        console.log(
            `[convert-heic] Received ${(buffer.length / 1024).toFixed(0)} KB for conversion`
        );

        // Step 1: Decode HEIC using heic-convert (works on all platforms)
        const heicConvert = (await import("heic-convert")).default;
        const rawJpegBuffer = await heicConvert({
            buffer: buffer,
            format: "JPEG",
            quality: 0.9,
        });

        console.log(
            `[convert-heic] HEIC decoded: ${(buffer.length / 1024).toFixed(0)} KB → ${(rawJpegBuffer.byteLength / 1024).toFixed(0)} KB (raw JPEG)`
        );

        // Step 2: Resize + optimize with sharp (always works for JPEG input)
        const optimizedBuffer = Buffer.from(
            await sharp(Buffer.from(rawJpegBuffer))
                .rotate()
                .resize(1920, 1920, {
                    fit: "inside",
                    withoutEnlargement: true,
                })
                .jpeg({ quality: 85, mozjpeg: true })
                .toBuffer()
        );

        console.log(
            `[convert-heic] Final: ${(optimizedBuffer.length / 1024).toFixed(0)} KB`
        );

        return new NextResponse(new Uint8Array(optimizedBuffer), {
            status: 200,
            headers: {
                "Content-Type": "image/jpeg",
                "Content-Length": String(optimizedBuffer.length),
            },
        });
    } catch (error) {
        console.error("[convert-heic] Conversion failed:", error);
        return NextResponse.json(
            {
                error:
                    error instanceof Error ? error.message : "HEIC conversion failed",
            },
            { status: 500 }
        );
    }
}
