import jwt from "jsonwebtoken";
import { envConfig } from "../config/env.js";

export const generateToken = (payload) => {
  return jwt.sign(payload, envConfig.JWT_SECRET, {
    expiresIn: "7d"
  });
};