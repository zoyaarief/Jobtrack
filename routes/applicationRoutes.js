import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
   createApplication,
   getAllApplications,
   getApplication,
   updateApplication,
   deleteApplication,
} from "../controllers/applicationsController.js";

const router = express.Router();

router.post("/", authMiddleware, createApplication);
router.get("/", authMiddleware, getAllApplications);
router.get("/:id", authMiddleware, getApplication);
router.put("/:id", authMiddleware, updateApplication);
router.delete("/:id", authMiddleware, deleteApplication);

export default router;
