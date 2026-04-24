import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import { envConfig } from "./config/env.js";
import { connectDB } from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import { createRouteHandler } from "uploadthing/express";
import { uploadRouter } from "./uploads/uploadthing.js";
import creatorRouter from "./routes/creator.routes.js";
import subscriptionRouter from "./routes/subscriptions.routes.js";
import collectionRouter from "./routes/collection.routes.js";
import membershipRouter from "./routes/membership.routes.js";
import postRouter from "./routes/post.routes.js";
import commentRouter from "./routes/comment.routes.js";
import webhookRoutes from './routes/webhook.routes.js';
import chatRouter from "./routes/chat.routes.js";
import { setupSocketIO } from "./socket/index.js";

const app = express();

// CORS configuration
app.use(cors({
  origin: envConfig.FRONTEND_URL || 'https://contreon.thehaiderali.com',
  credentials: true
}));

// Webhook route BEFORE express.json()
app.use('/api/webhooks', webhookRoutes);

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.get("/", (req, res) => res.send("CONTREON API"));

app.use(
  "/api/uploadthing",
  createRouteHandler({
    router: uploadRouter,
    config: { token: envConfig.UPLOADTHING_TOKEN }
  })
);

app.get("/health", (req, res) => {
  return res.status(200).json({
    message: "Server is Alive",
    status: "ok",
    timestamp: Date.now()
  });
});

app.use("/api/auth", authRouter);
app.use("/api/creators", creatorRouter);
app.use("/api/subscriptions", subscriptionRouter);
app.use("/api/collections", collectionRouter);
app.use("/api/memberships", membershipRouter);
app.use("/api/posts", postRouter);
app.use("/api/comments", commentRouter);
app.use("/api/chat", chatRouter);

// Create HTTP server
const server = createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: envConfig.FRONTEND_URL || 'https://contreon.thehaiderali.com',
    credentials: true
  },
  // Performance optimizations
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling'] // Prefer websocket
});

app.set("io", io);

// Initialize socket logic
setupSocketIO(io);

// Start server
server.listen(envConfig.PORT, async () => {
  if (envConfig.NODE_ENV === "development") {
    console.log("Server Started at http://localhost:3000");
  } else {
    console.log(`Server Started at ${envConfig.BACKEND_URL}`);
  }
  await connectDB();
});