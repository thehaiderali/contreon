// services/notificationService.js
import Notification from "../models/notification.model.js";
import Subscription from "../models/subscription.model.js";

export const sendNotificationToTier = async (creatorId, tierId, messageData) => {
  try {
    // Build query — if tierId is null, notify ALL active subscribers of this creator
    const query = {
      creatorId: creatorId,
      status: 'active'
    };
    if (tierId !== null && tierId !== undefined) {
      query.tierId = tierId;
    }

    const subscriptions = await Subscription.find(query);

    if (subscriptions.length === 0) {
      return {
        success: true,
        message: "No active subscribers",
        notificationsSent: 0
      };
    }

    // Create notifications
    const notifications = subscriptions.map(sub => ({
      userId: sub.subscriberId,
      creatorId: creatorId,
      type: messageData.type,
      title: messageData.title,
      message: messageData.message,
      actionData: messageData.actionData || {},
      metadata: messageData.metadata || {},
      priority: messageData.priority || 'medium',
      expiresAt: messageData.expiresAt || null
    }));

    const createdNotifications = await Notification.insertMany(notifications);
    console.log("Created Notifications : ",createdNotifications)
    return {
      success: true,
      notificationsSent: createdNotifications.length
    };

  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createMessageData = (type, data) => {
  const templates = {
    // Post notifications
    new_post: {
      type: 'new_post',
      title: 'New Post Published!',
      message: `New post: "${data.postTitle}" is now available`,
      actionData: { 
        postId: data.postId,
        postTitle: data.postTitle
      },
      priority: 'high'
    },
    
    // Video notifications
    new_video: {
      type: 'new_video',
      title: 'New Video Uploaded!',
      message: `Check out the new video: "${data.videoTitle}"`,
      actionData: { 
        videoId: data.videoId,
        videoTitle: data.videoTitle
      },
      priority: 'high'
    },
    
    // Live stream notifications
    live_stream: {
      type: 'live_stream',
      title: '🔴 Live Stream Started!',
      message: `Join the live stream: "${data.streamTitle}"`,
      actionData: { 
        streamId: data.streamId,
        streamTitle: data.streamTitle
      },
      priority: 'high'
    },
    
    // Announcement notifications
    announcement: {
      type: 'announcement',
      title: '📢 Announcement',
      message: data.announcement,
      actionData: data.actionData || {},
      priority: 'high'
    },
    
    // Special offer notifications
    special_offer: {
      type: 'special_offer',
      title: '🎉 Special Offer!',
      message: data.offerDescription,
      actionData: { 
        offerId: data.offerId
      },
      priority: 'high'
    },
    
    // Membership notifications
    membership: {
      type: 'membership',
      title: 'Membership Update',
      message: data.message,
      actionData: data.actionData || {},
      priority: 'medium'
    },
    
    // System notifications
    system: {
      type: 'system',
      title: data.title || 'System Update',
      message: data.message,
      actionData: data.actionData || {},
      priority: 'medium'
    }
  };

  // Return template if exists, otherwise create custom message data
  if (templates[type]) {
    return templates[type];
  }

  // Custom message data for undefined types
  return {
    type: type,
    title: data.title || 'Update',
    message: data.message || '',
    actionData: data.actionData || {},
    metadata: data.metadata || {},
    priority: data.priority || 'medium',
    expiresAt: data.expiresAt || null
  };
};