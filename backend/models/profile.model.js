import { Schema } from "mongoose";
import mongoose from "mongoose";
const profileSchema=new Schema({
    creatorId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    bio:{
        type:String,
        min:10,
        max:80,
        trim:true,
        required:true
    },
    pageName:{
        type:String,
        required:true,
        min:3,
        max:20,
    },
    category:{
        type:String,
         enum:["Tech","Sports","Music","Art","Other","Business"],
    },
    pageUrl:{
        type:String,
        unique:true,
        required:true,
        min:3,
        max:30,
    },
    profileImageUrl:{
        type:String,
    },
    bannerUrl:{
        type:String,
    },
    socialLinks:[
        {
            type:String,
        }
    ],
    aboutPage:{
        type:String,
        max:200
    }
},{timestamps:true})

const CreatorProfile=mongoose.model("CreatorProfile",profileSchema);
export default CreatorProfile