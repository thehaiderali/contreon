import mongoose from "mongoose"

const collectionSchema=new mongoose.Schema({
    
    creatorId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    title:{
        type:String,
        trim:true,
        min:3,
        max:30,
    },
    posts: [
     {
     type: mongoose.Schema.Types.ObjectId,
     ref: "Post",
     },
    ],
    description:{
    type:String,
    min:10,
    max:100,
    }

},{timestamps:true})

const Collection=mongoose.model("Collection",collectionSchema)
export default Collection