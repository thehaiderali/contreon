// controllers/payment.controller.js
import Payment from "../models/payment.model.js";
import Subscription from "../models/subscription.model.js";
import SubscriptionTier from "../models/subscriptionTier.model.js";
import User from "../models/user.model.js";

export async function setPaymentSuccess(req, res) {
    try {
        const { sessionId } = req.body;
        const subscriber=await User.findById(req.user.userId);

        if (!sessionId) {
            return res.status(404).json({
                success: false,
                error: "Session Id not found"
            });
        }

        const existingPayment = await Payment.findOne({ sessionId }).populate("subscriptionId");

        if (!existingPayment) {
            return res.status(404).json({
                success: false,
                error: "Payment with Following Session Id not Found"
            });
        }

        const updatedPayment = await Payment.findByIdAndUpdate(existingPayment._id, {
            status: "success"
        }, { new: true });

        const updateSub = await Subscription.findByIdAndUpdate(updatedPayment.subscriptionId, {
            status: "active"
        }, { new: true });

        const tier = await SubscriptionTier.findById(updatedPayment.tierId);
        const creator = await User.findById(tier.creatorId);
        
        // Update creator's deferred onboarding
        creator.deferredOnboarding.pendingEarnings += tier.price;
        creator.deferredOnboarding.earningsCount += 1;
        creator.deferredOnboarding.lastEarningDate = new Date();
        await creator.save();

        return res.status(200).json({
            success: true,
            message: "Payment Successful. Membership Created"
        });

    } catch (error) {
        console.log("Error in Setting Payment Success: ", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
}

export async function setPaymentCancel(req, res) {
    try {
        const { sessionId } = req.body;
        const subscriberId = req.user.userId;
       const subscriber=await User.findById(subscriberId);
        if (!sessionId) {
            return res.status(400).json({
                success: false,
                error: "Session Id is required"
            });
        }

        // Find the payment session
        const existingPayment = await Payment.findOne({ 
            sessionId,
            subscriberId 
        });

        if (!existingPayment) {
            return res.status(404).json({
                success: false,
                error: "Payment session not found"
            });
        }
        if(existingPayment.subscriptionId.subscriberId!==subscriber._id){
         return res.status(403).json({
            success:false,
            error:"Unauthorized Access to Data"
         })
        }


        // Check if payment was already successful
        if (existingPayment.status === "success") {
            return res.status(400).json({
                success: false,
                error: "Payment already completed successfully"
            });
        }

        // Update payment status to cancelled
        const cancelledPayment = await Payment.findByIdAndUpdate(
            existingPayment._id,
            {
                status: "cancelled",
                cancelledAt: new Date(),
                cancellationReason: req.body.reason || "User cancelled during checkout"
            },
            { new: true }
        );

        // Optional: Delete or mark subscription as cancelled if it was created
        if (cancelledPayment.subscriptionId) {
            await Subscription.findByIdAndUpdate(
                cancelledPayment.subscriptionId,
                {
                    status: "cancelled",
                    cancelledAt: new Date(),
                    cancellationReason: "Payment cancelled by user"
                },
                { new: true }
            );
        }

        // Optional: Clean up any pending data
        // Release any holds or temporary reservations

        return res.status(200).json({
            success: true,
            message: "Payment cancelled successfully",
            data: {
                sessionId: cancelledPayment.sessionId,
                status: cancelledPayment.status,
                cancelledAt: cancelledPayment.cancelledAt
            }
        });

    } catch (error) {
        console.log("Error in Setting Payment Cancel: ", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
}

// Optional: Get payment status
export async function getPaymentStatus(req, res) {
    try {
        const { sessionId } = req.params;
        
        const payment = await Payment.findOne({ sessionId })
            .populate('subscriptionId')
            .populate('tierId');

        if (!payment) {
            return res.status(404).json({
                success: false,
                error: "Payment not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                status: payment.status,
                amount: payment.amount,
                tier: payment.tierId,
                subscription: payment.subscriptionId,
                createdAt: payment.createdAt
            }
        });

    } catch (error) {
        console.log("Error in Get Payment Status: ", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
}