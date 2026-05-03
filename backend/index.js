import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { createServer } from "http"
import { Server } from "socket.io"
import { envConfig } from "./config/env.js"
import { connectDB } from "./config/db.js"
import authRouter from "./routes/auth.routes.js"
import { createRouteHandler } from "uploadthing/express"
import { uploadRouter } from "./uploads/uploadthing.js"
import creatorRouter from "./routes/creator.routes.js"
import subscriptionRouter from "./routes/subscriptions.routes.js"
import collectionRouter from "./routes/collection.routes.js";
import membershipRouter from "./routes/membership.routes.js"
import postRouter from "./routes/post.routes.js"
import commentRouter from "./routes/comment.routes.js"
import chatRouter from "./routes/chat.routes.js"
import { authMiddleware } from "./middleware/auth.js"
import Message from "./models/message.model.js"
import Conversation from "./models/conversation.model.js"
import User from "./models/user.model.js"
import userRouter from "./routes/user.routes.js";
import cookie from "cookie";
import jwt from "jsonwebtoken";

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true
  }
})

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true, 
}));
app.use(express.json())
app.use(cookieParser())


// Socket.io middleware for auth
io.use(async (socket, next) => {
  try {
    const rawCookie = socket.handshake.headers.cookie;

    if (!rawCookie) {
      return next(new Error("No cookies found"));
    }

    const cookies = cookie.parse(rawCookie);
    const token = cookies.token;

    if (!token) {
      return next(new Error("No token found"));
    }

    const decoded = jwt.verify(token, envConfig.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return next(new Error("User not found"));
    }

    socket.user = user;
    socket.userId = user._id.toString();

    next();
  } catch (error) {
    console.error("Socket auth error:", error.message);
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.userId}`);
  
  socket.join(`user:${socket.userId}`);
  
  socket.on('join', (userId) => {
    socket.join(`user:${userId}`);
    console.log(`User ${userId} joined room`);
  });
  
  socket.on("join-conversation", (conversationId) => {
    socket.join(`conversation:${conversationId}`);
    console.log(`User ${socket.userId} joined conversation ${conversationId}`);
  });
  
  socket.on("leave-conversation", (conversationId) => {
    socket.leave(`conversation:${conversationId}`);
  });
  
  socket.on("send-message", async (data) => {
    console.log("🔥 MESSAGE RECEIVED ON BACKEND:", data); 
    try {
      const { conversationId, receiverId, content } = data;
      
      const message = new Message({
        conversationId,
        senderId: socket.userId,
        receiverId,
        content,
        read: false
      });
      await message.save();
      
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: content,
        lastMessageAt: new Date(),
        $inc: { [`unreadCount.${receiverId}`]: 1 }
      });
      
      const populatedMessage = await Message.findById(message._id)
        .populate("senderId", "fullName email")
        .populate("receiverId", "fullName email");
      
      io.to(`conversation:${conversationId}`).emit("new-message", populatedMessage);
      io.to(`user:${receiverId}`).emit("message-notification", {
        conversationId,
        message: populatedMessage
      });
      
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("message-error", { error: "Failed to send message" });
    }
  });
  
  socket.on("typing", ({ conversationId, receiverId, isTyping }) => {
    socket.to(`conversation:${conversationId}`).emit("user-typing", {
      userId: socket.userId,
      isTyping
    });
  });
  
  socket.on("mark-read", async ({ conversationId, senderId }) => {
    try {
      await Message.updateMany(
        { conversationId, senderId, receiverId: socket.userId, read: false },
        { read: true, readAt: new Date() }
      );
      
      await Conversation.findByIdAndUpdate(conversationId, {
        $set: { [`unreadCount.${socket.userId}`]: 0 }
      });
      
      io.to(`conversation:${conversationId}`).emit("messages-read", {
        conversationId,
        readBy: socket.userId
      });
    } catch (error) {
      console.error("Error marking read:", error);
    }
  });
  
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.userId}`);
  });
});
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
app.use("/api/posts",postRouter)
app.use("/api/comments",commentRouter)
app.use("/api/chat", chatRouter)
app.use("/api/users", userRouter);

server.listen(envConfig.PORT,async()=>{
    if(envConfig.NODE_ENV==="developement"){
        console.log("Server Started at http://localhost:3000  ")
    }
    else {
        console.log(`Server Started at ${envConfig.BACKEND_URL}`)
    }
    await connectDB()
})

export { io }