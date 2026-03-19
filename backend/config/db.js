import mongoose from "mongoose";
import { envConfig } from "./env.js";


export async function connectDB(){
    try {
        
      await mongoose.connect(envConfig.MONGO_URI)
      console.log("Database Connected Successfully.")  
    } catch (error) {
        console.log("Database Connection Failed ",error)
    }

}