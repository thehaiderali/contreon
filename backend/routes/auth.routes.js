import { Router } from "express";
import { signup,login,logout,getMe } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.js";

const authRouter=Router();
authRouter.post("/signup",signup);
authRouter.post("/login",login);
authRouter.post("/logout",authMiddleware,logout);
authRouter.get("/me",authMiddleware,getMe);

export default authRouter
