import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./db/connect.js";

import authRoutes from "./routes/authRoutes.js";
import questionsRoutes from "./routes/questionsRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// --- Enable CORS for your frontend ---
app.use(cors({
  origin: ["https://jobtrack-x9mu.onrender.com"], // your frontend Render URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Database Connection ---
async function startServer() {
  try {
    const db = await connectDB();
    console.log("Database connected.");

    // make db available to routes
    app.use((req, res, next) => {
      req.db = db;
      next();
    });

    // --- API routes ---
    app.use("/api/auth", authRoutes);
    app.use("/api/questions", questionsRoutes);
    app.use("/api/applications", applicationRoutes);
    app.use("/api/companies", companyRoutes);

    // --- Health Check ---
    app.get("/api/health", (req, res) => {
      res.json({ status: "ok", database: "connected" });
    });

    // --- Serve frontend build ---
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    app.use(express.static(path.join(__dirname, "frontend", "dist")));

    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
    });

    // --- Start server ---
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Server startup failed:", err);
  }
}

startServer();
