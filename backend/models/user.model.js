import { model, Schema } from "mongoose";
const userSchema=new Schema({
   fullName:{
    type:String,
    trim:true,
    min:3,
    max:50,
    required:true
   },
   email:{
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
   },
   password:{
    type:String,
    min:8,
    max:20,
    required:true
   },
   role:{
    type:String,
    enum:["creator","subscriber"],
    required:true
   },
   onBoarded:{
      type:Boolean,
      default:false,
   }

},{timestamps:true})

const User=model("User",userSchema)
export default User