import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

let client;
let db;

export async function connectDB() {
    if (db) return db;

    if (!process.env.MONGO_URI) {
        throw new Error("❌ Missing MONGO_URI in .env");
    }

    try {
        client = new MongoClient(process.env.MONGO_URI);
        await client.connect();
        db = client.db();  // uses default DB from URI
        console.log("✅ MongoDB Connected");
        return db;
    } catch (err) {
        console.error("❌ MongoDB connection error:", err);
        throw err;
    }
}
