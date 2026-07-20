import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = "mongodb+srv://decorationsalpha_admin:decorationsVinuGudda@alphartevent.rxpkkde.mongodb.net/";

const userSchema = new mongoose.Schema({
  fname: String, lname: String, email: String, password: String, role: String,
  vendorStatus: String, businessName: String, businessPhone: String, phone: String
}, { strict: false });
const User = mongoose.models.User || mongoose.model("User", userSchema);

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to DB");

  const password = await bcrypt.hash("password123", 10);

  // 1. Create Admin
  await User.findOneAndUpdate(
    { email: "admin@test.com" },
    {
      fname: "Admin", lname: "Test", email: "admin@test.com", password,
      role: "ADMIN", status: "Active"
    },
    { upsert: true, new: true }
  );
  console.log("Admin seeded: admin@test.com / password123");

  // 2. Create Vendor
  await User.findOneAndUpdate(
    { email: "vendor@test.com" },
    {
      fname: "Vendor", lname: "Test", email: "vendor@test.com", password,
      role: "VENDOR", vendorStatus: "Approved", status: "Active",
      businessName: "Test Vendor Business", businessPhone: "9999999999", phone: "8888888888"
    },
    { upsert: true, new: true }
  );
  console.log("Vendor seeded: vendor@test.com / password123");

  // 3. Create User
  await User.findOneAndUpdate(
    { email: "user@test.com" },
    {
      fname: "User", lname: "Test", email: "user@test.com", password,
      role: "USER", status: "Active", phone: "7777777777"
    },
    { upsert: true, new: true }
  );
  console.log("User seeded: user@test.com / password123");

  process.exit(0);
}

seed();
