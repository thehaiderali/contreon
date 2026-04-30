import jwt from "jsonwebtoken"
import { envConfig } from "../config/env.js";
import User from "../models/user.model.js";

export const verifyToken = (req, res, next) => {
  let token = req.cookies.token;
  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }
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

export const checkCreatorExists=async(req,res,next)=>{
  try {
    const role=req.user.role;
    if(role!=="creator"){
      return res.status(403).json({
        success:false,
        error:"Creator Access Required"
      })
    }
    const userExists=await User.findById(req.user.userId);
    if(!userExists){
      return res.status(404).json({
        success:false,
        error:"User not found "
      })
    }
    if(userExists.role!=="creator"){
      return res.status(403).json({
        success:false,
        error:"Creator Access Required"
      })
    }
    next()
  } catch (error) {
    return res.status(500).json({
      success:false,
      error:"Internal Server Error"
    })
  }
}

export const checkSubscriberExists=async(req,res,next)=>{
  try {
    const role=req.user.role;
    if(role!=="subscriber"){
      return res.status(403).json({
        success:false,
        error:"Subscriber Access Required"
      })
    }
    const userExists=await User.findById(req.user.userId);
    if(!userExists){
      return res.status(404).json({
        success:false,
        error:"User not found "
      })
    }
    if(userExists.role!=="subscriber"){
      return res.status(403).json({
        success:false,
        error:"Subscriber Access Required"
      })
    }
    next()
  } catch (error) {
    return res.status(500).json({
      success:false,
      error:"Internal Server Error"
    })
  }
}

export const checkAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const authMiddleware = verifyToken;