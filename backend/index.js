import express from "express"
import cors from "cors"
import { envConfig } from "./config/env.js"
import { connectDB } from "./config/db.js"
const app=express()
app.use(express.json())
app.use(cors())

app.get("/health",(req,res)=>{
    return res.status(200).json({
        message:"Server is Alive",
        status:"ok",
        timestamp:Date.now()
    })
})

app.listen(envConfig.PORT,async()=>{
    if(envConfig.NODE_ENV==="developement"){
        console.log("Server Started at http://localhost:3000  ")
    }
    else {
        console.log(`Server Started at ${envConfig.BACKEND_URL}:${envConfig.PORT}`)
    }
    await connectDB()
})