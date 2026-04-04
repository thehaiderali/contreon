import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { envConfig } from "./config/env.js"
import { connectDB } from "./config/db.js"
import authRouter from "./routes/auth.routes.js"
import { createRouteHandler } from "uploadthing/express"
import { uploadRouter } from "./uploads/uploadthing.js"
import creatorRouter from "./routes/creator.routes.js"
import subscriptionRouter from "./routes/subscriptions.routes.js"
import collectionRouter from "./routes/collection.routes.js";
import membershipRouter from "./routes/membership.routes.js"

const app=express()

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true, 
}));
app.use(express.json())
app.use(cookieParser())

app.use(
  "/api/uploadthing",
  createRouteHandler({
    router: uploadRouter,
    config:{
        token:envConfig.UPLOADTHING_TOKEN
    }
  }),
);

app.get("/health",(req,res)=>{
    return res.status(200).json({
        message:"Server is Alive",
        status:"ok",
        timestamp:Date.now()
    })
})

app.use("/api/auth",authRouter);



app.use("/api/creators",creatorRouter)
app.use("/api/subscriptions", subscriptionRouter);
app.use("/api/collections", collectionRouter);
app.use("/api/memberships",membershipRouter)
app.listen(envConfig.PORT,async()=>{
    if(envConfig.NODE_ENV==="developement"){
        console.log("Server Started at http://localhost:3000  ")
    }
    else {
        console.log(`Server Started at ${envConfig.BACKEND_URL}`)
    }
    await connectDB()
})