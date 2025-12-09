import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

/**
 * REGISTER USER
 */
export const register = async (req, res) => {
  try {
    const db = req.db;
    const users = db.collection("users");

    const { firstName, lastName, username, email, password } = req.body;

    if (!firstName || !lastName || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await users.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: "Email already exists" });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ message: "Username already exists" });
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await users.insertOne({
      firstName,
      lastName,
      username,
      email,
      password: passwordHash,
      createdAt: new Date(),
    });

    return res.status(200).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * LOGIN
 */
export const login = async (req, res) => {
  try {
    const db = req.db;
    const users = db.collection("users");

    const { identifer, password } = req.body;

    if (!identifer || !password) {
      return res
        .status(400)
        .json({ message: "Identifier and password are required" });
    }

    const user = await users.findOne({
      $or: [{ email: identifer }, { username: identifer }],
    });

    if (!user) {
      return res.status(400).json({
        message: "User does not exist",
      });
    }

    const isPassMatch = await bcrypt.compare(password, user.password);
    if (!isPassMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
};

/**
 * GET USER PROFILE
 */
export const getUser = async (req, res) => {
  try {
    const db = req.db;
    const users = db.collection("users");

    let userId = req.user.id;

    if (typeof userId === "string") {
      userId = new ObjectId(userId);
    }

    const user = await users.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * UPDATE PROFILE (FINAL ROBUST FIX)
 */
export const updateUser = async (req, res) => {
  try {
    const db = req.db;
    const users = db.collection("users");
    const questions = db.collection("questions");

    // 1. Prepare IDs
    const userIdString = String(req.user.id);
    let userIdObj;
    try {
      userIdObj = new ObjectId(userIdString);
    } catch {
      userIdObj = null;
    }
    // Get the current email from the token (before update)
    const currentEmail = req.user.email;

    const { firstName, lastName, username, email } = req.body;

    if (!firstName || !lastName || !username || !email) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2. Check for duplicates
    const existingUser = await users.findOne({
      _id: { $ne: userIdObj },
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: "Email already taken" });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ message: "Username already taken" });
      }
    }

    const updateData = {
      firstName,
      lastName,
      username,
      email,
      updatedAt: new Date(),
    };

    // 3. Update User
    const result = await users.updateOne(
      { _id: userIdObj },
      { $set: updateData },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // 4. 💡 CATCH-ALL SYNC: Update questions by ID *OR* by Email
    // This fixes the issue if you re-registered and have a new ID but same email.
    const questionUpdateResult = await questions.updateMany(
      {
        $or: [
          { userId: userIdString }, // Match by String ID
          { userId: userIdObj }, // Match by Object ID
          { userEmail: currentEmail }, // 💡 Match by your current Email (The Fix)
        ],
      },
      {
        $set: {
          userEmail: email, // Sync new email
          username: username, // Sync new username
        },
      },
    );

    console.log(
      `Profile Updated. Synced ${questionUpdateResult.modifiedCount} questions to username: ${username}`,
    );

    return res.status(200).json({
      message: "Profile updated successfully",
      user: updateData,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * UPDATE PASSWORD
 */
export const updatePassword = async (req, res) => {
  try {
    const db = req.db;
    const users = db.collection("users");

    let userId = req.user.id;
    if (typeof userId === "string") {
      userId = new ObjectId(userId);
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Both passwords are required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters" });
    }

    const user = await users.findOne({ _id: userId });

    if (!user) return res.status(404).json({ message: "User not found" });

    const isValid = await bcrypt.compare(currentPassword, user.password);

    if (!isValid) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    const newHash = await bcrypt.hash(newPassword, 12);

    await users.updateOne(
      { _id: userId },
      { $set: { password: newHash, updatedAt: new Date() } },
    );

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
