import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import passport from "passport";
import cors from "cors";
import { connectDB } from "./db/mongo.js";
import authRoutes from "./routes/authRoutes.js";
import questionsRoutes from "./routes/questionsRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import passportConfig from "./config/passport.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// connect to DB
const db = await connectDB().catch((err) => {
  console.error("Failed to connect to MongoDB:", err);
  process.exit(1);
});
passportConfig(passport, db);
app.use((req, res, next) => {
  req.db = db;
  next();
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/questions", questionsRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/companies", companyRoutes);

// serve React frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.resolve(__dirname, "../frontend/dist");

app.use(express.static(frontendPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
