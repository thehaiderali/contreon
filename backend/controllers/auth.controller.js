import User from "../models/user.model.js"
import { errorParser, signUpSchema } from "../validation/zod.js"
import { loginSchema } from "../validation/zod.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import { envConfig } from "../config/env.js";



export async function signup(req,res){
    try {

     const {success,data,error}=signUpSchema.safeParse(req.body);
     if(!success){
        return res.status(400).json({
            success:false,
            error:errorParser(error)
        })
     }   

    const existingUser=await User.findOne({email:data.email});
    if(existingUser){
        return res.status(400).json({
            success:false,
            error:"User email already exists. Please Login"
        })
    } 

    const hashedPassword=await bcrypt.hash(data.password, 10)
    const user=new User({
        fullName:data.fullName,
        email:data.email,
        password:hashedPassword,
        role:data.role
    })
    await user.save()
    const response=user.toObject();
    delete response.password;
    return res.status(201).json({
        success:true,
        data:{
            user:response
        }
    })
    } catch (error) {

        console.log('Error in User Signup :',error)
        return res.status(500).json({
            success:false,
            error:"Internal Server Error"
        })        
    }
}




export async function login(req,res){
    try {

     const {success,data,error}=loginSchema.safeParse(req.body);
     if(!success){
        return res.status(400).json({
            success:false,
            error:errorParser(error)
        })
     }   

    const existingUser=await User.findOne({email:data.email});
    if(!existingUser){
        return res.status(400).json({
            success:false,
            error:"User email doesnot exists. Please Sign up"
        })
    } 

    const isMatch=await bcrypt.compare(data.password,existingUser.password)
        if(!isMatch){
            return res.status(400).json({
                success:false,
                error:"User Password did not match . Try Again"
            })
        }
        const token=jwt.sign({
            userId:existingUser._id,
            role:existingUser.role,
        },envConfig.JWT_SECRET,{
            expiresIn:"7d"
        })

        res.cookie("token",token,{
            httpOnly:true,
            secure:false,// Will Make it True if Deployed
            sameSite :"lax",
            maxAge:7*24*60*60*1000  //7days
        })

        return res.status(200).json({
            success:true,
            data:{
                message:"User logged in Successfully"
            }
        })

    } catch (error) {

        console.log('Error in User Login :',error)
        return res.status(500).json({
            success:false,
            error:"Internal Server Error"
        })        
    }
}

export async function logout(req,res){

    try {
        res.clearCookie("token");
        return res.status(200).json({
            success:false,
            data:{
                message:"User Logged out Successfully"
            }
        })

    } catch (error) {
        console.log("Error in Logout : ",error);
        return res.status(500).json({
            success:false,
            error:"Internal Server Error"
        })
    }


}