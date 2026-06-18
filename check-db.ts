import mongoose from 'mongoose';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

const uri = process.env.MONGO_URL as string;

mongoose.connect(uri).then(async () => {
  const db = mongoose.connection.db;
  if (!db) throw new Error("Database connection failed");
  const products = await db.collection('products').find({ image: { $regex: '^http' } }).toArray();
  console.log('Products with HTTP links:', products.length);
  products.forEach(p => console.log('- ' + p.name + ':', p.image));

  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
