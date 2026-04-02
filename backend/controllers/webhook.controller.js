import stripe from "../config/stripe.js";
import User from "../models/user.model.js";

export async function handleStripeWebhook(req, res) {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log(`Webhook signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "account.updated":
      await handleAccountUpdated(event.data.object);
      break;
    case "account.application.authorized":
      console.log("Account authorized:", event.data.object.id);
      break;
    case "account.application.deauthorized":
      console.log("Account deauthorized:", event.data.object.id);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
}

async function handleAccountUpdated(account) {
  try {
    // Find user by Stripe account ID
    const user = await User.findOne({ connectedID: account.id });
    
    if (user) {
      const isFullyOnboarded =
        account.charges_enabled &&
        account.payouts_enabled &&
        account.details_submitted;

      // Update user's onboarding status if needed
      if (isFullyOnboarded && !user.onBoarded) {
        await User.findByIdAndUpdate(user._id, { onBoarded: true });
        console.log(`User ${user._id} completed Stripe onboarding`);
      }
    }
  } catch (error) {
    console.error("Error handling account.updated:", error);
  }
}