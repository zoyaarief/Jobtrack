// backend/server.js
import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./db/mongo.js";
import authRoutes from "./routes/authRoutes.js";
import questionsRoutes from "./routes/questionsRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import passport from "passport";

// 💡 FIX: Ensure this import has the .js extension!
import passportConfig from "./config/passport.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 💡 FIX: Initialize Passport before routes
app.use(passport.initialize());

// 2. Connect to Database & Start Server
// We wrap this in an immediately invoked async function
(async () => {
    try {
        const db = await connectDB();
        console.log("✅ Connected to MongoDB");

        // 💡 FIX: Register the Passport Strategy immediately after DB connects
        passportConfig(passport, db);
        console.log("✅ Passport Strategy Registered");

        // Attach DB to request
        app.use((req, res, next) => {
            req.db = db;
            next();
        });

        // 3. API Routes
        app.use("/api/auth", authRoutes);
        app.use("/api/questions", questionsRoutes);
        app.use("/api/applications", applicationRoutes);
        app.use("/api/companies", companyRoutes);

        // 4. Frontend Serving
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const frontendPath = path.resolve(__dirname, "../frontend/dist");

        app.use(express.static(frontendPath));
        app.get("*", (req, res) => {
            res.sendFile(path.join(frontendPath, "index.html"));
        });

        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

    } catch (err) {
        console.error("❌ Fatal Server Error:", err);
        process.exit(1);
    }
})();