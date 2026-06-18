const mongoose = require('mongoose');
require('dotenv').config({path: '.env'});

const uri = process.env.MONGO_URL;

mongoose.connect(uri).then(async () => {
  const db = mongoose.connection.db;
  const products = await db.collection('products').find({ image: { $regex: '^http' } }).toArray();
  console.log('Products with HTTP links:', products.length);
  products.forEach(p => console.log('- ' + p.name + ':', p.image));
  
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
