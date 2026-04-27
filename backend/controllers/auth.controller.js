import User from "../models/user.model.js"
import { errorParser, signUpSchema } from "../validation/zod.js"
import { loginSchema } from "../validation/zod.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import { envConfig } from "../config/env.js";
import { signupWelcomeEmail,sendEmail } from "../emails/templates.js";


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

    // Send welcome email
    try {
        const loginUrl = `${envConfig.FRONTEND_URL}/login`;
        await sendEmail(
            data.email,
            `Welcome to Contreon, ${data.fullName}!`,
            signupWelcomeEmail(data.fullName, data.email, loginUrl)
        );
    } catch (emailError) {
        console.log('Welcome email could not be sent:', emailError.message);
    }

    return res.status(201).json({
        success:true,
        data:{
            message:"User Signed up Successfully"
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

        const user=existingUser.toObject()
        delete user.password
        res.cookie("token",token,{
            httpOnly:true,
            secure:true,
            sameSite :"none",
            maxAge:7*24*60*60*1000  //7days
        })

        return res.status(200).json({
            success:true,
            data:{
                message:"User logged in Successfully",
                user
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
            res.clearCookie("token", {
            httpOnly: true,
            sameSite: "none",
            secure: true, 
        });
        return res.status(200).json({
            success:true,
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


export async function getMe(req, res) {
  try {
    const userId = req.user.userId; // from JWT

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    console.log("Error in getMe:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
}