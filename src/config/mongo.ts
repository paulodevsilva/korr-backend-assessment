import dotenv from "dotenv";
import mongoose from "mongoose";
import { CONFIG } from "./env";

dotenv.config();
export async function connectMongo() {
  try {
    if (!CONFIG.MONGO_URI) {
      throw new Error("Missing MONGO_URI in environment variables");
    }

    await mongoose.connect(CONFIG.MONGO_URI, {
      dbName: CONFIG.MONGO_DB_NAME,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 20000,
    });

    mongoose.connection.on("connected", () => {
      console.log(
        `✅ Connected to MongoDB at ${CONFIG.MONGO_URI}, db=${CONFIG.MONGO_DB_NAME}`
      );
    });

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected");
    });

    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("MongoDB connection closed due to app termination");
      process.exit(0);
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  }
}
