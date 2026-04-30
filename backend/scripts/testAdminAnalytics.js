const BASE_URL = "http://localhost:3000/api";

const cookies = [];

async function login(email, password) {
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include"
    });
    const data = await res.json();
    if (data.success) {
      console.log("✓ Logged in as:", data.data.user.fullName, "- Role:", data.data.user.role);
      return data.data.user;
    }
    console.error("✗ Login failed:", data.error);
    return null;
  } catch (err) {
    console.error("✗ Login error:", err.message);
    return null;
  }
}

async function testEndpoint(name, endpoint) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      credentials: "include"
    });
    const data = await res.json();
    console.log(`\n=== ${name} ===`);
    console.log(JSON.stringify(data, null, 2).slice(0, 500) + (JSON.stringify(data).length > 500 ? "..." : ""));
    return true;
  } catch (err) {
    console.error(`✗ ${name} failed:`, err.message);
    return false;
  }
}

async function runTests(adminEmail, adminPassword) {
  console.log("Testing Admin Analytics Endpoints\n");
  console.log("=".repeat(50));

  const user = await login(adminEmail, adminPassword);
  if (!user) {
    console.log("\n⚠️  Make sure you have an admin user in the database.");
    console.log("   Set role: 'admin' on a user document to access these endpoints.");
    return;
  }

  if (user.role !== "admin") {
    console.log(`\n⚠️  Current user is not admin (role: ${user.role})`);
    console.log("   Update user role to 'admin' in MongoDB to access endpoints.");
    return;
  }

  console.log("\n--- Dashboard & Overview ---");
  await testEndpoint("Dashboard Stats", "/admin/dashboard");
  await testEndpoint("Platform Overview", "/admin/overview");

  console.log("\n--- Creator Analytics ---");
  await testEndpoint("Creator List", "/admin/creators");
  await testEndpoint("Top Creators", "/admin/top-creators?metric=revenue");

  console.log("\n--- Subscriber Analytics ---");
  await testEndpoint("Subscriber List", "/admin/subscribers");

  console.log("\n--- Revenue & Payments ---");
  await testEndpoint("Revenue Analytics", "/admin/revenue?period=30");
  await testEndpoint("Payment Analytics", "/admin/payments?period=30");

  console.log("\n--- Content & Engagement ---");
  await testEndpoint("Content Analytics", "/admin/content?period=30");
  await testEndpoint("Engagement Analytics", "/admin/engagement?period=30");

  console.log("\n--- Other Analytics ---");
  await testEndpoint("Tier Analytics", "/admin/tiers");
  await testEndpoint("Churn Analytics", "/admin/churn?period=30");
  await testEndpoint("Growth Trends", "/admin/growth?period=90");
  await testEndpoint("Recent Activity", "/admin/activity?type=all&limit=10");

  console.log("\n" + "=".repeat(50));
  console.log("Tests completed!");
}

const args = process.argv.slice(2);
const email = args[0] || "admin@contreon.com";
const password = args[1] || "admin123";

runTests(email, password);