import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import dotenv from "dotenv";

dotenv.config();

const client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 80;

async function streamToBuffer(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on("data", (chunk) => chunks.push(chunk));
    readableStream.on("error", reject);
    readableStream.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

async function fileExists(key) {
  try {
    await client.send(new HeadObjectCommand({ Bucket: process.env.AWS_S3_BUCKET, Key: key }));
    return true;
  } catch (err) {
    if (err.name === 'NotFound') return false;
    throw err;
  }
}

async function processImage(key) {
  if (key.includes('/thumb-') || key.startsWith('thumb-') || !key.match(/\.(jpg|jpeg|png|heic|webp)$/i)) {
    return; // Already a thumbnail or not an image
  }

  const parts = key.split('/');
  const filename = parts.pop();
  const dir = parts.length > 0 ? parts.join('/') + '/' : '';
  const thumbKey = `${dir}thumb-${filename}`;

  try {
    const response = await client.send(new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key
    }));
    
    const buffer = await streamToBuffer(response.Body);
    
    let mainBuffer = await sharp(buffer)
      .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
      .toBuffer();

    let thumbBuffer = await sharp(buffer)
      .resize(400, 400, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
      .toBuffer();

    await client.send(new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: mainBuffer,
      ContentType: "image/jpeg",
      CacheControl: "max-age=31536000",
    }));

    await client.send(new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: thumbKey,
      Body: thumbBuffer,
      ContentType: "image/jpeg",
      CacheControl: "max-age=31536000",
    }));

    console.log(`✅ Processed ${key} (Main: ${(mainBuffer.length/1024).toFixed(0)}KB, Thumb: ${(thumbBuffer.length/1024).toFixed(0)}KB)`);
  } catch (err) {
    console.error(`❌ Failed to process ${key}:`, err.message);
  }
}

async function run() {
  const command = new ListObjectsV2Command({
    Bucket: process.env.AWS_S3_BUCKET,
  });

  try {
    let isTruncated = true;
    let contents = [];

    while (isTruncated) {
      const response = await client.send(command);
      if (response.Contents) contents.push(...response.Contents);
      isTruncated = response.IsTruncated;
      command.input.ContinuationToken = response.NextContinuationToken;
    }

    const filesToProcess = contents.filter(c => c.Size > 0 && !c.Key.includes('/thumb-') && !c.Key.startsWith('thumb-'));
    console.log(`Found ${filesToProcess.length} original images to process.`);

    const concurrency = 5;
    for (let i = 0; i < filesToProcess.length; i += concurrency) {
      const chunk = filesToProcess.slice(i, i + concurrency);
      await Promise.all(chunk.map(c => processImage(c.Key)));
    }

    console.log("Migration complete!");
  } catch (err) {
    console.error(err);
  }
}

run();
