import User from "../models/user.model.js";
import { connectDB } from "../config/db.js";
import { envConfig } from "../config/env.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const BASE_URL = "http://localhost:3000/api";

async function createAdmin() {
  await connectDB();

  const adminEmail = "admin@contreon.com";
  const plainPassword = "admin123";
  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  
  let admin = await User.findOne({ email: adminEmail });

  if (!admin) {
    admin = await User.create({
      fullName: "Admin User",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      onBoarded: true
    });
    console.log("✓ Admin user created:", adminEmail);
  } else {
    admin.password = hashedPassword;
    admin.role = "admin";
    await admin.save();
    console.log("✓ Admin password reset:", adminEmail);
  }

  const token = jwt.sign(
    { userId: admin._id, role: admin.role },
    envConfig.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return { admin, token };
}

async function testEndpoint(name, endpoint, token) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    const data = await res.json();
    console.log(`\n=== ${name} ===`);
    console.log(JSON.stringify(data, null, 2));
    return data;
  } catch (err) {
    console.error(`✗ ${name} failed:`, err.message);
    return null;
  }
}

async function run() {
  console.log("🚀 Seeding Admin & Testing Analytics\n");
  console.log("=".repeat(60));

  const { token } = await createAdmin();

  console.log("\n--- Dashboard & Overview ---");
  await testEndpoint("Dashboard Stats", "/admin/dashboard", token);
  await testEndpoint("Platform Overview", "/admin/overview", token);

  console.log("\n--- Creator Analytics ---");
  await testEndpoint("Creator List", "/admin/creators", token);
  await testEndpoint("Top Creators (Revenue)", "/admin/top-creators?metric=revenue", token);
  await testEndpoint("Top Creators (Subscribers)", "/admin/top-creators?metric=subscribers", token);

  console.log("\n--- Subscriber Analytics ---");
  await testEndpoint("Subscriber List", "/admin/subscribers", token);

  console.log("\n--- Revenue & Payments ---");
  await testEndpoint("Revenue (7 days)", "/admin/revenue?period=7", token);
  await testEndpoint("Revenue (30 days)", "/admin/revenue?period=30", token);
  await testEndpoint("Payment Analytics", "/admin/payments?period=30", token);

  console.log("\n--- Content & Engagement ---");
  await testEndpoint("Content Analytics", "/admin/content?period=30", token);
  await testEndpoint("Engagement Analytics", "/admin/engagement?period=30", token);

  console.log("\n--- Other Analytics ---");
  await testEndpoint("Tier Analytics", "/admin/tiers", token);
  await testEndpoint("Churn Analytics", "/admin/churn?period=30", token);
  await testEndpoint("Growth Trends", "/admin/growth?period=90", token);
  await testEndpoint("Recent Activity", "/admin/activity?type=all&limit=10", token);

  console.log("\n" + "=".repeat(60));
  console.log("✅ All tests completed!");
  console.log("\n📧 Admin Login Credentials:");
  console.log("   Email: admin@contreon.com");
  console.log("   Password: admin123");
}

run();