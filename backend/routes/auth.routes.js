import { Router } from "express";
import { 
  signup, 
  login, 
  logout, 
  getMe,
  deleteAccount, 
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.js";
import { updatePassword} from "../controllers/auth.controller.js";

const authRouter = Router();
authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/logout", authMiddleware, logout);
authRouter.get("/me", authMiddleware, getMe);
authRouter.put("/update-password", authMiddleware, updatePassword);
authRouter.delete("/delete-account", authMiddleware, deleteAccount);

export default authRouter;