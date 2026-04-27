import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import User from "../models/user.model.js";
import CreatorProfile from "../models/profile.model.js";
import Subscription from "../models/subscription.model.js";
import SubscriptionTier from "../models/subscriptionTier.model.js";
import RecentlyVisited from "../models/recent.model.js";
import { envConfig } from "../config/env.js";

const CATEGORIES = ["Tech", "Sports", "Music", "Art", "Other", "Business"];

async function populate() {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(envConfig.MONGO_URI);
    console.log("Connected to database.");

    // Clean existing data related to feed
    console.log("Cleaning existing data...");
    await User.deleteMany({ email: { $regex: "@example.com" } });
    // We only delete users we created to avoid nuking the whole DB if not intended, 
    // but usually in populate scripts we might want a fresh start.
    // For this task, let's assume we want to ensure data exists.
    
    // Better to just add data. If we want it to NEVER return null, we just need to ensure enough data.

    const creators = [];
    const subscribers = [];

    console.log("Creating creators...");
    for (let i = 0; i < 15; i++) {
      const user = await User.create({
        fullName: faker.person.fullName(),
        email: faker.internet.email({ provider: "example.com" }),
        password: "password123", // In a real app, this should be hashed
        role: "creator",
        hasProfile: true,
        onBoarded: true,
      });

      const profile = await CreatorProfile.create({
        creatorId: user._id,
        pageName: faker.company.name().substring(0, 20),
        bio: faker.lorem.sentence().substring(0, 80),
        category: faker.helpers.arrayElement(CATEGORIES),
        pageUrl: faker.internet.domainWord() + i,
        profileImageUrl: faker.image.avatar(),
        bannerUrl: faker.image.urlPicsumPhotos({ width: 1200, height: 400 }),
      });

      const tier = await SubscriptionTier.create({
        creatorId: user._id,
        tierName: "Standard",
        price: faker.number.int({ min: 5, max: 50 }),
        description: "Standard access",
        isActive: true,
      });

      creators.push({ user, profile, tier });
    }

    console.log("Creating subscribers...");
    for (let i = 0; i < 30; i++) {
      const user = await User.create({
        fullName: faker.person.fullName(),
        email: faker.internet.email({ provider: "example.com" }),
        password: "password123",
        role: "subscriber",
        interests: faker.helpers.arrayElements(CATEGORIES, { min: 1, max: 3 }),
        onBoarded: true,
      });
      subscribers.push(user);
    }

    console.log("Creating subscriptions...");
    for (const subscriber of subscribers) {
      // Each subscriber subscribes to 1-5 random creators
      const randomCreators = faker.helpers.arrayElements(creators, { min: 1, max: 5 });
      for (const creator of randomCreators) {
        await Subscription.create({
          subscriberId: subscriber._id,
          creatorId: creator.user._id,
          tierId: creator.tier._id,
          tierType: "Standard",
          status: "active",
          createdAt: faker.date.recent({ days: 10 }), // Some in last 7 days, some older
        });
      }

      // Also create some recently visited
      const visitedCreators = faker.helpers.arrayElements(creators, { min: 2, max: 6 });
      for (const creator of visitedCreators) {
        await RecentlyVisited.create({
          subscriberId: subscriber._id,
          creatorId: creator.user._id,
          expireAt: new Date(),
        });
      }
    }

    console.log("Database populated successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error populating database:", error);
    process.exit(1);
  }
}

populate();
