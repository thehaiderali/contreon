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
      case 'v2.core.account.updated':
        await handleAccountUpdated(event.data.object);
        break;
      
      case 'v2.core.account[configuration.recipient].updated':
        console.log("V2 account configuration recipient updated:", event.data.object.id);
        await handleAccountUpdated(event.data.object);
        break;
      
      case 'v2.core.account[configuration.merchant].updated':
        console.log("V2 account configuration merchant updated:", event.data.object.id);
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

  // FIX: Handle first-payment transfer for already-onboarded creators.
  // Previously this block always accumulated pendingEarnings regardless of
  // onboarding status. For onboarded creators, those earnings would sit in
  // deferredOnboarding forever because account.updated never fires again.
  if (paymentMode === "platform_hold") {
    const creatorId = session.metadata?.creator_id;
    const sellerAmount = parseFloat(session.metadata?.seller_amount || "0");

    if (creatorId && sellerAmount > 0) {
      const creator = await User.findById(creatorId);

      if (creator) {
        // Check if creator is already fully onboarded — if so, transfer immediately
        // rather than parking the funds in deferredOnboarding.
        let isFullyOnboarded = false;

        if (creator.connectedID) {
          try {
            const account = await stripe.accounts.retrieve(creator.connectedID);
            
            const hasTransfers = account.capabilities?.transfers === "active";
            const chargesEnabled = account.charges_enabled;
            const payoutsEnabled = account.payouts_enabled;
            isFullyOnboarded = chargesEnabled && payoutsEnabled && hasTransfers;

            if (isFullyOnboarded) {
              const transferAmount = Math.round(sellerAmount * 100);
              const transfer = await stripe.transfers.create({
                amount: transferAmount,
                currency: "usd",
                // Use account.id from the retrieved object — authoritative source of truth.
                destination: account.id,
                description: `First payment transfer (checkout)`,
              });
              console.log(`✅ Transferred $${sellerAmount} to onboarded creator ${creatorId} on first payment (Transfer: ${transfer.id})`);
            }
          } catch (transferError) {
            // If the transfer fails for any reason, fall through to the deferred path
            // so earnings are never silently lost.
            console.error(`⚠️ Transfer attempt failed for creator ${creatorId}, deferring: ${transferError.message}`);
            isFullyOnboarded = false;
          }
        }

        // Only accumulate pendingEarnings when the creator is NOT yet onboarded.
        // account.updated will flush these once onboarding completes.
        if (!isFullyOnboarded) {
          creator.deferredOnboarding = creator.deferredOnboarding || {};
          creator.deferredOnboarding.pendingEarnings = (creator.deferredOnboarding.pendingEarnings || 0) + sellerAmount;
          creator.deferredOnboarding.earningsCount = (creator.deferredOnboarding.earningsCount || 0) + 1;
          creator.deferredOnboarding.lastEarningDate = new Date();

          await creator.save();
          console.log(`Platform holding $${sellerAmount} for creator ${creatorId}. Total pending: $${creator.deferredOnboarding.pendingEarnings}`);
        }
      }
    }
  }

  // Only send welcome email for brand-new subscriptions.
  // We check createdAt being very recent (within 10 minutes) to avoid
  // re-sending on re-subscribe checkouts and to guard against the race condition
  // where handleSubscriptionCreated hasn't finished writing yet.
  try {
    const dbSubscriptionId = session.metadata?.db_subscription_id;
    if (!dbSubscriptionId) return;

    // Retry up to 3 times with a short delay to handle the race condition where
    // customer.subscription.created fires concurrently and may not have written yet.
    let subscription = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      subscription = await Subscription.findById(dbSubscriptionId)
        .populate('subscriberId', 'fullName email')
        .populate('creatorId', 'fullName email')
        .populate('tierId');

      if (subscription) break;

      // Wait 1s before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (!subscription) {
      console.log(`Subscription ${dbSubscriptionId} not found after retries, skipping welcome email`);
      return;
    }

    // Only send welcome email for genuinely new subscriptions.
    // A subscription is "new" if it was created within the last 10 minutes.
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const isNewSubscription = subscription.createdAt && subscription.createdAt > tenMinutesAgo;

    if (!isNewSubscription) {
      console.log(`Subscription ${dbSubscriptionId} is not new, skipping welcome email`);
      return;
    }

    // Guard against null subscriber/creator before accessing properties
    const subscriber = subscription.subscriberId;
    const creator = subscription.creatorId;
    const tier = subscription.tierId;

    if (!subscriber || !creator) {
      console.log(`Missing subscriber or creator on subscription ${dbSubscriptionId}, skipping welcome emails`);
      return;
    }

    if (!subscriber.email) {
      console.log(`Subscriber has no email on subscription ${dbSubscriptionId}, skipping welcome email`);
      return;
    }

    const dashboardUrl = `${envConfig.FRONTEND_URL}/subscriber/memberships`;

    await sendEmail(
      subscriber.email,
      `Welcome to ${creator.fullName}!`,
      welcomeEmail(subscriber.fullName, creator.fullName, tier?.tierName || 'Member', dashboardUrl)
    );

    if (creator.email) {
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
      { new: true, runValidators: false }
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

    // Fetch subscriber and creator once, reuse across both email blocks.
    // Guard against null users (e.g. deleted accounts) before accessing properties.
    let subscriber = null;
    let creator = null;

    try {
      [subscriber, creator] = await Promise.all([
        User.findById(result.subscriberId).select('fullName email'),
        User.findById(result.creatorId).select('fullName email'),
      ]);
    } catch (fetchError) {
      console.log('Could not fetch subscriber/creator for cancellation emails:', fetchError.message);
    }

    // Send cancellation email to subscriber
    if (subscriber?.email && creator?.fullName) {
      try {
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
    } else {
      console.log('Skipping subscriber cancellation email: missing subscriber or creator data');
    }

    // Notify creator
    if (creator?.email && subscriber?.fullName) {
      try {
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
      console.log('Skipping creator cancellation email: missing creator or subscriber data');
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
      const paymentMode = stripeSubscription.metadata?.payment_mode;
      const creatorId = stripeSubscription.metadata?.creator_id;
      
      const nextBillingDate = stripeSubscription.current_period_end 
        ? new Date(stripeSubscription.current_period_end * 1000) 
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      
      let subscription = null;
      
      // FIX: Add retry loop before falling back to stripeSubscriptionId lookup.
      // On a brand-new subscription, invoice.payment_succeeded fires concurrently
      // with customer.subscription.created. The DB write from handleSubscriptionCreated
      // may not have landed yet, so both findById and findOne({ stripeSubscriptionId })
      // can return null — causing the transfer block to be silently skipped.
      if (dbSubscriptionId) {
        for (let attempt = 0; attempt < 3; attempt++) {
          subscription = await Subscription.findByIdAndUpdate(
            dbSubscriptionId,
            {
              status: "active",
              nextBillingDate: nextBillingDate,
            },
            { new: true }
          );
          if (subscription) break;
          console.log(`Subscription ${dbSubscriptionId} not found on attempt ${attempt + 1}, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        if (subscription) {
          console.log(`✅ Updated subscription ${dbSubscriptionId} to active after successful payment`);
          console.log(`   New status: ${subscription?.status}`);
        } else {
          console.error(`❌ Subscription ${dbSubscriptionId} not found after retries`);
        }
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

      // Use invoice.amount_paid (the actual charged amount) to calculate the
      // seller's share rather than the stale `seller_amount` from subscription metadata,
      // which would be wrong after plan changes or prorations.
      if (paymentMode === "platform_hold" && creatorId && invoice.amount_paid) {
        // Derive the platform fee percentage from metadata to compute seller share dynamically.
        const platformFeePercent = parseFloat(stripeSubscription.metadata?.platform_fee_percent || "0");
        let sellerAmount;

        if (platformFeePercent > 0) {
          // Calculate seller's share from actual amount paid
          const amountPaidDollars = invoice.amount_paid / 100;
          sellerAmount = amountPaidDollars * (1 - platformFeePercent / 100);
        } else {
          // Fallback to metadata value if fee percent is not stored
          sellerAmount = parseFloat(stripeSubscription.metadata?.seller_amount || "0");
        }
        
        if (sellerAmount > 0) {
          const creator = await User.findById(creatorId);
          
          if (creator) {
            // Check if creator is fully onboarded
            const account = await stripe.accounts.retrieve(creator.connectedID);
            const hasTransfers = account.capabilities?.transfers === "active";
            const chargesEnabled = account.charges_enabled;
            const payoutsEnabled = account.payouts_enabled;
            isFullyOnboarded = chargesEnabled && payoutsEnabled && hasTransfers;
            
            if (isFullyOnboarded && creator.connectedID) {
              // Transfer immediately if onboarded
              const transferAmount = Math.round(sellerAmount * 100);
              const transfer = await stripe.transfers.create({
                amount: transferAmount,
                currency: "usd",
                // Use account.id from the retrieved account object (source of truth)
                // rather than creator.connectedID, which could theoretically be stale.
                destination: account.id,
                description: `Recurring payment transfer`,
              });
              
              console.log(`✅ Transferred $${sellerAmount.toFixed(2)} to creator ${creatorId} (Transfer: ${transfer.id})`);
            } else {
              // Hold funds until onboarding complete
              creator.deferredOnboarding = creator.deferredOnboarding || {};
              creator.deferredOnboarding.pendingEarnings = (creator.deferredOnboarding.pendingEarnings || 0) + sellerAmount;
              creator.deferredOnboarding.earningsCount = (creator.deferredOnboarding.earningsCount || 0) + 1;
              creator.deferredOnboarding.lastEarningDate = new Date();
              await creator.save();
              
              console.log(`💰 Held $${sellerAmount.toFixed(2)} for creator ${creatorId} (not onboarded)`);
            }
          }
        }
      }

      // Send payment receipt email
      if (subscription) {
        try {
          // Guard against null subscriber/creator before accessing properties
          const [subscriber, creator] = await Promise.all([
            User.findById(subscription.subscriberId).select('fullName email'),
            User.findById(subscription.creatorId).select('fullName'),
          ]);

          if (!subscriber?.email || !creator?.fullName) {
            console.log('Missing subscriber or creator data, skipping payment receipt email');
          } else {
            const amount = invoice.amount_paid ? `$${(invoice.amount_paid / 100).toFixed(2)}` : '$0.00';
            const paymentDate = new Date().toLocaleDateString();
            const receiptId = invoice.number || `INV-${Date.now()}`;
            const manageUrl = `${envConfig.FRONTEND_URL}/subscriber/memberships`;
            
            await sendEmail(
              subscriber.email,
              `Payment receipt for ${creator.fullName}`,
              paymentReceiptEmail(subscriber.fullName, creator.fullName, amount, paymentDate, subscription.tierType, receiptId, manageUrl)
            );
            console.log(`✅ Payment receipt sent to ${subscriber.email}`);
          }
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
          // Guard against null subscriber/creator before accessing properties
          const [subscriber, creator] = await Promise.all([
            User.findById(subscription.subscriberId).select('fullName email'),
            User.findById(subscription.creatorId).select('fullName'),
          ]);

          if (!subscriber?.email || !creator?.fullName) {
            console.log('Missing subscriber or creator data, skipping payment failed email');
          } else {
            const tier = subscription.tierType;
            
            // Use Stripe's next_payment_attempt timestamp if available, since
            // Stripe's Smart Retry schedule is configurable and not always 7 days.
            // Fall back to 7 days only when Stripe provides no retry date.
            const retryDate = invoice.next_payment_attempt
              ? new Date(invoice.next_payment_attempt * 1000).toLocaleDateString()
              : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString();

            const updatePaymentUrl = `${envConfig.FRONTEND_URL}/subscriber/memberships`;
            
            await sendEmail(
              subscriber.email,
              `Payment failed for ${creator.fullName}`,
              paymentFailedEmail(subscriber.fullName, creator.fullName, tier, retryDate, updatePaymentUrl)
            );
            console.log(`✅ Payment failed email sent to ${subscriber.email}`);
          }
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

  const chargesEnabled = account.charges_enabled;
  const payoutsEnabled = account.payouts_enabled;
  const hasTransfers = account.capabilities?.transfers === "active";
  const isFullyVerified = chargesEnabled && payoutsEnabled && hasTransfers;

  if (!isFullyVerified) {
    console.log("Account not fully verified yet - charges:", chargesEnabled, "payouts:", payoutsEnabled, "transfers:", account.capabilities?.transfers);
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
      // Use account.id from the event directly (already verified above),
      // not creator.connectedID, to ensure we're using the authoritative Stripe value.
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

// Log a warning for unmapped Stripe statuses instead of silently
// defaulting to 'incomplete', which could corrupt subscription state.
function mapStripeStatus(stripeStatus) {
  const statusMap = {
    'active': 'active',
    'past_due': 'past_due',
    'canceled': 'cancelled',
    'incomplete': 'incomplete',
    'incomplete_expired': 'incomplete_expired',
    'trialing': 'active',
    'unpaid': 'past_due',
    'paused': 'paused',
  };

  const mapped = statusMap[stripeStatus];

  if (!mapped) {
    console.warn(`⚠️ Unrecognized Stripe subscription status: "${stripeStatus}". Defaulting to "incomplete". Consider adding this status to mapStripeStatus().`);
    return 'incomplete';
  }

  return mapped;
}