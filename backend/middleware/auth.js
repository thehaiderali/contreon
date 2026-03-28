import jwt from "jsonwebtoken"
import { envConfig } from "../config/env.js";


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

export const checkCreator=async(req,res,next)=>{

  try {
   
    const role=req.user.role;
    if(role!=="creator"){
      return res.status(403).json({
        success:false,
        error:"Creator Access Required"
      })
    }
    else{
      next()
    }
  } catch (error) {
    return res.status(500).json({
      success:false,
      error:"Internal Server Error"
    })
  }

}