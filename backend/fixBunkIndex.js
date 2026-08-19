// fixBunkIndex.js
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const run = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB:", conn.connection.name); // confirm this says "abraham"

  const collection = mongoose.connection.collection("bunks");

  const indexesBefore = await collection.indexes();
  console.log("Indexes BEFORE:");
  console.log(JSON.stringify(indexesBefore, null, 2));

  // Drop ANY index that references roomNumber, whatever it's actually named
  for (const idx of indexesBefore) {
    if (idx.key && Object.keys(idx.key).includes("roomNumber")) {
      console.log(`⚠️ Dropping bad index: ${idx.name}`);
      await collection.dropIndex(idx.name);
    }
  }

  // Recreate the correct one (safe if it already exists)
  await collection.createIndex(
    { roomId: 1, bunkNumber: 1 },
    { unique: true, name: "roomId_1_bunkNumber_1" }
  );

  const indexesAfter = await collection.indexes();
  console.log("Indexes AFTER:");
  console.log(JSON.stringify(indexesAfter, null, 2));

  process.exit(0);
};

run().catch(err => {
  console.error("Script failed:", err);
  process.exit(1);
});