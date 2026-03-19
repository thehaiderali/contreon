import { Router } from "express";
import { signup,login,logout } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth";


const authRouter=Router();
authRouter.post("/signup",signup);
authRouter.post("/login",login);
authRouter.post("/",authMiddleware,logout)

export default authRouter
