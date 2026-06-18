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

    const totalSize = contents.reduce((acc, curr) => acc + curr.Size, 0);
    const avgSize = totalSize / contents.length;
    
    console.log(`Total images: ${contents.length}`);
    console.log(`Average size: ${(avgSize / 1024 / 1024).toFixed(2)} MB`);
    
    contents.sort((a, b) => b.Size - a.Size);
    console.log(`\nTop 20 largest files:`);
    contents.slice(0, 20).forEach((file, index) => {
      console.log(`${index + 1}. ${file.Key} - ${(file.Size / 1024 / 1024).toFixed(2)} MB`);
    });
  } catch (err) {
    console.error(err);
  }
}

run();
