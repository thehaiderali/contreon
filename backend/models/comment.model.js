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

},{timestamps:true})


const Comment=mongoose.model("Comment",commentSchema);
export default Comment