import { model, Schema } from "mongoose";
import mongoose from "mongoose";
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
     enum:["creator","subscriber","admin"],
     default:"subscriber"
    },
   hasProfile:{
      type:Boolean,
      default:false,
   },
   interests:[
        {
            type:String,
            enum:["Tech","Sports","Music","Art","Other","Business"],
        }
    ],
   onBoarded:{
      type:Boolean,
      default:false,
   },
   connectedID:{
      type:String,
      default:""
   },
   deferredOnboarding:{
   pendingEarnings: {type: Number, default: 0},
   earningsCount: {type: Number, default: 0},
   accountCreatedAt: Date,
   verifiedAt: Date,
   lastEarningDate: Date,
   pendingEarningsTransferred: {type: Boolean, default: false}
},
stripeAccountStatus:{
   chargesEnabled: {type: Boolean, default: false},
   payoutsEnabled: {type: Boolean, default: false},
   detailsSubmitted: {type: Boolean, default: false},
   lastSyncedAt: Date
}

},{timestamps:true})

const User = mongoose.models.User || model("User", userSchema);
export default User;