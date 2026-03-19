import jwt from "jsonwebtoken"
import { envConfig } from "../config/env";


export const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: "No Auth token Found" });

  try {
    const decoded = jwt.verify(token, envConfig.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid Auth token" });
  }
};