import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function run() {
  let command = new ListObjectsV2Command({
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

    const thumbs = contents.filter(c => c.Key.includes('/thumb-') || c.Key.startsWith('thumb-'));
    
    if (thumbs.length === 0) {
      console.log("No thumbnails found yet.");
      return;
    }

    const totalThumbSize = thumbs.reduce((acc, curr) => acc + curr.Size, 0);
    const avgThumbSize = totalThumbSize / thumbs.length;
    
    console.log(`Total thumbnails: ${thumbs.length}`);
    console.log(`Average thumbnail size: ${(avgThumbSize / 1024).toFixed(2)} KB`);
    console.log(`Estimated homepage payload (32 products): ${((avgThumbSize * 32) / 1024 / 1024).toFixed(2)} MB`);
    
  } catch (err) {
    console.error(err);
  }
}

run();
