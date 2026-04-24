import mongoose from "mongoose";


const postViewSchema=new mongoose.Schema({
    postId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Post",
        required:true
    },
    viewerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    ip:{
        type:String
    }

},{timestamps:true})


const PostView = mongoose.models.PostView || mongoose.model("PostView", postViewSchema);
export default PostView;