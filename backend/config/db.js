// import mongoose from "mongoose";
// import { envConfig } from "./env.js";


// export async function connectDB(){
//     try {
        
//       await mongoose.connect(envConfig.MONGO_URI)
//       console.log("Database Connected Successfully.")  
//     } catch (error) {
//         console.log("Database Connection Failed ",error)
//     }

// }

import mongoose from "mongoose";
import { envConfig } from "./env.js";

let isConnected = false; // Track connection state

export async function connectDB() {
  // If already connected, reuse the connection
  if (isConnected) {
    console.log("Using existing database connection");
    return;
  }

  // If currently connecting, wait for it
  if (mongoose.connection.readyState === 2) {
    console.log("Database is already connecting, waiting...");
    await new Promise(resolve => mongoose.connection.once('connected', resolve));
    return;
  }

  try {
    await mongoose.connect(envConfig.MONGO_URI, {
      // Optimize for serverless environments
      maxPoolSize: 1, // Vercel Hobby plan: keep connections minimal
      minPoolSize: 0,
      maxIdleTimeMS: 30000, // Close idle connections after 30 seconds
      serverSelectionTimeoutMS: 5000, // Fail fast if can't connect
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    });
    
    isConnected = mongoose.connection.readyState === 1;
    console.log("Database Connected Successfully.");
    
    // Handle connection errors after initial connection
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      isConnected = false;
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      isConnected = false;
    });
    
  } catch (error) {
    console.log("Database Connection Failed:", error);
    isConnected = false;
    throw error; // Re-throw so the handler knows connection failed
  }
}