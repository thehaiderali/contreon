import stripe from "../config/stripe.js";
import User from "../models/user.model.js"
import Subscription from "../models/subscription.model.js"
import { envConfig } from "../config/env.js";
import SubscriptionTier from "../models/subscriptionTier.model.js";
import Payment from "../models/payment.model.js";

export async function createConnectedAccount(req,res){

    try {
    const creator=await User.findById(req.user.userId);
    if(creator.connectedID){
        return res.status(400).json({
            success:false,
            error:"Stripe ConnectedID for this Creator Already Exists"
        })
    }
    const account=await stripe.accounts.create({
        email:creator.email,
        type:"express",
        country:"US",
        business_profile: { name:creator.fullName, url: 'https://yoursite.com' },
        capabilities:{
               card_payments:{
                requested:true,
               },
               transfers:{
                requested:true
               } 
        },
        settings: {
        payouts: {
         schedule: {
        interval: "manual", // Key: Manual payouts until full onboarding
      },
    },
  },
    })

    const updated=await User.findByIdAndUpdate(creator._id,{
        connectedID:account.id
    })
    return res.status(200).json({
        success:true,
        data:{
            user:updated
        }
    })
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
    
}


export async function createStripeOnboarding(req,res){
  const creator=await User.findById(req.user.userId);
  const connectedID=creator.connectedID;
  try {
    const accountLink = await stripe.v2.core.accountLinks.create({
      account: connectedID,
      use_case: {
        type: 'account_onboarding',
        account_onboarding: {
          configurations: ['recipient'],
          refresh_url: 'http://localhost:5173',
          return_url: `http://localhost:5173/creator/home=${connectedID}`,
        },
      },
    });
    res.json({ url: accountLink.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
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


    const newSubscription = new Subscription({
          subscriberId:subscriber._id,
          tierId:tierId,
          creatorId: tier.creatorId,
          tierType: tier.tierName,
          status: "incomplete",
          startDate: new Date(),
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });
    
     await newSubscription.save();

   
    let creatorAccountId = creator.connectedID;
    let useDirectConnect = false;

    // ─────────────────────────────────────────────
    // CONNECT SAFETY CHECK (mapped from GitHub logic)
    // ─────────────────────────────────────────────
    if (creatorAccountId) {
      try {
        const account = await stripe.accounts.retrieve(creatorAccountId);

        const hasTransfers =
          account.capabilities?.transfers === "active";

        const isFullyOnboarded =
          account.charges_enabled && account.payouts_enabled;

        useDirectConnect = hasTransfers && isFullyOnboarded;
      } catch (err) {
        console.log("Stripe account fetch failed:", err.message);
        useDirectConnect = false;
      }
    }

    // ─────────────────────────────────────────────
    // CREATE CHECKOUT SESSION
    // ─────────────────────────────────────────────
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
        },
      },

      metadata: {
        subscriber_id: subscriber._id.toString(),
        creator_id: creator._id.toString(),
        tier_id: tier._id.toString(),
        payment_mode: useDirectConnect ? "direct_connect" : "platform_hold",
      },
    };

    // ─────────────────────────────────────────────
    // CONNECT SPLIT (ONLY IF FULLY ONBOARDED)
    // ─────────────────────────────────────────────
    if (useDirectConnect) {
      sessionParams.subscription_data = {
        ...sessionParams.subscription_data,
        transfer_data: {
          destination: creatorAccountId,
        },
        application_fee_percent: envConfig.PLATFORM_FEE, // platform fee
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

     const payment= new Payment({
        tierId:tier._id,
        subscriptionId:newSubscription._id,
        sessionId:session.id,
        status:"pending",
    })    

    await payment.save()

    return res.status(200).json({
      success: true,
      data: {
        checkoutUrl: session.url,
        sessionId: session.id,
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

    // Cancel at period end (no refund)
    const updatedStripeSub = await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      {
        cancel_at_period_end: true
      }
    );

    subscription.cancelDate = new Date();
    await subscription.save();

    return res.status(200).json({
      success: true,
      message: "Subscription will be cancelled at the end of billing period",
      data: {
        subscriptionId: subscription._id,
        expiresAt: subscription.currentPeriodEnd
      }
    });

  } catch (error) {
    console.log("Error in cancelSubscription: ", error);
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

    // Reactivate in Stripe
    const updatedStripeSub = await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      {
        cancel_at_period_end: false
      }
    );

    // Update your database
    subscription.cancelDate = null;
    await subscription.save();

    return res.status(200).json({
      success: true,
      message: "Subscription reactivated successfully",
      data: {
        subscriptionId: subscription._id,
        nextBillingDate: subscription.currentPeriodEnd
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
    .populate('creatorId', 'name email')
    .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        subscriptions: subscriptions.map(sub => ({
          id: sub._id,
          status: sub.status,
          tierName: sub.tierId?.tierName,
          creatorName: sub.creatorId?.name,
          price: sub.price,
          currency: sub.currency,
          currentPeriodEnd: sub.currentPeriodEnd,
          cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
          createdAt: sub.createdAt
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