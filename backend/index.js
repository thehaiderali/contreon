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
import notificationRoutes from "./routes/notification.routes.js";
import { setupSocketIO } from "./socket/index.js";
import exploreRouter from "./routes/explore.routes.js"
import insightsRouter from "./routes/insights.routes.js"
import contentAccessRouter from "./routes/contentAccess.routes.js";
import adminRouter from "./routes/admin.routes.js";
import trackingLinkRouter from "./routes/trackingLink.routes.js";
import { rateLimit } from 'express-rate-limit'
import subscriberRouter from "./routes/subscriber.routes.js";

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 100,
	standardHeaders: 'draft-8',
	legacyHeaders: false,
	ipv6Subnet: 56,
})


const app = express();

app.use(cors({
  origin: envConfig.FRONTEND_URL || 'https://contreon.thehaiderali.com',
  credentials: true
}));

app.use('/api/webhooks', webhookRoutes);

app.use(express.json());
app.use(cookieParser());
// app.use(limiter)

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
app.use("/api/content", contentAccessRouter);
app.use("/api/chat", chatRouter);
app.use("/api/notifications", notificationRoutes);
app.use("/api/explore",exploreRouter)
app.use("/api/subscriber", subscriberRouter);
app.use("/api/insights", insightsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/tracking-links", trackingLinkRouter);

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: envConfig.FRONTEND_URL || 'https://contreon.thehaiderali.com',
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling']
});

app.set("io", io);

setupSocketIO(io);

server.listen(envConfig.PORT, async () => {
  if (envConfig.NODE_ENV === "development") {
    console.log("Server Started at http://localhost:3000");
  } else {
    console.log(`Server Started at ${envConfig.BACKEND_URL}`);
  }
  await connectDB();
});