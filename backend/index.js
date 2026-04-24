// import express from "express"
// import cors from "cors"
// import cookieParser from "cookie-parser"
// import { envConfig } from "./config/env.js"
// import { connectDB } from "./config/db.js"
// import authRouter from "./routes/auth.routes.js"
// import { createRouteHandler } from "uploadthing/express"
// import { uploadRouter } from "./uploads/uploadthing.js"
// import creatorRouter from "./routes/creator.routes.js"
// import subscriptionRouter from "./routes/subscriptions.routes.js"
// import collectionRouter from "./routes/collection.routes.js";
// import membershipRouter from "./routes/membership.routes.js"
// import postRouter from "./routes/post.routes.js"
// import commentRouter from "./routes/comment.routes.js"
// import webhookRoutes from './routes/webhook.routes.js';

// import chatRouter from "./routes/chat.routes.js";
// import { createServer } from "http";
// import { Server } from "socket.io";



// // Use webhook route BEFORE express.json() middleware

// const app=express()

// app.use(cors({
//   origin: 'http://localhost:5173', 
//   credentials: true, 
// }));
// app.use('/api/webhooks', webhookRoutes);
// app.use(express.json())
// app.use(cookieParser())

// app.use(
//   "/api/uploadthing",
//   createRouteHandler({
//     router: uploadRouter,
//     config:{
//         token:envConfig.UPLOADTHING_TOKEN
//     }
//   }),
// );

// app.get("/health",(req,res)=>{
//     return res.status(200).json({
//         message:"Server is Alive",
//         status:"ok",
//         timestamp:Date.now()
//     })
// })

// app.use("/api/auth",authRouter);



// app.use("/api/creators",creatorRouter)
// app.use("/api/subscriptions", subscriptionRouter);
// app.use("/api/collections", collectionRouter);
// app.use("/api/memberships",membershipRouter)
// app.use("/api/posts",postRouter)
// app.use("/api/comments",commentRouter)

// // app.listen(envConfig.PORT,async()=>{
// //     if(envConfig.NODE_ENV==="developement"){
// //         console.log("Server Started at http://localhost:3000  ")
// //     }
// //     else {
// //         console.log(`Server Started at ${envConfig.BACKEND_URL}`)
// //     }
// //     await connectDB()
// // })


// // After creating app, create HTTP server
// const server = createServer(app);

// // Socket.IO setup
// const io = new Server(server, {
//   cors: {
//     origin: 'http://localhost:5173',
//     credentials: true
//   }
// });

// // Socket.IO authentication middleware
// io.use((socket, next) => {
//   const token = socket.handshake.auth.token;
//   if (!token) {
//     return next(new Error("Authentication error"));
//   }
  
//   try {
//     const decoded = jwt.verify(token, envConfig.JWT_SECRET);
//     socket.userId = decoded.userId;
//     socket.userRole = decoded.role;
//     next();
//   } catch (err) {
//     next(new Error("Authentication error"));
//   }
// });

// // Socket.IO connection handling
// io.on("connection", (socket) => {
//   console.log(`User connected: ${socket.userId}`);
  
//   // Join user's personal room
//   socket.join(`user:${socket.userId}`);
  
//   // Handle sending messages via socket
//   socket.on("send_message", async (data) => {
//     try {
//       const { receiverId, content } = data;
      
//       // Verify permissions (similar to REST endpoint)
//       // ... permission checks ...
      
//       // Create message in database
//       // ... message creation logic ...
      
//       // Emit to receiver
//       io.to(`user:${receiverId}`).emit("new_message", {
//         message: populatedMessage,
//         conversationId
//       });
      
//       // Acknowledge sender
//       socket.emit("message_sent", { success: true, messageId: message._id });
      
//     } catch (error) {
//       socket.emit("message_error", { error: error.message });
//     }
//   });
  
//   socket.on("typing", (data) => {
//     const { receiverId, isTyping } = data;
//     socket.to(`user:${receiverId}`).emit("user_typing", {
//       userId: socket.userId,
//       isTyping
//     });
//   });
  
//   socket.on("disconnect", () => {
//     console.log(`User disconnected: ${socket.userId}`);
//   });
// });

// // Add chat routes
// app.use("/api/chat", chatRouter);

// // Replace app.listen with server.listen
// server.listen(envConfig.PORT, async () => {
//   if (envConfig.NODE_ENV === "development") {
//     console.log("Server Started at http://localhost:3000");
//   } else {
//     console.log(`Server Started at ${envConfig.BACKEND_URL}`);
//   }
//   await connectDB();
// });

import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import jwt from "jsonwebtoken"
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
import webhookRoutes from './routes/webhook.routes.js';
import chatRouter from "./routes/chat.routes.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { Message, Conversation } from "./models/chat.model.js";
import User from "./models/user.model.js";
import Subscription from "./models/subscription.model.js";

// Use webhook route BEFORE express.json() middleware
const app = express()

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true, 
}));
app.use('/api/webhooks', webhookRoutes);
app.use(express.json())
app.use(cookieParser())
app.get("/",(req,res)=>res.send("CONTREON API"))
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

app.use("/api/auth", authRouter);
app.use("/api/creators", creatorRouter)
app.use("/api/subscriptions", subscriptionRouter);
app.use("/api/collections", collectionRouter);
app.use("/api/memberships", membershipRouter)
app.use("/api/posts", postRouter)
app.use("/api/comments", commentRouter)
app.use("/api/chat", chatRouter);

// Helper functions for chat permissions
async function canCreatorChatWithSubscriber(creatorId, subscriberId) {
  const subscription = await Subscription.findOne({
    subscriberId,
    creatorId,
    status: "active"
  });
  return !!subscription;
}

async function canSubscriberChatWithCreator(subscriberId, creatorId) {
  const subscription = await Subscription.findOne({
    subscriberId,
    creatorId,
    status: "active"
  });
  return !!subscription;
}

function extractTokenFromCookieHeader(cookieHeader = "") {
  const tokenPart = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("token="));
  return tokenPart ? decodeURIComponent(tokenPart.slice("token=".length)) : null;
}

// After creating app, create HTTP server
const server = createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true
  }
});
app.set("io", io);
const onlineConnections = new Map();

// Socket.IO authentication middleware
io.use((socket, next) => {
  const authToken = socket.handshake.auth?.token;
  const cookieToken = extractTokenFromCookieHeader(socket.handshake.headers?.cookie || "");
  const token = authToken || cookieToken;
  if (!token) {
    console.error("Socket auth error: missing token in auth payload and cookies");
    return next(new Error("Authentication error"));
  }
  
  try {
    const decoded = jwt.verify(token, envConfig.JWT_SECRET);
    socket.userId = decoded.userId;
    socket.userRole = decoded.role;
    next();
  } catch (err) {
    console.error("Socket auth error:", err.message);
    next(new Error("Authentication error"));
  }
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.userId}, Role: ${socket.userRole}`);
  const userId = socket.userId.toString();
  
  // Join user's personal room
  socket.join(`user:${socket.userId}`);
  
  // Join role-specific rooms
  if (socket.userRole === 'creator') {
    socket.join(`creator:${socket.userId}`);
    console.log(`Creator ${socket.userId} joined creator room`);
  } else if (socket.userRole === 'subscriber') {
    socket.join(`subscriber:${socket.userId}`);
    console.log(`Subscriber ${socket.userId} joined subscriber room`);
  }
  
  const currentConnections = onlineConnections.get(userId) || 0;
  onlineConnections.set(userId, currentConnections + 1);

  // Send snapshot so late-joining clients get current presence.
  socket.emit("online_users", {
    userIds: [...onlineConnections.keys()]
  });

  // Broadcast online status
  io.emit('user_online_status', {
    userId,
    isOnline: true
  });
  
  // Handle sending messages via socket
  socket.on("send_message", async (data) => {
    try {
      const { receiverId, content } = data;
      const senderId = socket.userId;
      console.log("[chat/socket] send_message received", {
        senderId,
        receiverId,
        contentLength: content?.length || 0
      });
      
      if (!content || content.trim() === "") {
        socket.emit("message_error", { error: "Message content is required" });
        return;
      }
      
      // Get sender and receiver info
      const sender = await User.findById(senderId);
      const receiver = await User.findById(receiverId);
      
      if (!sender || !receiver) {
        console.warn("[chat/socket] user not found while sending", { senderId, receiverId });
        socket.emit("message_error", { error: "User not found" });
        return;
      }
      
      // Permission checks
      if (sender.role === "creator" && receiver.role === "subscriber") {
        const canChat = await canCreatorChatWithSubscriber(senderId, receiverId);
        if (!canChat) {
          console.warn("[chat/socket] permission denied creator->subscriber", { senderId, receiverId });
          socket.emit("message_error", { error: "You can only message your active subscribers" });
          return;
        }
      } else if (sender.role === "subscriber" && receiver.role === "creator") {
        const canChat = await canSubscriberChatWithCreator(senderId, receiverId);
        if (!canChat) {
          console.warn("[chat/socket] permission denied subscriber->creator", { senderId, receiverId });
          socket.emit("message_error", { error: "You can only message creators you are subscribed to" });
          return;
        }
      } else {
        console.warn("[chat/socket] invalid role pair", { senderRole: sender.role, receiverRole: receiver.role });
        socket.emit("message_error", { error: "Chat is only available between creators and subscribers" });
        return;
      }
      
      // Get or create conversation
      let conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId], $size: 2 }
      });
      
      if (!conversation) {
        conversation = new Conversation({
          participants: [senderId, receiverId],
          unreadCount: new Map()
        });
        conversation.unreadCount.set(senderId.toString(), 0);
        conversation.unreadCount.set(receiverId.toString(), 0);
        await conversation.save();
      }
      
      // Create message
      const message = new Message({
        senderId,
        receiverId,
        content: content.trim()
      });
      
      await message.save();
      
      // Update conversation
      conversation.lastMessage = content.trim();
      conversation.lastMessageAt = new Date();
      conversation.lastMessageSender = senderId;
      
      // Increment unread count for receiver
      const currentUnread = conversation.unreadCount.get(receiverId.toString()) || 0;
      conversation.unreadCount.set(receiverId.toString(), currentUnread + 1);
      await conversation.save();
      
      // Populate message with sender info
      const populatedMessage = await Message.findById(message._id)
        .populate("senderId", "fullName email role")
        .populate("receiverId", "fullName email role");
      
      // Prepare response data
      const messageData = {
        _id: populatedMessage._id,
        content: populatedMessage.content,
        senderId: populatedMessage.senderId,
        receiverId: populatedMessage.receiverId,
        createdAt: populatedMessage.createdAt,
        read: populatedMessage.read
      };
      
      // Emit to receiver's personal room
      io.to(`user:${receiverId}`).emit("new_message", {
        message: messageData,
        sender: {
          _id: senderId,
          fullName: sender.fullName,
          role: sender.role
        },
        conversationId: conversation._id
      });
      console.log("[chat/socket] emitted new_message to user room", {
        room: `user:${receiverId}`,
        conversationId: conversation._id.toString(),
        messageId: message._id.toString()
      });
      
      // Do not emit new_message to role-specific rooms to avoid duplicate delivery.
      
      // Acknowledge sender
      socket.emit("message_sent", { 
        success: true, 
        messageId: message._id,
        message: messageData
      });
      console.log("[chat/socket] emitted message_sent ack", {
        toSocketUserId: senderId,
        messageId: message._id.toString()
      });
      
      console.log(`Message sent from ${senderId} to ${receiverId}`);
      
    } catch (error) {
      console.error("Socket send_message error:", error);
      socket.emit("message_error", { error: error.message });
    }
  });
  
  // Handle typing indicators
  socket.on("typing", async (data) => {
    const { receiverId, isTyping } = data;
    console.log("[chat/socket] typing event", { from: socket.userId, receiverId, isTyping });
    
    // Get receiver to check role
    const receiver = await User.findById(receiverId);
    if (receiver) {
      // Emit to receiver's personal room
      socket.to(`user:${receiverId}`).emit("user_typing", {
        userId: socket.userId,
        isTyping
      });
      
      // Also emit to role-specific room
      if (receiver.role === 'creator') {
        socket.to(`creator:${receiverId}`).emit("user_typing", {
          userId: socket.userId,
          isTyping
        });
      } else if (receiver.role === 'subscriber') {
        socket.to(`subscriber:${receiverId}`).emit("user_typing", {
          userId: socket.userId,
          isTyping
        });
      }
    }
  });
  
  // Handle mark as read
  socket.on("mark_read", async (data) => {
    const { senderId } = data;
    const receiverId = socket.userId;
    
    try {
      await Message.updateMany(
        {
          senderId,
          receiverId,
          read: false
        },
        {
          read: true,
          readAt: new Date()
        }
      );
      
      // Update conversation unread count
      const conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId], $size: 2 }
      });
      
      if (conversation) {
        conversation.unreadCount.set(receiverId.toString(), 0);
        await conversation.save();
      }
      
      socket.emit("messages_read", { success: true, senderId });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  });
  
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.userId}`);
    console.log("[chat/socket] disconnect cleanup", { userId: socket.userId });

    const connectedCount = onlineConnections.get(userId) || 0;
    if (connectedCount <= 1) {
      onlineConnections.delete(userId);
      io.emit('user_online_status', {
        userId,
        isOnline: false
      });
    } else {
      onlineConnections.set(userId, connectedCount - 1);
    }
  });
});

// Start server
server.listen(envConfig.PORT, async () => {
  if (envConfig.NODE_ENV === "development") {
    console.log("Server Started at http://localhost:3000");
  } else {
    console.log(`Server Started at ${envConfig.BACKEND_URL}`);
  }
  await connectDB();
});