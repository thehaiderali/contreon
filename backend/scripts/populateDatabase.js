// scripts/populateDatabase.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

// Import all models
import User from "../models/user.model.js";
import CreatorProfile from "../models/profile.model.js";
import Post from "../models/post.model.js";
import SubscriptionTier from "../models/subscriptionTier.model.js";
import Subscription from "../models/subscription.model.js";
import Payment from "../models/payment.model.js";
import Comment from "../models/comment.model.js";
import Collection from "../models/collection.model.js";
import Recommendation from "../models/recommendation.model.js";
import PostView from "../models/view.model.js";

dotenv.config();

// Helper function to generate random data
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

// Sample data
const firstNames = ["John", "Jane", "Michael", "Sarah", "David", "Emma", "James", "Lisa", "Robert", "Maria"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"];
const categories = ["Tech", "Sports", "Music", "Art", "Business", "Other"];
const postTypes = ["text", "audio", "video"];
const postTitles = [
  "Getting Started with Web Development",
  "Advanced JavaScript Patterns",
  "The Future of AI",
  "10 Tips for Better Productivity",
  "Understanding Blockchain Technology",
  "Beginner's Guide to Python",
  "Mastering React Hooks",
  "CSS Grid and Flexbox Guide",
  "Node.js Best Practices",
  "Database Design Patterns"
];

const descriptions = [
  "Learn the fundamentals of modern web development",
  "Deep dive into advanced JavaScript concepts",
  "Exploring the latest trends in artificial intelligence",
  "Boost your productivity with these proven strategies",
  "A comprehensive guide to blockchain technology",
  "Start your Python journey with this beginner-friendly guide",
  "Master React Hooks with practical examples",
  "Complete guide to modern CSS layouts",
  "Best practices for building scalable Node.js applications",
  "Essential database design patterns for developers"
];

const perks = ["Exclusive content", "Early access", "Community access", "Monthly Q&A", "Behind the scenes", "Discounts on merchandise"];

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI );
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

// Create Users (only if they don't exist)
const createUsers = async (count = 20) => {
  const users = [];
  const hashedPassword = await bcrypt.hash("password123", 10);
  
  // Check existing users count
  const existingUsers = await User.countDocuments();
  console.log(`Existing users: ${existingUsers}`);
  
  if (existingUsers >= count) {
    console.log(`Already have ${existingUsers} users, skipping user creation`);
    return await User.find();
  }
  
  const neededUsers = count - existingUsers;
  console.log(`Creating ${neededUsers} new users...`);
  
  for (let i = 0; i < neededUsers; i++) {
    const firstName = randomItem(firstNames);
    const lastName = randomItem(lastNames);
    const role = (existingUsers + i) < 8 ? "creator" : "subscriber";
    
    // Check if user with this email already exists
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${existingUsers + i}@example.com`;
    const existingUser = await User.findOne({ email });
    
    if (!existingUser) {
      const user = new User({
        fullName: `${firstName} ${lastName}`,
        email: email,
        password: hashedPassword,
        role: role,
        hasProfile: role === "creator",
        interests: Array.from({ length: randomNumber(1, 3) }, () => randomItem(categories)),
        onBoarded: true,
        stripeAccountStatus: role === "creator" ? {
          chargesEnabled: true,
          payoutsEnabled: true,
          detailsSubmitted: true,
          lastSyncedAt: new Date()
        } : undefined
      });
      
      await user.save();
      users.push(user);
      console.log(`Created user: ${user.fullName} (${user.role})`);
    } else {
      users.push(existingUser);
      console.log(`User already exists: ${existingUser.fullName}`);
    }
  }
  
  return users;
};

// Create Creator Profiles (only if they don't exist)
const createProfiles = async (creators) => {
  const profiles = [];
  
  for (const creator of creators) {
    const existingProfile = await CreatorProfile.findOne({ creatorId: creator._id });
    
    if (!existingProfile) {
      const profile = new CreatorProfile({
        creatorId: creator._id,
        bio: `Passionate about ${randomItem(categories)} and sharing knowledge with the community.`,
        pageName: `${creator.fullName}'s Page`,
        category: randomItem(categories),
        pageUrl: `${creator.fullName.toLowerCase().replace(/ /g, "")}_page`,
        profileImageUrl: `https://randomuser.me/api/portraits/${randomNumber(0, 1) ? "men" : "women"}/${randomNumber(1, 99)}.jpg`,
        bannerUrl: `https://picsum.photos/id/${randomNumber(1, 100)}/1200/400`,
        socialLinks: [
          `https://twitter.com/${creator.fullName.toLowerCase().replace(/ /g, "")}`,
          `https://github.com/${creator.fullName.toLowerCase().replace(/ /g, "")}`
        ],
        aboutPage: `This is the about page for ${creator.fullName}. Here you'll find information about my work and content.`
      });
      
      await profile.save();
      profiles.push(profile);
      console.log(`Created profile for: ${creator.fullName}`);
    } else {
      profiles.push(existingProfile);
      console.log(`Profile already exists for: ${creator.fullName}`);
    }
  }
  
  return profiles;
};

// Create Subscription Tiers FIRST (before posts)
const createSubscriptionTiers = async (creators) => {
  const tiers = [];
  const tierNames = ["Basic", "Premium", "Pro", "Standard", "Deluxe"];
  
  for (const creator of creators) {
    // Check if creator already has tiers
    const existingTiers = await SubscriptionTier.find({ creatorId: creator._id });
    
    if (existingTiers.length === 0) {
      const numTiers = randomNumber(1, 3);
      
      for (let i = 0; i < numTiers; i++) {
        const price = randomNumber(5, 50);
        
        const tier = new SubscriptionTier({
          creatorId: creator._id,
          tierName: randomItem(tierNames),
          price: price,
          description: `Access to exclusive content from ${creator.fullName}`,
          perks: Array.from({ length: randomNumber(2, 4) }, () => randomItem(perks)),
          isActive: true,
          currency: "usd",
          stripePrices: [
            { interval: "month", priceId: `price_month_${Date.now()}_${i}_${creator._id}`, isActive: true },
            { interval: "year", priceId: `price_year_${Date.now()}_${i}_${creator._id}`, isActive: true }
          ],
          stripeProductId: `prod_${Date.now()}_${i}_${creator._id}`,
          stripePriceId: `price_${Date.now()}_${i}_${creator._id}`
        });
        
        await tier.save();
        tiers.push(tier);
        console.log(`Created tier: ${tier.tierName} ($${price}) for ${creator.fullName}`);
      }
    } else {
      tiers.push(...existingTiers);
      console.log(`${creator.fullName} already has ${existingTiers.length} tier(s)`);
    }
  }
  
  return tiers;
};

// Create Posts (with proper tierId for paid posts)
const createPosts = async (creators, tiers) => {
  const posts = [];
  
  // Create a map of creatorId -> their tiers
  const creatorTiersMap = new Map();
  tiers.forEach(tier => {
    const creatorId = tier.creatorId.toString();
    if (!creatorTiersMap.has(creatorId)) {
      creatorTiersMap.set(creatorId, []);
    }
    creatorTiersMap.get(creatorId).push(tier);
  });
  
  for (const creator of creators) {
    const existingPostsCount = await Post.countDocuments({ creatorId: creator._id });
    const desiredPosts = randomNumber(3, 8);
    
    if (existingPostsCount >= desiredPosts) {
      console.log(`${creator.fullName} already has ${existingPostsCount} posts, skipping`);
      const creatorPosts = await Post.find({ creatorId: creator._id });
      posts.push(...creatorPosts);
      continue;
    }
    
    const postsToCreate = desiredPosts - existingPostsCount;
    console.log(`Creating ${postsToCreate} new posts for ${creator.fullName}`);
    
    const creatorTiers = creatorTiersMap.get(creator._id.toString()) || [];
    
    for (let i = 0; i < postsToCreate; i++) {
      const type = randomItem(postTypes);
      const isPaid = Math.random() > 0.6 && creatorTiers.length > 0;
      const isPublished = true;
      
      // Select a random tier for paid posts
      let tierId = undefined;
      if (isPaid && creatorTiers.length > 0) {
        tierId = randomItem(creatorTiers)._id;
      }
      
      const postData = {
        title: `${randomItem(postTitles)} ${Date.now()}`,
        type: type,
        slug: `${randomItem(postTitles).toLowerCase().replace(/ /g, "-")}-${Date.now()}-${i}`,
        content: type === "text" ? `This is a detailed article about ${randomItem(postTitles)}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.` : "",
        creatorId: creator._id,
        isPaid: isPaid,
        isPublished: isPublished,
        thumbnailUrl: `https://picsum.photos/id/${randomNumber(1, 100)}/300/200`,
        commentsAllowed: Math.random() > 0.2,
        description: (type === "audio" || type === "video") ? randomItem(descriptions) : undefined,
        videoDuration: type === "video" ? randomNumber(60, 1800) : 0,
        speakers: (type === "audio" || type === "video") ? [
          { name: creator.fullName, order: 1 },
          ...(Math.random() > 0.7 ? [{ name: randomItem(firstNames), order: 2 }] : [])
        ] : [],
        videoUrl: type === "video" && !isPaid ? `https://example.com/videos/sample-${Date.now()}-${i}.mp4` : undefined,
        audioUrl: type === "audio" ? `https://example.com/audio/sample-${Date.now()}-${i}.mp3` : undefined,
        transcriptionUrl: type === "audio" ? `https://example.com/transcripts/sample-${Date.now()}-${i}.txt` : undefined,
        playbackId: type === "video" && isPaid ? `playback_${Date.now()}_${i}` : undefined,
        assetId: type === "video" && isPaid ? `asset_${Date.now()}_${i}` : undefined
      };
      
      // Only add tierId if it's defined (for paid posts)
      if (tierId) {
        postData.tierId = tierId;
      }
      
      const post = new Post(postData);
      
      try {
        await post.save();
        posts.push(post);
        console.log(`Created post: ${post.title} (${type}, paid: ${isPaid})`);
      } catch (error) {
        console.error(`Error creating post for ${creator.fullName}:`, error.message);
      }
    }
  }
  
  return posts;
};

// Create Subscriptions
const createSubscriptions = async (users, creators, tiers) => {
  const subscriptions = [];
  const statuses = ["active", "cancelled", "past_due"];
  
  for (const user of users) {
    if (user.role === "subscriber") {
      // Randomly decide if user should have a subscription (60% chance)
      if (Math.random() > 0.4) {
        const creator = randomItem(creators);
        const relevantTiers = tiers.filter(t => t.creatorId.toString() === creator._id.toString());
        
        if (relevantTiers.length > 0) {
          // Check if subscription already exists
          const existingSubscription = await Subscription.findOne({
            subscriberId: user._id,
            creatorId: creator._id
          });
          
          if (!existingSubscription) {
            const tier = randomItem(relevantTiers);
            const startDate = randomDate(new Date(2024, 0, 1), new Date());
            const nextBillingDate = new Date(startDate);
            nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
            
            const subscription = new Subscription({
              subscriberId: user._id,
              creatorId: creator._id,
              tierId: tier._id,
              tierType: tier.tierName,
              stripeSubscriptionId: `sub_${Date.now()}_${user._id}_${creator._id}`,
              stripePriceId: tier.stripePriceId,
              status: randomItem(statuses),
              startDate: startDate,
              nextBillingDate: nextBillingDate,
              autoRenew: Math.random() > 0.3
            });
            
            await subscription.save();
            subscriptions.push(subscription);
            console.log(`Created subscription: ${user.fullName} -> ${creator.fullName} (${tier.tierName})`);
          } else {
            subscriptions.push(existingSubscription);
          }
        }
      }
    }
  }
  
  return subscriptions;
};

// Create Payments
const createPayments = async (subscriptions) => {
  const payments = [];
  const statuses = ["pending", "success", "failed"];
  
  for (const subscription of subscriptions) {
    // Check if payment already exists
    const existingPayment = await Payment.findOne({ subscriptionId: subscription._id });
    
    if (!existingPayment && Math.random() > 0.3) {
      const payment = new Payment({
        tierId: subscription.tierId,
        subscriptionId: subscription._id,
        status: randomItem(statuses),
        sessionId: `session_${Date.now()}_${subscription._id}`
      });
      
      await payment.save();
      payments.push(payment);
      console.log(`Created payment for subscription: ${subscription._id}`);
    } else if (existingPayment) {
      payments.push(existingPayment);
    }
  }
  
  return payments;
};

// Create Comments
const createComments = async (users, posts) => {
  const comments = [];
  const commentContents = [
    "Great content! Really enjoyed this.",
    "Very informative, thanks for sharing!",
    "This helped me a lot, keep it up!",
    "Interesting perspective, I hadn't thought of that.",
    "Can you make more content like this?",
    "Excellent explanation!",
    "This is exactly what I was looking for.",
    "Well written and insightful.",
    "Thank you for this valuable information.",
    "Looking forward to more posts like this!"
  ];
  
  for (const post of posts) {
    const existingCommentsCount = await Comment.countDocuments({ postId: post._id });
    const desiredComments = randomNumber(0, 10);
    
    if (existingCommentsCount >= desiredComments) {
      const postComments = await Comment.find({ postId: post._id });
      comments.push(...postComments);
      continue;
    }
    
    const commentsToCreate = desiredComments - existingCommentsCount;
    
    for (let i = 0; i < commentsToCreate; i++) {
      const comment = new Comment({
        authorId: randomItem(users)._id,
        postId: post._id,
        content: randomItem(commentContents),
        likes: randomNumber(0, 50),
        dislikes: randomNumber(0, 10),
        featured: Math.random() > 0.9
      });
      
      await comment.save();
      comments.push(comment);
    }
  }
  
  console.log(`Created/Found ${comments.length} comments`);
  return comments;
};

// Create Collections
const createCollections = async (users, posts) => {
  const collections = [];
  const collectionTitles = ["Favorites", "Must Read", "Best of 2024", "Learning Resources", "Inspiration"];
  
  for (const user of users) {
    if (user.role === "subscriber" && Math.random() > 0.5) {
      const existingCollection = await Collection.findOne({ 
        creatorId: { $in: users.filter(u => u.role === "creator").map(c => c._id) },
        title: randomItem(collectionTitles)
      });
      
      if (!existingCollection) {
        const collection = new Collection({
          creatorId: randomItem(users.filter(u => u.role === "creator"))._id,
          title: randomItem(collectionTitles),
          posts: Array.from({ length: randomNumber(1, 5) }, () => randomItem(posts)._id),
          description: `A collection of my favorite posts about ${randomItem(categories)}`
        });
        
        await collection.save();
        collections.push(collection);
        console.log(`Created collection: ${collection.title} for user ${user.fullName}`);
      } else {
        collections.push(existingCollection);
      }
    }
  }
  
  return collections;
};

// Create Recommendations
const createRecommendations = async (creators) => {
  const recommendations = [];
  
  for (const creator of creators) {
    const otherCreators = creators.filter(c => c._id.toString() !== creator._id.toString());
    const numRecommendations = randomNumber(1, Math.min(3, otherCreators.length));
    
    for (let i = 0; i < numRecommendations; i++) {
      const recommendedCreator = otherCreators[i];
      
      // Check if recommendation already exists
      const existingRecommendation = await Recommendation.findOne({
        creatorId: creator._id,
        recommendedCreatorId: recommendedCreator._id
      });
      
      if (!existingRecommendation) {
        const recommendation = new Recommendation({
          creatorId: creator._id,
          recommendedCreatorId: recommendedCreator._id,
          recommendedAt: randomDate(new Date(2024, 0, 1), new Date())
        });
        
        await recommendation.save();
        recommendations.push(recommendation);
        console.log(`Created recommendation: ${creator.fullName} -> ${recommendedCreator.fullName}`);
      } else {
        recommendations.push(existingRecommendation);
      }
    }
  }
  
  return recommendations;
};

// Create Post Views
const createPostViews = async (users, posts) => {
  const views = [];
  
  for (const post of posts) {
    const existingViewsCount = await PostView.countDocuments({ postId: post._id });
    const desiredViews = randomNumber(10, 100);
    
    if (existingViewsCount >= desiredViews) {
      const postViews = await PostView.find({ postId: post._id });
      views.push(...postViews);
      continue;
    }
    
    const viewsToCreate = desiredViews - existingViewsCount;
    
    for (let i = 0; i < viewsToCreate; i++) {
      const view = new PostView({
        postId: post._id,
        viewerId: Math.random() > 0.3 ? randomItem(users)._id : undefined,
        ip: `${randomNumber(1, 255)}.${randomNumber(0, 255)}.${randomNumber(0, 255)}.${randomNumber(1, 255)}`
      });
      
      await view.save();
      views.push(view);
    }
  }
  
  console.log(`Created/Found ${views.length} post views`);
  return views;
};

// Main function to populate database
const populateDatabase = async () => {
  try {
    await connectDB();
    
    console.log("\n=== Creating Users (if needed) ===");
    const users = await createUsers(20);
    const creators = users.filter(u => u.role === "creator");
    const subscribers = users.filter(u => u.role === "subscriber");
    
    console.log("\n=== Creating Creator Profiles (if needed) ===");
    const profiles = await createProfiles(creators);
    
    console.log("\n=== Creating Subscription Tiers (if needed) ===");
    const tiers = await createSubscriptionTiers(creators);
    
    console.log("\n=== Creating Posts (if needed) ===");
    const posts = await createPosts(creators, tiers);
    
    console.log("\n=== Creating Subscriptions (if needed) ===");
    const subscriptions = await createSubscriptions(users, creators, tiers);
    
    console.log("\n=== Creating Payments (if needed) ===");
    const payments = await createPayments(subscriptions);
    
    console.log("\n=== Creating Comments (if needed) ===");
    const comments = await createComments(users, posts);
    
    console.log("\n=== Creating Collections (if needed) ===");
    const collections = await createCollections(users, posts);
    
    console.log("\n=== Creating Recommendations (if needed) ===");
    const recommendations = await createRecommendations(creators);
    
    console.log("\n=== Creating Post Views (if needed) ===");
    const views = await createPostViews(users, posts);
    
    // Summary
    console.log("\n=== Database Population Complete ===");
    console.log(`📊 Summary:`);
    console.log(`   - Users: ${users.length} (${creators.length} creators, ${subscribers.length} subscribers)`);
    console.log(`   - Creator Profiles: ${profiles.length}`);
    console.log(`   - Posts: ${posts.length}`);
    console.log(`   - Subscription Tiers: ${tiers.length}`);
    console.log(`   - Subscriptions: ${subscriptions.length}`);
    console.log(`   - Payments: ${payments.length}`);
    console.log(`   - Comments: ${comments.length}`);
    console.log(`   - Collections: ${collections.length}`);
    console.log(`   - Recommendations: ${recommendations.length}`);
    console.log(`   - Post Views: ${views.length}`);
    
    await mongoose.disconnect();
    console.log("\n✅ Database populated successfully without deleting existing data!");
    
  } catch (error) {
    console.error("Error populating database:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Run the script
populateDatabase();