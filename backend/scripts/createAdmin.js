// scripts/createAdmin.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dns from 'dns';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// DNS fix (Windows/VPN)
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Load .env
const envPath = path.resolve(__dirname, '../.env');
console.log(`📄 Looking for .env at: ${envPath}`);
if (fs.existsSync(envPath)) {
  console.log('✅ .env file found.');
} else {
  console.warn('⚠️ .env file not found at expected location.');
}
dotenv.config({ path: envPath });

import User from '../models/userModel.js';

const createAdmin = async () => {
  try {
    // Find MongoDB URI
    const mongoUri =
      process.env.MONGODB_URI ||
      process.env.MONGO_URI ||
      process.env.DATABASE_URL ||
      process.env.DB_URI;

    if (!mongoUri) {
      console.error('\n❌ No MongoDB URI found in environment variables.');
      process.exit(1);
    }

    console.log(`\n✅ Connecting to MongoDB...`);
    await mongoose.connect(mongoUri);
    console.log('✅ Connected.');

    // Admin credentials (plain password – model will hash)
    const adminData = {
      fullName: 'Abraham Uyoattah',
      studentId: 'ADMIN001',
      institutionalEmail: 'Abrahamuyoattah@gmail.com',
      department: 'Administration',
      yearOfStudy: 1,
      password: 'abadminpass', // plain – NOT hashed
      role: 'super_admin',
      isVerified: true,
      phoneNumber: '',
      gender: 'other',
    };

    // Check if admin already exists
    const existing = await User.findOne({
      $or: [
        { studentId: adminData.studentId },
        { institutionalEmail: adminData.institutionalEmail },
      ],
    });

    if (existing) {
      console.log('⚠️ Admin already exists. Skipping creation.');
      console.log(`   Existing email: ${existing.institutionalEmail}`);
      process.exit(0);
    }

    // Create the admin – pre("save") will hash the password
    const admin = new User(adminData);
    await admin.save();

    console.log(`\n✅ Admin created successfully!`);
    console.log(`   Name: ${adminData.fullName}`);
    console.log(`   Email: ${adminData.institutionalEmail}`);
    console.log(`   Password: ${adminData.password}`);
    console.log(`   Role: ${adminData.role}`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();