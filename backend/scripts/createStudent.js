// scripts/createStudent.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dns from 'dns';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// DNS fix
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Load .env
const envPath = path.resolve(__dirname, '../.env');
console.log(`📄 Looking for .env at: ${envPath}`);
if (fs.existsSync(envPath)) {
  console.log('✅ .env file found.');
} else {
  console.warn('⚠️ .env file not found.');
}
dotenv.config({ path: envPath });

import User from '../models/userModel.js';

const createStudent = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI ||
      process.env.MONGO_URI ||
      process.env.DATABASE_URL ||
      process.env.DB_URI;

    if (!mongoUri) {
      console.error('\n❌ No MongoDB URI found.');
      process.exit(1);
    }

    console.log(`\n✅ Connecting to MongoDB...`);
    await mongoose.connect(mongoUri);
    console.log('✅ Connected.');

    // ─── Student credentials ─────────────────────────────────
    const studentData = {
      fullName: 'Abraham Uyoattah',
      studentId: 'u1cs2214',
      institutionalEmail: 'abraham.uyoattah@gmail.com',
      department: 'Computer Science',
      yearOfStudy: 2,
      password: 'abstudentpass', // plain – will be hashed by model
      role: 'user',
      isVerified: true,
      phoneNumber: '08012345678',
      gender: 'male',
    };

    // Check if already exists
    const existing = await User.findOne({
      $or: [
        { studentId: studentData.studentId },
        { institutionalEmail: studentData.institutionalEmail },
      ],
    });

    if (existing) {
      console.log('⚠️ Student already exists. Skipping.');
      console.log(`   Existing email: ${existing.institutionalEmail}`);
      process.exit(0);
    }

    const student = new User(studentData);
    await student.save();

    console.log(`\n✅ Student created successfully!`);
    console.log(`   Name: ${studentData.fullName}`);
    console.log(`   Matric No: ${studentData.studentId}`);
    console.log(`   Email: ${studentData.institutionalEmail}`);
    console.log(`   Password: ${studentData.password}`);
    console.log(`   Role: ${studentData.role}`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
};

createStudent();