import { Router } from "express";
import { signup,login,logout } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.js";


const authRouter=Router();
authRouter.post("/signup",signup);
authRouter.post("/login",login);
authRouter.post("/logout",authMiddleware,logout)

export default authRouter
