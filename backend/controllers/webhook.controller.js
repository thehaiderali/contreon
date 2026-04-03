import stripe from "../config/stripe.js";
import User from "../models/user.model.js";
import Subscription from "../models/subscription.model.js";
import SubscriptionTier from "../models/subscriptionTier.model.js";

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

  console.log(`Processing webhook: ${event.type}`);

  switch (event.type) {
    case "account.updated":
      await handleAccountUpdated(event.data.object);
      break;
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object);
      break;
    case "invoice.payment_succeeded":
      await handleInvoicePaymentSucceeded(event.data.object);
      break;
    case "invoice.payment_failed":
      await handleInvoicePaymentFailed(event.data.object);
      break;
    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event.data.object);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
}

async function handleAccountUpdated(account) {
  try {
    const user = await User.findOne({ connectedID: account.id });
    
    if (user) {
      const isFullyOnboarded =
        account.charges_enabled &&
        account.payouts_enabled &&
        account.details_submitted;

      if (isFullyOnboarded && !user.onBoarded) {
        await User.findByIdAndUpdate(user._id, { onBoarded: true });
        console.log(`✅ User ${user._id} completed Stripe onboarding`);
      }
    }
  } catch (error) {
    console.error("Error handling account.updated:", error);
  }
}

async function handleCheckoutCompleted(session) {
  try {
    const subscriptionId = session.subscription;
    const creatorId = session.metadata?.creatorId;
    
    if (subscriptionId && creatorId) {
      // Find and update subscription status
      const subscription = await Subscription.findOne({ 
        stripeSubscriptionId: subscriptionId 
      });
      
      if (subscription) {
        subscription.status = "active";
        await subscription.save();
        console.log(`✅ Subscription ${subscription._id} activated`);
      }
    }
  } catch (error) {
    console.error("Error handling checkout.completed:", error);
  }
}

async function handleInvoicePaymentSucceeded(invoice) {
  try {
    const subscription = await Subscription.findOne({ 
      stripeSubscriptionId: invoice.subscription 
    });
    
    if (subscription) {
      subscription.status = "active";
      if (invoice.lines?.data[0]?.period?.end) {
        subscription.nextBillingDate = new Date(invoice.lines.data[0].period.end * 1000);
      }
      await subscription.save();
      console.log(`✅ Subscription ${subscription._id} renewed successfully`);
    }
  } catch (error) {
    console.error("Error handling payment succeeded:", error);
  }
}

async function handleInvoicePaymentFailed(invoice) {
  try {
    const subscription = await Subscription.findOne({ 
      stripeSubscriptionId: invoice.subscription 
    });
    
    if (subscription) {
      subscription.status = "past_due";
      await subscription.save();
      console.log(`⚠️ Subscription ${subscription._id} payment failed`);
      // TODO: Send email to subscriber
    }
  } catch (error) {
    console.error("Error handling payment failed:", error);
  }
}

async function handleSubscriptionUpdated(subscription) {
  try {
    const userSubscription = await Subscription.findOne({ 
      stripeSubscriptionId: subscription.id 
    });
    
    if (userSubscription) {
      userSubscription.status = subscription.status === "active" ? "active" : "cancelled";
      await userSubscription.save();
      console.log(`📝 Subscription ${userSubscription._id} status: ${subscription.status}`);
    }
  } catch (error) {
    console.error("Error handling subscription updated:", error);
  }
}

async function handleSubscriptionDeleted(subscription) {
  try {
    const userSubscription = await Subscription.findOne({ 
      stripeSubscriptionId: subscription.id 
    });
    
    if (userSubscription) {
      userSubscription.status = "cancelled";
      userSubscription.cancelDate = new Date();
      userSubscription.autoRenew = false;
      await userSubscription.save();
      console.log(`❌ Subscription ${userSubscription._id} cancelled`);
    }
  } catch (error) {
    console.error("Error handling subscription deleted:", error);
  }
}