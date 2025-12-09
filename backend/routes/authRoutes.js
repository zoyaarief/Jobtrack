import express from "express";
import {
    login,
    register,
    getUser,
    updateUser,
    updatePassword,
} from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * PUBLIC ROUTES
 * Fix: Use exact paths /register and /login
 */
router.post("/register", register);
router.post("/login", login);

/**
 * PROTECTED ROUTES
 * Fix: Use exact paths
 * (use authMiddleware)
 */
router.get("/me", authMiddleware, getUser);
router.put("/me", authMiddleware, updateUser);
router.put("/me/password", authMiddleware, updatePassword);

// The catch-all 404 route is fine as is
router.all("*", (req, res) => {
    return res.status(404).json({ message: "Auth route not found" });
});

export default router;