import stripe from "../config/stripe.js";
import User from "../models/user.model.js"
import Subscription from "../models/subscription.model.js"
import { envConfig } from "../config/env.js";
import SubscriptionTier from "../models/subscriptionTier.model.js";
import Payment from "../models/payment.model.js";

export async function createConnectedAccount(req, res) {
  try {
    const creator = await User.findById(req.user.userId);
    if (creator.connectedID) {
      return res.status(400).json({
        success: false,
        error: "Stripe ConnectedID for this Creator Already Exists"
      });
    }
    
    const account = await stripe.accounts.create({
      email: creator.email,
      type: "express",
      country: "US",
      business_profile: { name: creator.fullName, url: 'https://yoursite.com' },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true }
      },
      settings: {
        payouts: {
          schedule: { interval: "manual" }
        }
      }
    });

    const updated = await User.findByIdAndUpdate(creator._id, {
      connectedID: account.id,
      isConnected: true
    });
    
    return res.status(200).json({
      success: true,
      data: { user: updated }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createStripeOnboarding(req, res) {
  const creator = await User.findById(req.user.userId);
  const connectedID = creator.connectedID;
  
  if (!connectedID) {
    return res.status(400).json({
      success: false,
      error: "No Stripe account found. Please connect first."
    });
  }
  
  try {
    const accountLink = await stripe.accountLinks.create({
      account: connectedID,
      refresh_url: `${envConfig.FRONTEND_URL}/creator/payouts`,
      return_url: `${envConfig.FRONTEND_URL}/creator/payouts`,
      type: 'account_onboarding',
    });
    res.json({ success: true, url: accountLink.url });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getStripeAccountStatus(req, res) {
  try {
    const creator = await User.findById(req.user.userId);
    
    if (!creator.connectedID) {
      return res.json({
        success: true,
        data: { connected: false, isOnboarded: false }
      });
    }
    
    const account = await stripe.accounts.retrieve(creator.connectedID);
    
    const isOnboarded = account.details_submitted && account.charges_enabled;
    
    await User.findByIdAndUpdate(creator._id, {
      stripeAccountStatus: {
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted
      }
    });
    
    return res.json({
      success: true,
      data: {
        connected: true,
        isOnboarded,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createPayout(req, res) {
  try {
    const creator = await User.findById(req.user.userId);
    
    if (!creator.connectedID) {
      return res.status(400).json({
        success: false,
        error: "No Stripe account connected"
      });
    }
    
    const stripeStatus = creator.stripeAccountStatus || {};
    const isOnboarded = stripeStatus.payoutsEnabled && stripeStatus.chargesEnabled;
    
    if (!isOnboarded) {
      return res.status(400).json({
        success: false,
        error: "Complete Stripe onboarding first to receive payouts"
      });
    }
    
    const pendingEarnings = creator.deferredOnboarding?.pendingEarnings || 0;
    
    if (pendingEarnings < 1) {
      return res.status(400).json({
        success: false,
        error: "Minimum payout is $1.00"
      });
    }
    
    // Transfer pending earnings from platform to creator's connected account
    const transfer = await stripe.transfers.create({
      amount: Math.round(pendingEarnings * 100),
      currency: "usd",
      destination: creator.connectedID,
      description: `Manual payout of ${creator.deferredOnboarding.earningsCount || 0} sales`,
    });
    
    console.log("Transfer created:", transfer.id);
    
    creator.deferredOnboarding.pendingEarnings = 0;
    creator.deferredOnboarding.lastEarningDate = new Date();
    await creator.save();
    
    return res.json({
      success: true,
      message: "Payout successful",
      data: {
        transferId: transfer.id,
        amount: pendingEarnings
      }
    });
  } catch (err) {
    console.error("Error creating payout:", err.message);
    return res.status(400).json({
      success: false,
      error: err.message || "Failed to create payout"
    });
  }
}

export async function getEarnings(req, res) {
  try {
    const creator = await User.findById(req.user.userId);
    
    let pendingEarnings = 0;
    let earningsCount = 0;
    let lastEarningDate = null;
    
    if (creator.connectedID) {
      const balance = await stripe.balance.retrieve({
        stripeAccount: creator.connectedID
      });
      const available = balance.available.find(b => b.currency === 'usd');
      pendingEarnings = available ? available.amount / 100 : 0;
      
      const payouts = await stripe.payouts.list({
        limit: 100,
      }, {
        stripeAccount: creator.connectedID
      });
      earningsCount = payouts.data.length;
      if (payouts.data.length > 0) {
        const lastPayout = payouts.data[0];
        lastEarningDate = new Date(lastPayout.created * 1000);
      }
    }
    
    return res.json({
      success: true,
      data: {
        pendingEarnings,
        earningsCount,
        lastEarningDate
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createSubscriberCheckout(req, res) {
  try {
    const { tierId } = req.body;

    const subscriber = await User.findById(req.user.userId);
    if (!subscriber) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const tier = await SubscriptionTier.findById(tierId);
    if (!tier) {
      return res.status(404).json({
        success: false,
        error: "Membership tier not found",
      });
    }

    const existing = await Subscription.findOne({
      subscriberId: subscriber._id,
      tierId,
      status: { $in: ["active", "trialing", "past_due"] },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: "Already subscribed",
      });
    }

    const creator = await User.findById(tier.creatorId);
    if (!creator) {
      return res.status(404).json({
        success: false,
        error: "Creator not found",
      });
    }

    // Create subscription with pending status (no stripeSubscriptionId yet)
   // In createSubscriberCheckout function, update the subscription creation:
const newSubscription = new Subscription({
  subscriberId: subscriber._id,
  tierId: tierId,
  creatorId: tier.creatorId,
  tierType: tier.tierName,
  status: "incomplete",
  startDate: new Date(), // Valid date
  nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Valid date
  price: tier.price,
  currency: tier.currency || 'usd',
  autoRenew: true,
});
    
    await newSubscription.save();

    let creatorAccountId = creator.connectedID;
    let useDirectConnect = false;

    // CONNECT SAFETY CHECK
    if (creatorAccountId) {
      try {
        const account = await stripe.accounts.retrieve(creatorAccountId);
        const hasTransfers = account.capabilities?.transfers === "active";
        const isFullyOnboarded = account.charges_enabled && account.payouts_enabled;
        useDirectConnect = hasTransfers && isFullyOnboarded;
      } catch (err) {
        console.log("Stripe account fetch failed:", err.message);
        useDirectConnect = false;
      }
    }

    const tierPrice = Math.round(tier.price * 100);
    const platformFeeAmount = Math.round(tierPrice * (parseFloat(envConfig.PLATFORM_FEE) / 100));
    const sellerAmount = tierPrice - platformFeeAmount;

    // CREATE CHECKOUT SESSION
    const sessionParams = {
      mode: "subscription",
      payment_method_types: ["card"],
      success_url: `${envConfig.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${envConfig.FRONTEND_URL}/payment/cancel`,
      customer_email: subscriber.email,
      client_reference_id: subscriber._id.toString(),
      line_items: [
        {
          price: tier.stripePriceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        metadata: {
          subscriber_id: subscriber._id.toString(),
          creator_id: creator._id.toString(),
          tier_id: tier._id.toString(),
          tier_name: tier.tierName,
          db_subscription_id: newSubscription._id.toString(),
        },
      },
      metadata: {
        subscriber_id: subscriber._id.toString(),
        creator_id: creator._id.toString(),
        tier_id: tier._id.toString(),
        db_subscription_id: newSubscription._id.toString(),
        payment_mode: useDirectConnect ? "direct_connect" : "platform_hold",
        seller_amount: (sellerAmount / 100).toString(),
        platform_fee: (platformFeeAmount / 100).toString(),
      },
    };

    // CONNECT SPLIT (ONLY IF FULLY ONBOARDED)
    if (useDirectConnect) {
      sessionParams.subscription_data = {
        ...sessionParams.subscription_data,
        transfer_data: {
          destination: creatorAccountId,
        },
        application_fee_percent: envConfig.PLATFORM_FEE,
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    const payment = new Payment({
      tierId: tier._id,
      subscriptionId: newSubscription._id,
      sessionId: session.id,
      status: "pending",
    });    

    await payment.save();

    return res.status(200).json({
      success: true,
      data: {
        checkoutUrl: session.url,
        sessionId: session.id,
        subscriptionId: newSubscription._id,
        connectEnabled: useDirectConnect,
      },
    });
  } catch (error) {
    console.log("Error in createSubscriberCheckout:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal Server Error",
    });
  }
}

export async function cancelSubscription(req, res) {
  try {
    const { subscriptionId } = req.params;
    
    console.log("Cancel subscription request for ID:", subscriptionId);
    
    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      subscriberId: req.user.userId
    }).populate('tierId');
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: "Subscription not found"
      });
    }
    
    if (subscription.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: "Subscription is already cancelled"
      });
    }
    
    // If no Stripe ID, just cancel in database
    if (!subscription.stripeSubscriptionId) {
      console.log("No Stripe ID found, cancelling in database only");
      subscription.status = 'cancelled';
      subscription.autoRenew = false;
      subscription.cancelDate = new Date();
      await subscription.save();
      
      return res.status(200).json({
        success: true,
        message: "Subscription cancelled successfully",
        data: {
          subscriptionId: subscription._id,
          status: subscription.status,
          cancelDate: subscription.cancelDate
        }
      });
    }
    
    console.log("Cancelling Stripe subscription:", subscription.stripeSubscriptionId);
    
    try {
      // Cancel at period end (no refund)
      const updatedStripeSub = await stripe.subscriptions.update(
        subscription.stripeSubscriptionId,
        { cancel_at_period_end: true }
      );
      
      console.log("Stripe subscription updated:", updatedStripeSub.id);
      
      // Update subscription in database
      subscription.cancelDate = new Date();
      subscription.autoRenew = false;
      
      if (updatedStripeSub.current_period_end) {
        subscription.nextBillingDate = new Date(updatedStripeSub.current_period_end * 1000);
      }
      
      await subscription.save();
      
      return res.status(200).json({
        success: true,
        message: "Subscription will be cancelled at the end of billing period",
        data: {
          subscriptionId: subscription._id,
          status: subscription.status,
          cancelDate: subscription.cancelDate,
          expiresAt: subscription.nextBillingDate
        }
      });
      
    } catch (stripeError) {
      console.error("Stripe error:", stripeError.message);
      
      if (stripeError.code === 'resource_missing') {
        // Stripe subscription doesn't exist, just update database
        subscription.status = 'cancelled';
        subscription.autoRenew = false;
        subscription.cancelDate = new Date();
        await subscription.save();
        
        return res.status(200).json({
          success: true,
          message: "Subscription cancelled in database (Stripe sync issue resolved)",
          data: {
            subscriptionId: subscription._id,
            status: subscription.status,
            cancelDate: subscription.cancelDate
          }
        });
      }
      
      throw stripeError;
    }
    
  } catch (error) {
    console.error("Error in cancelSubscription: ", error);
    
    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({
        success: false,
        error: "Invalid Stripe subscription ID. Please contact support."
      });
    }
    
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

export async function reactivateSubscription(req, res) {
  try {
    const { subscriptionId } = req.params;
    
    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      subscriberId: req.user.userId
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: "Subscription not found"
      });
    }

    if (!subscription.stripeSubscriptionId) {
      return res.status(400).json({
        success: false,
        error: "No Stripe subscription ID found. Cannot reactivate."
      });
    }

    // Reactivate in Stripe
    const updatedStripeSub = await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      { cancel_at_period_end: false }
    );

    // Update your database
    subscription.cancelDate = null;
    subscription.autoRenew = true;
    subscription.status = mapStripeStatus(updatedStripeSub.status);
    
    if (updatedStripeSub.current_period_end) {
      subscription.nextBillingDate = new Date(updatedStripeSub.current_period_end * 1000);
    }
    
    await subscription.save();

    return res.status(200).json({
      success: true,
      message: "Subscription reactivated successfully",
      data: {
        subscriptionId: subscription._id,
        status: subscription.status,
        nextBillingDate: subscription.nextBillingDate
      }
    });

  } catch (error) {
    console.log("Error in reactivateSubscription: ", error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

export async function getMySubscriptions(req, res) {
  try {
    const subscriptions = await Subscription.find({
      subscriberId: req.user.userId
    })
    .populate('tierId')
    .populate('creatorId', 'fullName email')
    .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        subscriptions: subscriptions.map(sub => ({
          _id: sub._id,
          status: sub.status,
          tierId: sub.tierId,
          tierType: sub.tierType,
          creatorId: sub.creatorId,
          stripeSubscriptionId: sub.stripeSubscriptionId,
          startDate: sub.startDate,
          nextBillingDate: sub.nextBillingDate,
          cancelDate: sub.cancelDate,
          autoRenew: sub.autoRenew,
          createdAt: sub.createdAt,
          updatedAt: sub.updatedAt
        }))
      }
    });

  } catch (error) {
    console.log("Error in getMySubscriptions: ", error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Helper function to map Stripe status to your status
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

// New endpoint to get subscription by Stripe ID (for webhook sync verification)
export async function getSubscriptionByStripeId(req, res) {
  try {
    const { stripeSubscriptionId } = req.params;
    
    const subscription = await Subscription.findOne({ stripeSubscriptionId })
      .populate('tierId')
      .populate('creatorId', 'fullName email')
      .populate('subscriberId', 'fullName email');
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: "Subscription not found"
      });
    }
    
    return res.status(200).json({
      success: true,
      data: subscription
    });
    
  } catch (error) {
    console.log("Error in getSubscriptionByStripeId: ", error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// New endpoint to manually sync subscription from Stripe
export async function syncSubscriptionFromStripe(req, res) {
  try {
    const { subscriptionId } = req.params;
    
    const subscription = await Subscription.findById(subscriptionId);
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: "Subscription not found"
      });
    }
    
    if (!subscription.stripeSubscriptionId) {
      return res.status(400).json({
        success: false,
        error: "No Stripe subscription ID found"
      });
    }
    
    // Fetch latest data from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId
    );
    
    // Update subscription with latest Stripe data
    subscription.status = mapStripeStatus(stripeSubscription.status);
    subscription.nextBillingDate = new Date(stripeSubscription.current_period_end * 1000);
    subscription.autoRenew = !stripeSubscription.cancel_at_period_end;
    
    if (stripeSubscription.cancel_at_period_end && stripeSubscription.cancel_at) {
      subscription.cancelDate = new Date(stripeSubscription.cancel_at * 1000);
    } else if (!stripeSubscription.cancel_at_period_end) {
      subscription.cancelDate = null;
    }
    
    await subscription.save();
    
    return res.status(200).json({
      success: true,
      message: "Subscription synced successfully",
      data: subscription
    });
    
  } catch (error) {
    console.log("Error in syncSubscriptionFromStripe: ", error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}


// Add to stripe.controller.js
export async function debugSubscriptionStatus(req, res) {
  try {
    const { subscriptionId } = req.params;
    
    const subscription = await Subscription.findById(subscriptionId)
      .populate('tierId')
      .populate('creatorId', 'fullName email');
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: "Subscription not found"
      });
    }
    
    console.log("=== DEBUG SUBSCRIPTION ===");
    console.log("ID:", subscription._id);
    console.log("Status:", subscription.status);
    console.log("Stripe ID:", subscription.stripeSubscriptionId);
    console.log("Start Date:", subscription.startDate);
    console.log("Next Billing Date:", subscription.nextBillingDate);
    console.log("Auto Renew:", subscription.autoRenew);
    console.log("Created At:", subscription.createdAt);
    console.log("=========================");
    
    return res.status(200).json({
      success: true,
      data: {
        _id: subscription._id,
        status: subscription.status,
        stripeSubscriptionId: subscription.stripeSubscriptionId,
        startDate: subscription.startDate,
        nextBillingDate: subscription.nextBillingDate,
        autoRenew: subscription.autoRenew,
        tierName: subscription.tierId?.tierName,
        creatorName: subscription.creatorId?.fullName
      }
    });
    
  } catch (error) {
    console.error("Debug error:", error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}