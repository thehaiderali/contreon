import stripe from "../config/stripe.js";
import Subscription from "../models/subscription.model.js";
import SubscriptionTier from "../models/subscriptionTier.model.js";
import User from "../models/user.model.js";


export async function createSubscription(req, res) {
  try {
    const { membershipId } = req.body;
    const subscriberId = req.user.userId;

    const tier = await SubscriptionTier.findById(membershipId);
    if (!tier) {
      return res.status(404).json({ success: false, error: "Tier not found" });
    }

    const existingSub = await Subscription.findOne({
      subscriberId,
      creatorId: tier.creatorId,
      status: "active"
    });

    if (existingSub) {
      return res.status(400).json({ success: false, error: "Already subscribed to this creator" });
    }

    const creator = await User.findById(tier.creatorId);
    
    // ✅ CHANGE: Allow subscriptions even if not fully onboarded
    if (!creator || !creator.connectedID) {
      return res.status(400).json({ 
        success: false, 
        error: "Creator not set up for payments" 
      });
    }

        try {
      const account = await stripe.accounts.retrieve(creator.connectedID);
      // Account exists, continue
    } catch (err) {
      return res.status(400).json({ 
        success: false, 
        error: "Creator's Stripe account is invalid" 
      });
    }

    // Check if Stripe account exists but may not be fully verified
    // let stripeAccountExists = true;
    // try {
    //   await stripe.accounts.retrieve(creator.connectedID);
    // } catch (err) {
    //   stripeAccountExists = false;
    // }
    
    // if (!stripeAccountExists) {
    //   return res.status(400).json({ 
    //     success: false, 
    //     error: "Creator Stripe account not found" 
    //   });
    // }

    // Rest of the subscription creation code remains the same...
    // Stripe will still accept payments even if account isn't fully verified
    // Funds will accumulate but payouts will be blocked until verification
    
    const subscriber = await User.findById(subscriberId);
    let customer;

    // const existingCustomers = await stripe.customers.list(
    //   { email: subscriber.email, limit: 1 },
    //   { stripeAccount: creator.connectedID }
    // );

    // if (existingCustomers.data.length > 0) {
    //   customer = existingCustomers.data[0];
    // } else {
    //   customer = await stripe.customers.create(
    //     {
    //       email: subscriber.email,
    //       name: subscriber.fullName,
    //       metadata: { subscriberId: subscriberId.toString() }
    //     },
    //     { stripeAccount: creator.connectedID }
    //   );
    // }


    const newSubscription = new Subscription({
      subscriberId,
      creatorId: tier.creatorId,
      tierType: tier.tierName,
      status: "incomplete",
      startDate: new Date(),
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    await newSubscription.save();

    return res.status(201).json({
      success: true,
      data: {
        subscription: newSubscription,
      }
    });

  } catch (error) {
    console.error("Error creating subscription:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getMySubscriptions(req, res) {
  try {
    const subscriptions = await Subscription.find({ subscriberId: req.user.userId })
      .populate("creatorId", "fullName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: { subscriptions }
    });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}
export async function getCreatorSubscribers(req, res) {
  try {
    const subscriptions = await Subscription.find({ creatorId: req.user.userId })
      .populate("subscriberId", "fullName email")
      .sort({ createdAt: -1 });

    const stats = {
      total: subscriptions.length,
      active: subscriptions.filter(s => s.status === "active").length,
      cancelled: subscriptions.filter(s => s.status === "cancelled").length,
      monthlyRecurring: subscriptions
        .filter(s => s.status === "active")
        .reduce((sum, s) => {
          return sum;
        }, 0)
    };

    return res.status(200).json({
      success: true,
      data: { subscriptions, stats }
    });
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}

export async function cancelSubscription(req, res) {
  try {
    const { subscriptionId } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    console.log("Cancelling subscription:", subscriptionId);

    if (!subscriptionId || subscriptionId === "null" || subscriptionId === "undefined") {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid subscription ID" 
      });
    }

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({ success: false, error: "Subscription not found" });
    }

    if (userRole === "subscriber" && subscription.subscriberId.toString() !== userId) {
      return res.status(403).json({ success: false, error: "Unauthorized" });
    }
    if (userRole === "creator" && subscription.creatorId.toString() !== userId) {
      return res.status(403).json({ success: false, error: "Unauthorized" });
    }


    subscription.status = "cancelled";
    subscription.cancelDate = new Date();
    subscription.autoRenew = false;
    await subscription.save();

    return res.status(200).json({
      success: true,
      message: "Subscription cancelled. Access will continue until period end."
    });

  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
export async function resumeSubscription(req, res) {
  try {
    const { subscriptionId } = req.params;

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({ success: false, error: "Subscription not found" });
    }

    if (subscription.subscriberId.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, error: "Unauthorized" });
    }

    const creator = await User.findById(subscription.creatorId);


    subscription.status = "active";
    subscription.cancelDate = null;
    subscription.autoRenew = true;
    await subscription.save();

    return res.status(200).json({
      success: true,
      message: "Subscription resumed"
    });

  } catch (error) {
    console.error("Error resuming subscription:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function checkSubscriptionStatus(req, res) {
  try {
    const { creatorId } = req.params;
    const userId = req.user.userId;

    const subscription = await Subscription.findOne({
      subscriberId: userId,
      creatorId: creatorId,
      status: "active"
    });

    return res.status(200).json({
      success: true,
      data: {
        isSubscribed: !!subscription,
        subscription: subscription || null
      }
    });
  } catch (error) {
    console.error("Error checking subscription:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}