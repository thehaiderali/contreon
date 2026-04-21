import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Bell, 
  MessageCircle, 
  Heart, 
  UserPlus, 
  Settings, 
  Crown,
  CheckCheck,
  Loader2,
  MailOpen,
  Mail,
  Trash2,
  MoreVertical
} from 'lucide-react';

// Hardcoded notifications data
const hardcodedNotifications = [
  {
    _id: 'notif_1',
    userId: 'user_1',
    type: 'message',
    title: 'New Message from Tech Guru',
    message: 'Thank you for subscribing! Check out your exclusive content.',
    read: false,
    metadata: { senderId: 'creator_1', senderName: 'Tech Guru' },
    createdAt: '2024-01-20T10:30:00.000Z',
  },
  {
    _id: 'notif_2',
    userId: 'user_1',
    type: 'like',
    title: 'Someone liked your comment',
    message: 'Fitness Coach liked your comment on their latest post.',
    read: false,
    metadata: { postId: 'post_123', likerName: 'Fitness Coach' },
    createdAt: '2024-01-19T15:45:00.000Z',
  },
  {
    _id: 'notif_3',
    userId: 'user_1',
    type: 'follow',
    title: 'New Follower',
    message: 'Music Academy started following you.',
    read: true,
    metadata: { followerId: 'creator_3', followerName: 'Music Academy' },
    createdAt: '2024-01-18T09:20:00.000Z',
  },
  {
    _id: 'notif_4',
    userId: 'user_1',
    type: 'system',
    title: 'Payment Successful',
    message: 'Your payment for Pro Plan has been processed successfully.',
    read: true,
    metadata: { subscriptionId: 'sub_1', amount: 29.99 },
    createdAt: '2024-01-15T14:15:00.000Z',
  },
  {
    _id: 'notif_5',
    userId: 'user_1',
    type: 'membership',
    title: 'Membership Renewal',
    message: 'Your Elite Membership will renew in 3 days.',
    read: false,
    metadata: { tierName: 'Elite Membership', daysLeft: 3 },
    createdAt: '2024-01-19T08:00:00.000Z',
  },
  {
    _id: 'notif_6',
    userId: 'user_1',
    type: 'message',
    title: 'Special Offer',
    message: 'Get 20% off on yearly subscription! Limited time offer.',
    read: false,
    metadata: { discount: '20%', validUntil: '2024-02-01' },
    createdAt: '2024-01-18T18:30:00.000Z',
  },
];

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  } else if (diffInHours < 48) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
};

// Helper function to get notification icon
const getNotificationIcon = (type) => {
  switch (type) {
    case 'message':
      return MessageCircle;
    case 'like':
      return Heart;
    case 'follow':
      return UserPlus;
    case 'system':
      return Settings;
    case 'membership':
      return Crown;
    default:
      return Bell;
  }
};

// Helper function to get notification color
const getNotificationColor = (type) => {
  switch (type) {
    case 'message':
      return 'text-blue-600';
    case 'like':
      return 'text-red-600';
    case 'follow':
      return 'text-green-600';
    case 'system':
      return 'text-purple-600';
    case 'membership':
      return 'text-yellow-600';
    default:
      return 'text-gray-600';
  }
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAsRead, setMarkingAsRead] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState(null);

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Simulate API call to fetch notifications
  const fetchNotifications = async () => {
    setLoading(true);
    
    // TODO: Replace with actual API call
    // const response = await fetch('/api/notifications');
    // const data = await response.json();
    
    // Simulate API call with 2-3 second delay
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    setNotifications(hardcodedNotifications);
    setLoading(false);
  };

  // Mark a single notification as read
  const markAsRead = async (notificationId) => {
    setMarkingAsRead(true);
    setSelectedNotificationId(notificationId);
    
    // TODO: Replace with actual API call
    // const response = await fetch(`/api/notifications/${notificationId}/read`, {
    //   method: 'PATCH',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ read: true }),
    // });
    
    // Simulate API call with 2 second delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update local state
    setNotifications(prev =>
      prev.map(notif =>
        notif._id === notificationId
          ? { ...notif, read: true }
          : notif
      )
    );
    
    setMarkingAsRead(false);
    setSelectedNotificationId(null);
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    setMarkingAsRead(true);
    
    // TODO: Replace with actual API call
    // const response = await fetch('/api/notifications/mark-all-read', {
    //   method: 'PATCH',
    //   headers: { 'Content-Type': 'application/json' },
    // });
    
    // Simulate API call with 2 second delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update local state
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
    
    setMarkingAsRead(false);
  };

  // Delete a notification
  const deleteNotification = async (notificationId) => {
    setMarkingAsRead(true);
    setSelectedNotificationId(notificationId);
    
    // TODO: Replace with actual API call
    // const response = await fetch(`/api/notifications/${notificationId}`, {
    //   method: 'DELETE',
    // });
    
    // Simulate API call with 2 second delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update local state
    setNotifications(prev =>
      prev.filter(notif => notif._id !== notificationId)
    );
    
    setMarkingAsRead(false);
    setSelectedNotificationId(null);
  };

  // Get unread count
  const unreadCount = notifications.filter(notif => !notif.read).length;

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground mt-2">Stay updated with your latest activities</p>
          </div>
        </div>
        
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Loading your notifications...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty state
  if (notifications.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground mt-2">Stay updated with your latest activities</p>
          </div>
        </div>
        
        <Card className="text-center border-dashed">
          <CardContent className="py-12">
            <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No notifications yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              When you receive notifications, they'll appear here
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-2">
            You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        
        {unreadCount > 0 && (
          <Button
            onClick={markAllAsRead}
            disabled={markingAsRead}
            variant="outline"
          >
            {markingAsRead && !selectedNotificationId ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCheck className="mr-2 h-4 w-4" />
            )}
            Mark all as read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {notifications.map((notification) => {
              const IconComponent = getNotificationIcon(notification.type);
              const iconColor = getNotificationColor(notification.type);
              const isMarkingThisOne = markingAsRead && selectedNotificationId === notification._id;
              
              return (
                <div
                  key={notification._id}
                  className={`p-4 transition-colors ${
                    !notification.read ? 'bg-muted/50' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`mt-1 ${iconColor}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-base">
                            {notification.title}
                            {!notification.read && (
                              <Badge variant="default" className="ml-2 text-xs">
                                New
                              </Badge>
                            )}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDate(notification.createdAt)}
                          </p>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          {!notification.read && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => markAsRead(notification._id)}
                              disabled={isMarkingThisOne}
                            >
                              {isMarkingThisOne ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MailOpen className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {!notification.read && (
                                <DropdownMenuItem onClick={() => markAsRead(notification._id)}>
                                  <MailOpen className="mr-2 h-4 w-4" />
                                  Mark as read
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={() => deleteNotification(notification._id)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;