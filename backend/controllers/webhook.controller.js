import stripe from "../config/stripe.js";
import Subscription from "../models/subscription.model.js";
import Payment from "../models/payment.model.js";
import { envConfig } from "../config/env.js";

export async function handleStripeWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      envConfig.STRIPE_WEBHOOK_SECRET
    );
    console.log(`Webhook verified successfully - Event type: ${event.type}`);
  } catch (err) {
    console.log(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
        
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
        
      case 'invoice.paid':
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
        
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error(`Webhook handler error: ${error.message}`);
    console.error(error.stack);
    res.status(500).json({ error: error.message });
  }
}

async function handleCheckoutSessionCompleted(session) {
  console.log("Checkout session completed:", session.id);
  
  const dbSubscriptionId = session.metadata?.db_subscription_id;
  
  if (!dbSubscriptionId) {
    console.error("No db_subscription_id in session metadata");
    return;
  }
  
  // Update payment status
  await Payment.findOneAndUpdate(
    { sessionId: session.id },
    { status: "success" }
  );
  
  console.log(`Checkout completed for subscription: ${dbSubscriptionId}`);
}

async function handleSubscriptionCreated(subscription) {
  console.log("Subscription created in Stripe:", subscription.id);
  
  const dbSubscriptionId = subscription.metadata?.db_subscription_id;
  
  if (!dbSubscriptionId) {
    console.error("No db_subscription_id in subscription metadata");
    return;
  }
  
  // Safely convert timestamps to dates
  const startDate = subscription.current_period_start 
    ? new Date(subscription.current_period_start * 1000) 
    : new Date();
    
  const nextBillingDate = subscription.current_period_end 
    ? new Date(subscription.current_period_end * 1000) 
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  
  console.log(`Start date: ${startDate}, Next billing: ${nextBillingDate}`);
  
  // Update the existing subscription with Stripe ID
  try {
    const updatedSubscription = await Subscription.findByIdAndUpdate(
      dbSubscriptionId,
      {
        stripeSubscriptionId: subscription.id,
        status: mapStripeStatus(subscription.status),
        startDate: startDate,
        nextBillingDate: nextBillingDate,
        autoRenew: !subscription.cancel_at_period_end,
      },
      { new: true, runValidators: false } // Disable validators to avoid date issues
    );
    
    if (updatedSubscription) {
      console.log(`✅ Updated subscription ${dbSubscriptionId} with Stripe ID ${subscription.id}`);
      console.log(`   Status: ${updatedSubscription.status}`);
      console.log(`   Start Date: ${updatedSubscription.startDate}`);
      console.log(`   Next Billing: ${updatedSubscription.nextBillingDate}`);
    } else {
      console.error(`❌ Subscription ${dbSubscriptionId} not found in database`);
    }
  } catch (error) {
    console.error(`Error updating subscription: ${error.message}`);
    // Fallback: Try updating without date fields
    try {
      await Subscription.findByIdAndUpdate(
        dbSubscriptionId,
        {
          stripeSubscriptionId: subscription.id,
          status: mapStripeStatus(subscription.status),
          autoRenew: !subscription.cancel_at_period_end,
        },
        { new: true }
      );
      console.log(`✅ Updated subscription ${dbSubscriptionId} with Stripe ID (without dates)`);
    } catch (fallbackError) {
      console.error(`❌ Fallback update also failed: ${fallbackError.message}`);
    }
  }
}

async function handleSubscriptionUpdated(subscription) {
  console.log("Subscription updated in Stripe:", subscription.id);
  
  // Try to find by metadata first, then by stripeSubscriptionId
  let existingSubscription = null;
  
  if (subscription.metadata?.db_subscription_id) {
    existingSubscription = await Subscription.findById(
      subscription.metadata.db_subscription_id
    );
  }
  
  if (!existingSubscription) {
    existingSubscription = await Subscription.findOne({
      stripeSubscriptionId: subscription.id
    });
  }
  
  if (existingSubscription) {
    const nextBillingDate = subscription.current_period_end 
      ? new Date(subscription.current_period_end * 1000) 
      : existingSubscription.nextBillingDate;
    
    existingSubscription.status = mapStripeStatus(subscription.status);
    existingSubscription.nextBillingDate = nextBillingDate;
    existingSubscription.autoRenew = !subscription.cancel_at_period_end;
    
    if (subscription.cancel_at_period_end) {
      existingSubscription.cancelDate = new Date();
    } else {
      existingSubscription.cancelDate = null;
    }
    
    await existingSubscription.save();
    console.log(`✅ Updated subscription ${existingSubscription._id} status to ${existingSubscription.status}`);
  } else {
    console.error(`❌ Subscription ${subscription.id} not found in database`);
  }
}

async function handleSubscriptionDeleted(subscription) {
  console.log("Subscription deleted in Stripe:", subscription.id);
  
  const result = await Subscription.findOneAndUpdate(
    { stripeSubscriptionId: subscription.id },
    {
      status: "cancelled",
      autoRenew: false,
      cancelDate: new Date(),
    },
    { new: true }
  );
  
  if (result) {
    console.log(`✅ Marked subscription ${result._id} as cancelled`);
  } else {
    console.error(`❌ Subscription ${subscription.id} not found in database`);
  }
}

async function handleInvoicePaymentSucceeded(invoice) {
  console.log("Invoice payment succeeded:", invoice.id);
  
  if (invoice.subscription) {
    try {
      const stripeSubscription = await stripe.subscriptions.retrieve(invoice.subscription);
      const dbSubscriptionId = stripeSubscription.metadata?.db_subscription_id;
      
      const nextBillingDate = stripeSubscription.current_period_end 
        ? new Date(stripeSubscription.current_period_end * 1000) 
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      
      if (dbSubscriptionId) {
        const updated = await Subscription.findByIdAndUpdate(
          dbSubscriptionId,
          {
            status: "active",
            nextBillingDate: nextBillingDate,
          },
          { new: true }
        );
        console.log(`✅ Updated subscription ${dbSubscriptionId} to active after successful payment`);
        console.log(`   New status: ${updated?.status}`);
      } else {
        // Try to find by stripe subscription ID
        const updated = await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: invoice.subscription },
          {
            status: "active",
            nextBillingDate: nextBillingDate,
          },
          { new: true }
        );
        if (updated) {
          console.log(`✅ Updated subscription ${updated._id} to active`);
        } else {
          console.error(`❌ Subscription ${invoice.subscription} not found`);
        }
      }
    } catch (error) {
      console.error("Error processing invoice payment success:", error);
    }
  }
}

async function handleInvoicePaymentFailed(invoice) {
  console.log("Invoice payment failed:", invoice.id);
  
  if (invoice.subscription) {
    try {
      const stripeSubscription = await stripe.subscriptions.retrieve(invoice.subscription);
      const dbSubscriptionId = stripeSubscription.metadata?.db_subscription_id;
      
      if (dbSubscriptionId) {
        await Subscription.findByIdAndUpdate(dbSubscriptionId, {
          status: "past_due",
        });
        console.log(`⚠️ Updated subscription ${dbSubscriptionId} to past_due after failed payment`);
      } else {
        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: invoice.subscription },
          { status: "past_due" }
        );
      }
    } catch (error) {
      console.error("Error processing invoice payment failure:", error);
    }
  }
}

function mapStripeStatus(stripeStatus) {
  const statusMap = {
    'active': 'active',
    'past_due': 'past_due',
    'canceled': 'cancelled',
    'incomplete': 'incomplete',
    'incomplete_expired': 'incomplete_expired',
    'trialing': 'active',
    'unpaid': 'past_due'
  };
  return statusMap[stripeStatus] || 'incomplete';
}