import User from "../models/user.model.js"
import { errorParser, signUpSchema } from "../validation/zod.js"
import { loginSchema } from "../validation/zod.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import { envConfig } from "../config/env.js";
import { signupWelcomeEmail,sendEmail } from "../emails/templates.js";
import { updatePasswordSchema ,deleteAccountSchema} from "../validation/zod.js";

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
                user,
                token
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

// Add these functions to your user controller file

export async function updatePassword(req, res) {
  try {
    const userId = req.user.userId; // from JWT middleware
    const { success, data, error } = updatePasswordSchema.safeParse(req.body);
    
    if (!success) {
      return res.status(400).json({
        success: false,
        error: errorParser(error)
      });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(data.currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Current password is incorrect"
      });
    }

    // Check if new password is same as current password
    const isSamePassword = await bcrypt.compare(data.newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        error: "New password must be different from current password"
      });
    }

    // Hash and update new password
    const hashedNewPassword = await bcrypt.hash(data.newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    // Optional: Send email notification about password change
    try {
      await sendEmail(
        user.email,
        "Password Changed Successfully",
        `<h3>Hello ${user.fullName},</h3>
         <p>Your password has been successfully changed.</p>
         <p>If you did not perform this action, please contact support immediately.</p>
         <p>Best regards,<br/>Contreon Team</p>`
      );
    } catch (emailError) {
      console.log('Password change notification email could not be sent:', emailError.message);
    }

    return res.status(200).json({
      success: true,
      data: {
        message: "Password updated successfully"
      }
    });

  } catch (error) {
    console.log('Error in updatePassword:', error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
}

export async function deleteAccount(req, res) {
  try {
    const userId = req.user.userId; // from JWT middleware
    const { success, data, error } = deleteAccountSchema.safeParse(req.body);
    
    if (!success) {
      return res.status(400).json({
        success: false,
        error: errorParser(error)
      });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Password is incorrect"
      });
    }

    // Store user info for email before deletion
    const userEmail = user.email;
    const userName = user.fullName;

    // Delete the user
    await User.findByIdAndDelete(userId);

    // Clear the authentication cookie
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    // Send account deletion confirmation email
    try {
      await sendEmail(
        userEmail,
        "Account Successfully Deleted",
        `<h3>Hello ${userName},</h3>
         <p>Your Contreon account has been successfully deleted.</p>
         <p>We're sad to see you go! If you ever change your mind, you're always welcome to create a new account.</p>
         <p>If you did not request this deletion, please contact our support team immediately.</p>
         <p>Best regards,<br/>Contreon Team</p>`
      );
    } catch (emailError) {
      console.log('Account deletion confirmation email could not be sent:', emailError.message);
    }

    return res.status(200).json({
      success: true,
      data: {
        message: "Account deleted successfully"
      }
    });

  } catch (error) {
    console.log('Error in deleteAccount:', error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
}

// Optional: Add a soft delete variant (recommended for production)
export async function softDeleteAccount(req, res) {
  try {
    const userId = req.user.userId;
    const { success, data, error } = deleteAccountSchema.safeParse(req.body);
    
    if (!success) {
      return res.status(400).json({
        success: false,
        error: errorParser(error)
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Password is incorrect"
      });
    }

    // Soft delete - mark as deleted instead of removing
    user.isDeleted = true;
    user.deletedAt = new Date();
    user.email = `${user.email}_deleted_${Date.now()}`; // Free up original email
    await user.save();

    // Clear the authentication cookie
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    await sendEmail(
      user.email,
      "Account Scheduled for Deletion",
      `<h3>Hello ${user.fullName},</h3>
       <p>Your account has been scheduled for deletion. All your data will be permanently removed after 30 days.</p>
       <p>If you wish to restore your account, please contact support within 30 days.</p>
       <p>Best regards,<br/>Contreon Team</p>`
    );

    return res.status(200).json({
      success: true,
      data: {
        message: "Account deactivated successfully. You have 30 days to restore your account before permanent deletion."
      }
    });

  } catch (error) {
    console.log('Error in softDeleteAccount:', error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
}