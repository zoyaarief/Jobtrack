// src/routes/questionsRoutes.js
import express from "express";
import { ObjectId } from "mongodb";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

/* -----------------------------------------
   CREATE (Protected)
------------------------------------------ */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const db = req.db;
    const body = req.body || {};

    if (!body.company || !body.questionTitle) {
      return res
        .status(400)
        .json({ error: "company and questionTitle are required" });
    }

    const question = {
      company: body.company.trim(),
      role: body.role?.trim() || null,
      questionTitle: body.questionTitle.trim(),
      questionDetail: body.questionDetail?.trim() || "",
      userEmail: req.user.email,
      userId: req.user.id, // We link using this ID
      createdAt: Date.now(),
    };

    const result = await db.collection("questions").insertOne(question);

    res.status(201).json({
      insertedId: result.insertedId,
      message: "Question added successfully",
    });
  } catch (err) {
    console.error("Failed to create question:", err);
    res.status(500).json({ error: "Failed to add question" });
  }
});

/* -----------------------------------------
   READ (LIST) (Public) - WITH LIVE USERNAME LOOKUP
------------------------------------------ */
router.get("/", async (req, res) => {
  try {
    const db = req.db;
    const { company, role, sort = "recent", page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    if (isNaN(pageNumber) || pageNumber < 1)
      return res.status(400).json({ error: "Invalid page number" });
    if (isNaN(limitNumber) || limitNumber < 1)
      return res.status(400).json({ error: "Invalid limit" });

    // Build Query
    let query = {};
    if (company) query.company = { $regex: new RegExp(company, "i") };
    if (role) query.role = { $regex: new RegExp(role, "i") };

    // Sort Options
    let sortOptions = { createdAt: -1 };
    if (sort === "oldest") sortOptions = { createdAt: 1 };

    // Pagination
    const totalQuestions = await db
      .collection("questions")
      .countDocuments(query);
    const totalPages = Math.ceil(totalQuestions / limitNumber);
    const skip = (pageNumber - 1) * limitNumber;

    // 1. Fetch the Raw Questions
    const questionsList = await db
      .collection("questions")
      .find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNumber)
      .toArray();

    // ---------------------------------------------------------------
    // 💡 FIX: LIVE USERNAME LOOKUP
    // Fetch the latest username from the 'users' collection for these questions
    // ---------------------------------------------------------------

    // Extract all User IDs from the current page of questions
    const userIds = questionsList
      .map((q) => {
        try {
          return new ObjectId(q.userId);
        } catch {
          return null;
        }
      })
      .filter((id) => id !== null);

    if (userIds.length > 0) {
      // Find these users in the DB
      const users = await db
        .collection("users")
        .find({ _id: { $in: userIds } })
        .project({ username: 1 }) // We only need the username
        .toArray();

      // Create a lookup map: { "userId": "Username" }
      const userMap = {};
      users.forEach((u) => {
        userMap[u._id.toString()] = u.username;
      });

      // Attach the FRESH username to each question
      questionsList.forEach((q) => {
        // If we found a live username, use it. Otherwise keep the old/default one.
        if (q.userId && userMap[q.userId]) {
          q.username = userMap[q.userId];
        }
      });
    }
    // ---------------------------------------------------------------

    res.status(200).json({
      questions: questionsList,
      totalQuestions,
      totalPages,
      currentPage: pageNumber,
      limit: limitNumber,
    });
  } catch (err) {
    console.error("Failed to fetch questions:", err);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

/* -----------------------------------------
   READ (GET SINGLE)
------------------------------------------ */
router.get("/:id", async (req, res) => {
  try {
    const id = new ObjectId(req.params.id);
    const db = req.db;
    const question = await db.collection("questions").findOne({ _id: id });

    if (!question) return res.status(404).json({ error: "Question not found" });

    // Optional: Also fetch live username for single view
    try {
      if (question.userId) {
        const user = await db
          .collection("users")
          .findOne(
            { _id: new ObjectId(question.userId) },
            { projection: { username: 1 } },
          );
        if (user) question.username = user.username;
      }
    } catch {
      // ignore lookup errors
    }

    res.json(question);
  } catch (err) {
    console.error("Failed to fetch question:", err);
    res.status(500).json({ error: "Failed to fetch question" });
  }
});

/* -----------------------------------------
   UPDATE (Protected)
------------------------------------------ */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const id = new ObjectId(req.params.id);
    const db = req.db;
    const updates = req.body;
    const allowedFields = [
      "company",
      "role",
      "questionTitle",
      "questionDetail",
    ];

    const existing = await db.collection("questions").findOne({ _id: id });
    if (!existing) return res.status(404).json({ error: "Question not found" });

    if (existing.userEmail !== req.user.email) {
      return res
        .status(403)
        .json({ error: "Not authorized to update this question" });
    }

    const allowedUpdates = {};
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        allowedUpdates[key] =
          typeof updates[key] === "string" ? updates[key].trim() : updates[key];
      }
    }

    if (Object.keys(allowedUpdates).length === 0)
      return res.status(400).json({ error: "No valid fields" });

    allowedUpdates.updatedAt = Date.now();
    await db
      .collection("questions")
      .updateOne({ _id: id }, { $set: allowedUpdates });

    res.json({ message: "Question updated successfully" });
  } catch (err) {
    console.error("Failed to update question:", err);
    res.status(500).json({ error: "Failed to update question" });
  }
});

/* -----------------------------------------
   DELETE (Protected)
------------------------------------------ */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const id = new ObjectId(req.params.id);
    const db = req.db;

    const existing = await db.collection("questions").findOne({ _id: id });
    if (!existing) return res.status(404).json({ error: "Question not found" });

    if (existing.userEmail !== req.user.email) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this question" });
    }

    await db.collection("questions").deleteOne({ _id: id });
    res.json({ message: "Question deleted successfully" });
  } catch (err) {
    console.error("Failed to delete question:", err);
    res.status(500).json({ error: "Failed to delete question" });
  }
});

export default router;
