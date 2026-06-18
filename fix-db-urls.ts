import mongoose from 'mongoose';
import { loadEnvConfig } from '@next/env';

// Load environment variables from .env.local / .env
loadEnvConfig(process.cwd());

const uri = process.env.MONGO_URL;

if (!uri) {
  console.error("No MONGO_URL found in environment variables.");
  process.exit(1);
}

async function run() {
  try {
    await mongoose.connect(uri as string);
    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection failed");

    // 1. Fix Products
    const products = await db.collection('products').find({ image: { $regex: '^http' } }).toArray();
    console.log(`Found ${products.length} products with HTTP links.`);

    let productsFixed = 0;
    for (const p of products) {
      if (p.image && Array.isArray(p.image)) {
        const newImages = p.image.map((url: string) => {
          try {
            if (url.includes('amazonaws.com/')) {
              const parsedUrl = new URL(url);
              // pathname starts with '/' so we substring(1)
              return decodeURIComponent(parsedUrl.pathname.substring(1));
            }
            return url;
          } catch (e) {
            return url;
          }
        });

        await db.collection('products').updateOne(
          { _id: p._id },
          { $set: { image: newImages } }
        );
        productsFixed++;
      }
    }
    console.log(`Fixed ${productsFixed} products.`);

    // 2. Fix Recents (just in case they have the same issue)
    const recents = await db.collection('recents').find({ image: { $regex: '^http' } }).toArray();
    console.log(`Found ${recents.length} recents with HTTP links.`);

    let recentsFixed = 0;
    for (const r of recents) {
      if (typeof r.image === 'string') {
        let newImage = r.image;
        try {
          if (r.image.includes('amazonaws.com/')) {
            const parsedUrl = new URL(r.image);
            newImage = decodeURIComponent(parsedUrl.pathname.substring(1));
          }
        } catch (e) { }

        if (newImage !== r.image) {
          await db.collection('recents').updateOne(
            { _id: r._id },
            { $set: { image: newImage } }
          );
          recentsFixed++;
        }
      }
    }
    console.log(`Fixed ${recentsFixed} recents.`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
