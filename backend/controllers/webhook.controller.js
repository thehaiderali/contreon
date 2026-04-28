import stripe from "../config/stripe.js";
import Subscription from "../models/subscription.model.js";
import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";
import CreatorProfile from "../models/profile.model.js";
import { envConfig } from "../config/env.js";
import { welcomeEmail, cancellationEmail, paymentReceiptEmail, paymentFailedEmail, newSubscriberEmail, subscriberCancelledEmail, sendEmail } from "../emails/templates.js";

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
        
      case 'account.updated':
        await handleAccountUpdated(event.data.object);
        break;
        
      case 'transfer.created':
        console.log("Transfer created:", event.data.object.id);
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
  
  const paymentMode = session.metadata?.payment_mode;
  
  // Update payment status
  await Payment.findOneAndUpdate(
    { sessionId: session.id },
    { status: "success" }
  );

  // If platform holds payment (seller not fully onboarded), track pending earnings
  if (paymentMode === "platform_hold") {
    const creatorId = session.metadata?.creator_id;
    const sellerAmount = parseFloat(session.metadata?.seller_amount || "0");

    if (creatorId && sellerAmount > 0) {
      const creator = await User.findById(creatorId);

      if (creator) {
        creator.deferredOnboarding = creator.deferredOnboarding || {};
        creator.deferredOnboarding.pendingEarnings = (creator.deferredOnboarding.pendingEarnings || 0) + sellerAmount;
        creator.deferredOnboarding.earningsCount = (creator.deferredOnboarding.earningsCount || 0) + 1;
        creator.deferredOnboarding.lastEarningDate = new Date();

        await creator.save();

        console.log(`Platform holding $${sellerAmount} for creator ${creatorId}. Total pending: $${creator.deferredOnboarding.pendingEarnings}`);
      }
    }
  }

  // Send welcome email to new subscriber
  try {
    const dbSubscriptionId = session.metadata?.db_subscription_id;
    const subscription = dbSubscriptionId
      ? await Subscription.findById(dbSubscriptionId)
          .populate('subscriberId', 'fullName email')
          .populate('creatorId', 'fullName')
          .populate('tierId')
      : null;

    if (subscription && subscription.subscriberId && subscription.creatorId) {
      const subscriber = subscription.subscriberId;
      const creator = subscription.creatorId;
      const tier = subscription.tierId;

      const dashboardUrl = `${envConfig.FRONTEND_URL}/subscriber/memberships`;

      await sendEmail(
        subscriber.email,
        `Welcome to ${creator.fullName}!`,
        welcomeEmail(subscriber.fullName, creator.fullName, tier?.tierName || 'Member', dashboardUrl)
      );

      const creatorProfile = await CreatorProfile.findOne({ creatorId: creator._id });
      const manageUrl = `${envConfig.FRONTEND_URL}/creator/members`;

      await sendEmail(
        creator.email,
        `New subscriber: ${subscriber.fullName}`,
        newSubscriberEmail(
          creator.fullName,
          subscriber.fullName,
          tier?.tierName || 'Member',
          tier?.price ? `$${tier.price}` : '$0',
          manageUrl
        )
      );
    }
  } catch (emailError) {
    console.log('Could not send welcome email:', emailError.message);
  }
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

    // Send cancellation email to subscriber
    try {
      const subscriber = await User.findById(result.subscriberId).select('fullName email');
      const creator = await User.findById(result.creatorId).select('fullName');
      
      const restoreUrl = `${envConfig.FRONTEND_URL}/explore`;
      
      await sendEmail(
        subscriber.email,
        `Membership cancelled for ${creator.fullName}`,
        cancellationEmail(subscriber.fullName, creator.fullName, result.tierType, restoreUrl)
      );
      console.log(`✅ Cancellation email sent to ${subscriber.email}`);
    } catch (emailError) {
      console.log('Could not send cancellation email:', emailError.message);
    }

    // Notify creator
    try {
      const creator = await User.findById(result.creatorId).select('fullName email');
      const subscriber = await User.findById(result.subscriberId).select('fullName');
      
      const manageUrl = `${envConfig.FRONTEND_URL}/creator/members`;
      
      await sendEmail(
        creator.email,
        `Subscriber cancelled: ${subscriber.fullName}`,
        subscriberCancelledEmail(creator.fullName, subscriber.fullName, result.tierType, manageUrl)
      );
      console.log(`✅ Cancellation notification sent to creator ${creator.email}`);
    } catch (emailError) {
      console.log('Could not send creator notification:', emailError.message);
    }
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
      
      let subscription = null;
      
      if (dbSubscriptionId) {
        subscription = await Subscription.findByIdAndUpdate(
          dbSubscriptionId,
          {
            status: "active",
            nextBillingDate: nextBillingDate,
          },
          { new: true }
        );
        console.log(`✅ Updated subscription ${dbSubscriptionId} to active after successful payment`);
        console.log(`   New status: ${subscription?.status}`);
      } else {
        subscription = await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: invoice.subscription },
          {
            status: "active",
            nextBillingDate: nextBillingDate,
          },
          { new: true }
        );
        if (subscription) {
          console.log(`✅ Updated subscription ${subscription._id} to active`);
        } else {
          console.error(`❌ Subscription ${invoice.subscription} not found`);
        }
      }

      // Send payment receipt email
      if (subscription) {
        try {
          const subscriber = await User.findById(subscription.subscriberId).select('fullName email');
          const creator = await User.findById(subscription.creatorId).select('fullName');
          
          const amount = invoice.amount_paid ? `$${(invoice.amount_paid / 100).toFixed(2)}` : await getTierPrice(subscription.tierId);
          const paymentDate = new Date().toLocaleDateString();
          const receiptId = invoice.number || `INV-${Date.now()}`;
          const manageUrl = `${envConfig.FRONTEND_URL}/subscriber/memberships`;
          
          await sendEmail(
            subscriber.email,
            `Payment receipt for ${creator.fullName}`,
            paymentReceiptEmail(subscriber.fullName, creator.fullName, amount, paymentDate, subscription.tierType, receiptId, manageUrl)
          );
          console.log(`✅ Payment receipt sent to ${subscriber.email}`);
        } catch (emailError) {
          console.log('Could not send payment receipt email:', emailError.message);
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
      
      let subscription = null;
      
      if (dbSubscriptionId) {
        subscription = await Subscription.findByIdAndUpdate(dbSubscriptionId, {
          status: "past_due",
        }, { new: true });
        console.log(`⚠️ Updated subscription ${dbSubscriptionId} to past_due after failed payment`);
      } else {
        subscription = await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: invoice.subscription },
          { status: "past_due" },
          { new: true }
        );
      }

      // Send payment failed email to subscriber
      if (subscription) {
        try {
          const subscriber = await User.findById(subscription.subscriberId).select('fullName email');
          const creator = await User.findById(subscription.creatorId).select('fullName');
          const tier = subscription.tierType;
          
          const retryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString();
          const updatePaymentUrl = `${envConfig.FRONTEND_URL}/subscriber/memberships`;
          
          await sendEmail(
            subscriber.email,
            `Payment failed for ${creator.fullName}`,
            paymentFailedEmail(subscriber.fullName, creator.fullName, tier, retryDate, updatePaymentUrl)
          );
          console.log(`✅ Payment failed email sent to ${subscriber.email}`);
        } catch (emailError) {
          console.log('Could not send payment failed email:', emailError.message);
        }
      }
    } catch (error) {
      console.error("Error processing invoice payment failure:", error);
    }
  }
}

async function handleAccountUpdated(account) {
  console.log("Account updated:", account.id);

  const isFullyVerified = account.charges_enabled && account.capabilities?.transfers === "active";

  if (!isFullyVerified) {
    console.log("Account not fully verified yet");
    return;
  }

  const creator = await User.findOne({ connectedID: account.id });

  if (!creator) {
    console.log("No creator found for account:", account.id);
    return;
  }

  creator.isConnected = true;
  await creator.save();

  const pendingEarnings = creator.deferredOnboarding?.pendingEarnings || 0;

  if (pendingEarnings <= 0) {
    console.log("No pending earnings to transfer");
    return;
  }

  console.log(`Transferring pending earnings: $${pendingEarnings} to ${account.id}`);

  try {
    const transfer = await stripe.transfers.create({
      amount: Math.round(pendingEarnings * 100),
      currency: "usd",
      destination: account.id,
      description: `Transfer of pending earnings`,
    });

    console.log("Transfer successful:", transfer.id);

    creator.deferredOnboarding.pendingEarnings = 0;
    creator.deferredOnboarding.lastEarningDate = new Date();
    await creator.save();

    console.log(`Successfully transferred $${pendingEarnings} to creator ${creator._id}`);
  } catch (error) {
    console.error("Error transferring pending earnings:", error.message);
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