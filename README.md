**CONTREON**

**Description**

CONTREON is a responsive desktop web application designed to help independent content creators monetize their work directly through their fanbase. Many creators — writers, artists, educators, and YouTubers — struggle to generate consistent income due to heavy reliance on advertisements and brand sponsorships. Existing platforms often charge high commissions and are difficult to configure for creators with limited technical knowledge.

CONTREON addresses these challenges by offering a lightweight subscription platform where creators can:
- Create and customize public profiles
- Publish exclusive content for subscribers
- Manage subscription tiers (Regular $5/month, Premium $15/month)
- Receive transparent revenue analytics with a 85% creator / 15% platform fee split
- Accept direct payouts via Stripe Connect

---
**Team Members**

| Name | Roll No. | Role |
|---|---|---|
| Salman Ali |24L-2542 | Lead, Architect, Sql, Trello Board |
| Noyan Siddiqui | 24L-2593 | Requirement Engineer, Documentation, Testing |
| Haider Ali | 24L-2522| Developer, Frontend, Backend Programming |

---

**Tech Stack**

- **Backend:** Node.js with JWT Authentication (24-hour expiry, role-based)
- **Frontend:** React
- **Database:** MongoDB (Mongoose ODM)
- **Payments:** Stripe Connect (creator onboarding & direct payouts)
- **Validation:** Zod schemas
- **Security:** bcrypt password hashing, rate-limiting (5 req/15 min per IP)

---

**Features (Sprint 1 — Core Foundation Module)**

- User Registration & Login (Creator & Subscriber roles)
- JWT Authentication (24-hour expiration, role-based access control)
- Creator Profile & Public Landing Page (unique creator URL/slug)
- Subscription Tier Management (Regular $5/month, Premium $15/month)
- Stripe Connect Integration (creator onboarding & direct payouts)
- Subscription Checkout Flow (2% platform fee, 98% to creator)
- Basic Subscription Status Tracking

---

**How to Run:**

**Prerequisites:**

- Node.js (v18+)
- MongoDB (local or Atlas)
- Stripe account (Test Mode keys)

**Backend:**

bash
cd backend
npm install


Create a ".env" file in the `backend/` folder with the following:

env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret


Then start the server:

bash
npm run dev
The backend will run at `http://localhost:5000`

**Frontend:**

bash
cd frontend
npm install
npm start


The frontend will run at `http://localhost:3000`

---
**API Overview:**

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | /auth/signup | Register a new user | No |
| POST | /auth/login | Login and receive JWT | No |
| GET | /auth/me | Get current user profile | Yes |
| PUT | /creators/profile | Update creator profile | Creator JWT |
| GET | /creators/:creatorUrl | View public creator profile | No |
| POST | /tiers | Create subscription tier | Creator JWT |
| PUT | /tiers/:tierId | Update subscription tier | Creator JWT |
| GET | /creators/:creatorId/tiers | View creator's tiers | No |
| POST | /api/creators/create-stripe-account | Initiate Stripe Connect | Creator JWT |
| GET | /api/creators/stripe-status | Check Stripe account status | Creator JWT |
| POST | /subscribe | Subscribe to a creator | Subscriber JWT |
| GET | /subscriptions | View my subscriptions | Subscriber JWT |

---

## Error Codes:

| Code | HTTP Status | Meaning |
|---|---|---|
| EMAIL_EXISTS | 400 | Email already registered |
| VALIDATION_ERROR | 400 | Invalid input data |
| UNAUTHORIZED | 401 | Missing or expired JWT token |
| INVALID_CREDENTIALS | 401 | Wrong email or password |
| FORBIDDEN | 403 | Insufficient role permissions |
| NOT_FOUND | 404 | Resource does not exist |
| STRIPE_ERROR | 500 | Stripe API failure |
| STRIPE_WEBHOOK_ERROR | 400 | Invalid webhook signature |

---

**Project Management:**

Trello Board (Sprint 1): [https://trello.com/b/Tj4mMSab/sprint-1](https://trello.com/b/Tj4mMSab/sprint-1)

---

**Non-Functional Requirements:**

- **Security:** All protected routes use JWT Bearer token authentication. Passwords hashed with bcrypt. Login rate-limited to 5 requests per 15 minutes per IP.
- **Payment Security:** Stripe Connect (Test Mode) used in development. Webhook signatures verified. No card data stored locally.
- **Revenue Transparency:** Creators receive 98% of subscription revenue. 2% platform fee deducted transparently via Stripe application fee.
- **Data Validation:** All API inputs validated with Zod. Standardized error format: `{ success: false, error: "message", code: "ERROR_CODE" }`.
- **Role-Based Access Control:** Creator-only endpoints return 403 for subscribers. Creators cannot subscribe to their own tiers.
