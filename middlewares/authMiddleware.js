import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// extract id from jwt token and attach it to req.user.id
export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header not found!" });
  }

  const authToken = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
    };
    next();
  } catch (error) {
    console.log("Token verification failed!", error);
    res.status(403).json({ message: "Invalid or expired token!" });
  }
};
