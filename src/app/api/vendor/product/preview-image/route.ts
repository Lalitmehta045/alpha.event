import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
    region: process.env.AWS_S3_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

/**
 * Generate a signed URL for image preview
 * Used in vendor upload forms to show preview of uploaded images
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const key = searchParams.get("key");

        if (!key) {
            return NextResponse.json(
                { success: false, error: "S3 key is required" },
                { status: 400 }
            );
        }

        // If it's already a full URL, return it as-is
        if (key.startsWith("http")) {
            return NextResponse.json({
                success: true,
                url: key,
            });
        }

        // Generate signed URL
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET!,
            Key: key,
        });

        const signedUrl = await getSignedUrl(s3Client as any, command as any, {
            expiresIn: 3600, // 1 hour
        });

        return NextResponse.json({
            success: true,
            url: signedUrl,
        });
    } catch (error) {
        console.error("Vendor preview URL generation error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to generate preview URL",
            },
            { status: 500 }
        );
    }
}
