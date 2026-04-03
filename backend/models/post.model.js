import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    min: 3,
    max: 30,
    required: true
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
  price: {
    type: Number,
    required: function () {
      return this.isPaid === true;
    }
  },
  isPublished:{
    type:Boolean,
  },
  thumbnailUrl:{
    type:String,
    default:""
  },
  commentsAllowed:{
    type:Boolean
  },
  description:{
    type:String,
    required: function () {
      return this.type === "audio" || this.type==="video";
    }
  }
});


const Post=mongoose.model("Post",postSchema)
export default Post