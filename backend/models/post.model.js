import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    min: 3,
    max: 30,
    required: true
  },
  tierId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"SubscriptionTier",
    required:function(){
      return this.isPaid===true
    }
  },
  type:{
    type:String,
    enum:["text","audio","video"],
    required:true,
  },
  slug: {
    type: String,
    min: 3,
    max: 100,
    required: true
  },
  content: {
    type: String,
    default: ""
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  isPublished:{
    type:Boolean,
  },
  thumbnailUrl:{
    type:String,
    default:""
  },
  commentsAllowed:{
    type:Boolean,
    default:true
  },
  description:{
    type:String,
    required: function () {
      return this.type === "audio" || this.type==="video";
    }
  },
  transcriptionUrl:{
    type:String,
    required:function(){
     return this.type==="audio"
    }
  },
  audioUrl:{
    type:String,
    required:function(){
     return this.type==="audio"
    }
  },
  videoUrl:{
    type:String,
    required:function(){
     return this.type==="video"
    }
  }

},{timestamps:true});


const Post=mongoose.model("Post",postSchema)
export default Post