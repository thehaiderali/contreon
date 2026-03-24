import { connectDB } from "./config/db.js";
import User from "./models/User.js";
import CreatorProfile from "./models/CreatorProfile.js";
import SubscriptionTier from "./models/SubscriptionTier.js";
import Subscription from "./models/Subscription.js";

async function runTests() {
  await connectDB();

  console.log("\n--- Testing User ---");
  const creator = await User.create({
    fullName: "Ali Ahmed",
    email: "ali@test.com",
    password: "12345678",
    role: "creator",
  });
  console.log("User (creator) created:", creator._id);

  const subscriber = await User.create({
    fullName: "Sara Khan",
    email: "sara@test.com",
    password: "12345678",
    role: "subscriber",
  });
  console.log("User (subscriber) created:", subscriber._id);

  console.log("\n--- Testing CreatorProfile ---");
  const profile = await CreatorProfile.create({
    creatorId: creator._id,
    bio: "This is my test bio for testing",
    pageName: "AliPage",
    pageUrl: "ali-page",
    profileImageUrl: "https://example.com/image.jpg",
    bannerUrl: "https://example.com/banner.jpg",
    socialLinks: ["https://twitter.com/ali"],
    aboutPage: "This is my about page",
  });
  console.log("CreatorProfile created:", profile._id);

  console.log("\n--- Testing SubscriptionTier ---");
  const regularTier = await SubscriptionTier.create({
    creatorId: creator._id,
    tierName: "regular",
    price: 500,
    description: "Regular tier access",
    perks: ["Access to posts", "Monthly newsletter"],
  });
  console.log("SubscriptionTier (regular) created:", regularTier._id);

  const premiumTier = await SubscriptionTier.create({
    creatorId: creator._id,
    tierName: "premium",
    price: 1500,
    description: "Premium tier access",
    perks: ["Access to all posts", "Live chat", "Exclusive content"],
  });
  console.log("SubscriptionTier (premium) created:", premiumTier._id);

  console.log("\n--- Testing Subscription ---");
  const regularSub = await Subscription.create({
    subscriberId: subscriber._id,
    creatorId: creator._id,
    tierType: "regular",
    stripeSubscriptionId: "test_stripe_sub_001",
    stripePriceId: "test_stripe_price_001",
    status: "active",
    startDate: new Date(),
    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });
  console.log("Subscription (regular) created:", regularSub._id);

  const premiumSub = await Subscription.create({
    subscriberId: subscriber._id,
    creatorId: creator._id,
    tierType: "premium",
    stripeSubscriptionId: "test_stripe_sub_002",
    stripePriceId: "test_stripe_price_002",
    status: "active",
    startDate: new Date(),
    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });
  console.log("Subscription (premium) created:", premiumSub._id);

  console.log("\n--- Cleaning up test data ---");
  await User.deleteMany({ email: { $in: ["ali@test.com", "sara@test.com"] } });
  await CreatorProfile.deleteOne({ _id: profile._id });
  await SubscriptionTier.deleteMany({ creatorId: creator._id });
  await Subscription.deleteMany({ subscriberId: subscriber._id });
  console.log("Test data cleaned up");

  console.log("\n✅ All tests passed!");
  process.exit(0);
}

runTests().catch((error) => {
  console.error("\n❌ Test failed:", error.message);
  process.exit(1);
});