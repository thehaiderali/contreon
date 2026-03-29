import mongoose from "mongoose"

const collectionSchema=new mongoose.Schema({
    title:{
        type:String,
        trim:true,
        unique:true,
        min:3,
        max:30,
    },
    posts: [
     {
     type: mongoose.Schema.Types.ObjectId,
     ref: "Post",
     },

],

})

const Collection=mongoose.model("Collection",collectionSchema)
export default Collection