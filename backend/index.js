import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { envConfig } from "./config/env.js"
import { connectDB } from "./config/db.js"
import authRouter from "./routes/auth.routes.js"


const app=express()
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true, // If you're using cookies/sessions
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json())
app.use(cookieParser())


app.get("/health",(req,res)=>{
    return res.status(200).json({
        message:"Server is Alive",
        status:"ok",
        timestamp:Date.now()
    })
})

app.use("/api/auth",authRouter);



app.listen(envConfig.PORT,async()=>{
    if(envConfig.NODE_ENV==="developement"){
        console.log("Server Started at http://localhost:3000  ")
    }
    else {
        console.log(`Server Started at ${envConfig.BACKEND_URL}`)
    }
    await connectDB()
})