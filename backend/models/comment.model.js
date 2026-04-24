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
        max:150,
    },
    likes:{
        type:Number,
        default:0,
        min:0
    },
    dislikes:{
        type:Number,
        default:0,
        min:0
    },
    featured:{
        type:Boolean,
        default:false,
    }

},{timestamps:true})

const Comment = mongoose.models.Comment || mongoose.model("Comment", commentSchema);
export default Comment;