import { NextRequest, NextResponse } from "next/server";
import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";

const client = new S3Client({
  region: process.env.AWS_S3_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filename = searchParams.get("filename") || `upload-${Date.now()}.jpg`;

    const Key = `uploads/${filename}`;

    const presigned = await createPresignedPost(client, {
      Bucket: process.env.AWS_S3_BUCKET!,
      Key,
      Conditions: [
        ["content-length-range", 0, 10_000_000], // 10MB max
      ],
      Fields: {
        key: Key,
      },
      Expires: 60, // 1 minute
    });

    return NextResponse.json({
      url: presigned.url,
      fields: presigned.fields,
      key: Key,
    });
  } catch (err) {
    console.error("Presign error:", err);
    return NextResponse.json(
      { error: "Failed to generate presigned URL" },
      { status: 500 }
    );
  }
}

// import { NextRequest, NextResponse } from "next/server";
// import { S3Client } from "@aws-sdk/client-s3";
// import { createPresignedPost } from "@aws-sdk/s3-presigned-post";

// const client = new S3Client({
//   region: process.env.AWS_S3_REGION!,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
//   },
// });

// export async function GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const filename = searchParams.get("filename") || `upload-${Date.now()}.jpg`;
//     const contentType = searchParams.get("contentType") || "image/jpeg";

//     const Key = `${Date.now()}-${filename}`;

//     const presigned = await createPresignedPost(client, {
//       Bucket: process.env.AWS_S3_BUCKET!,
//       Key,
//       Conditions: [
//         ["content-length-range", 0, 10_000_000],
//         ["starts-with", "$Content-Type", ""],
//       ],
//       Fields: {
//         key: Key,
//         acl: "public-read",
//         "Content-Type": contentType,
//       },
//       Expires: 60,
//     });

//     return NextResponse.json({
//       url: presigned.url,
//       fields: presigned.fields,
//       key: Key,
//     });
//   } catch (err) {
//     console.error("Presign error:", err);
//     return NextResponse.json(
//       { error: "Failed to generate presigned URL" },
//       { status: 500 }
//     );
//   }
// }

// import { S3Client } from "@aws-sdk/client-s3";
// import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
// import { NextRequest } from "next/server";

// export async function GET(req:NextRequest) {
//   const { searchParams } = new URL(req.url);
//   const filename = searchParams.get("filename");
//   const contentType = searchParams.get("contentType") || "image/jpeg";

//   const s3 = new S3Client({
//     region: process.env.AWS_REGION,
//     credentials: {
//       accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
//       secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
//     },
//   });

//   const { url, fields } = await createPresignedPost(s3, {
//     Bucket: process.env.AWS_BUCKET_NAME!,
//     Key: `uploads/${Date.now()}-${filename}`,
//     Fields: { "Content-Type": contentType },
//     Conditions: [["content-length-range", 0, 10485760]], // max 10MB
//     Expires: 60,
//   });

//   return Response.json({ url, fields, key: fields.key });
// }
