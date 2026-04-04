import mongoose from "mongoose";
const commentSchema=new mongoose.Schema({
    authorId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    postId:{
       type:mongoose.Schema.Types.ObjectId,
        ref:"Post"
    },
    content:{
        type:String,
        trim:true,
        min:3,
        max:100,
    }

},{timestamps:true})


const Comment=mongoose.model("Comment",commentSchema);
export default Comment