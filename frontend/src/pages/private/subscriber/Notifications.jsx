import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Bell, 
  CheckCheck,
  Loader2,
  MailOpen,
  Trash2,
  MoreVertical,
  AlertCircle,
  RefreshCw,
  FileText,
  Video,
  Radio,
  Megaphone,
  Gift,
  Crown,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

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
    case 'new_post':
      return FileText;
    case 'new_video':
      return Video;
    case 'live_stream':
      return Radio;
    case 'announcement':
      return Megaphone;
    case 'special_offer':
      return Gift;
    case 'membership':
      return Crown;
    case 'system':
      return Settings;
    default:
      return Bell;
  }
};

// Helper function to get notification color
const getNotificationColor = (type) => {
  switch (type) {
    case 'new_post':
      return 'text-blue-600';
    case 'new_video':
      return 'text-red-600';
    case 'live_stream':
      return 'text-green-600';
    case 'announcement':
      return 'text-purple-600';
    case 'special_offer':
      return 'text-yellow-600';
    case 'membership':
      return 'text-pink-600';
    case 'system':
      return 'text-gray-600';
    default:
      return 'text-muted-foreground';
  }
};

// API service
const notificationAPI = {
  getNotifications: async (params) => {
    const response = await api.get('/notifications/me', { params });
    return response.data;
  },
  
  markAsRead: async (notificationId) => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },
  
  markAllAsRead: async () => {
    const response = await api.put('/notifications/me/read-all');
    return response.data;
  },
  
  deleteNotification: async (notificationId) => {
    const response = await api.delete(`/notifications/me/${notificationId}`);
    return response.data;
  }
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
    hasMore: false
  });
  const [filters, setFilters] = useState({
    unreadOnly: false,
    type: ''
  });

  // Core fetch function — accepts explicit filters to avoid stale closure issues
  const fetchNotificationsWithFilters = useCallback(async (activeFilters, resetPage = true) => {
    try {
      setLoading(true);
      setError(null);
      
      const page = resetPage ? 1 : pagination.page;
      
      const response = await notificationAPI.getNotifications({
        page,
        limit: pagination.limit,
        unreadOnly: activeFilters.unreadOnly,
        type: activeFilters.type
      });
      
      if (response.success) {
        setNotifications(prev => 
          resetPage ? response.data : [...prev, ...response.data]
        );
        setPagination(prev => ({
          ...prev,
          page,
          total: response.pagination.total,
          pages: response.pagination.pages,
          hasMore: response.pagination.hasMore
        }));
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.response?.data?.message || 'Failed to load notifications');
      toast.error('Failed to load notifications', {
        description: err.response?.data?.message || 'Please try again later',
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  // Convenience wrapper using current filters state
  const fetchNotifications = useCallback((resetPage = true) => {
    fetchNotificationsWithFilters(filters, resetPage);
  }, [fetchNotificationsWithFilters, filters]);

  // Load more notifications
  const loadMore = async () => {
    if (!pagination.hasMore || loading) return;
    // Increment page first, then fetch — avoid race with async setPagination
    const nextPage = pagination.page + 1;
    setPagination(prev => ({ ...prev, page: nextPage }));
    try {
      setLoading(true);
      setError(null);
      const response = await notificationAPI.getNotifications({
        page: nextPage,
        limit: pagination.limit,
        unreadOnly: filters.unreadOnly,
        type: filters.type
      });
      if (response.success) {
        setNotifications(prev => [...prev, ...response.data]);
        setPagination(prev => ({
          ...prev,
          page: nextPage,
          total: response.pagination.total,
          pages: response.pagination.pages,
          hasMore: response.pagination.hasMore
        }));
      }
    } catch (err) {
      console.error('Error loading more notifications:', err);
      toast.error('Failed to load more notifications');
    } finally {
      setLoading(false);
    }
  };

  // Mark a single notification as read
  const markAsRead = async (notificationId) => {
    try {
      setActionInProgress(true);
      setSelectedNotificationId(notificationId);
      
      const response = await notificationAPI.markAsRead(notificationId);
      
      if (response.success) {
        setNotifications(prev =>
          prev.map(notif =>
            notif._id === notificationId
              ? { ...notif, read: true }
              : notif
          )
        );
        
        toast.success('Marked as read');
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
      toast.error('Failed to mark as read');
    } finally {
      setActionInProgress(false);
      setSelectedNotificationId(null);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    const toastId = toast.loading('Marking all notifications as read...');
    
    try {
      setActionInProgress(true);
      
      const response = await notificationAPI.markAllAsRead();
      
      if (response.success) {
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, read: true }))
        );
        
        toast.success('All marked as read', { id: toastId });
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
      toast.error('Failed to mark all as read', { id: toastId });
    } finally {
      setActionInProgress(false);
    }
  };

  // Delete a notification
  const deleteNotification = async (notificationId) => {
    const toastId = toast.loading('Deleting notification...');
    
    try {
      setActionInProgress(true);
      setSelectedNotificationId(notificationId);
      
      const response = await notificationAPI.deleteNotification(notificationId);
      
      if (response.success) {
        setNotifications(prev =>
          prev.filter(notif => notif._id !== notificationId)
        );
        
        toast.success('Deleted successfully', { id: toastId });
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
      toast.error('Failed to delete', { id: toastId });
    } finally {
      setActionInProgress(false);
      setSelectedNotificationId(null);
    }
  };

  // Apply filters
  const applyFilters = (newFilters) => {
    // Merge new filters with current ones synchronously before fetching,
    // since setFilters is async and fetchNotifications would read stale state.
    const mergedFilters = { ...filters, ...newFilters };
    setFilters(mergedFilters);
    fetchNotificationsWithFilters(mergedFilters, true);
  };

  // Refresh notifications
  const refreshNotifications = () => {
    fetchNotifications(true);
    toast.success('Notifications refreshed');
  };

  useEffect(() => {
    fetchNotifications(true);
  }, [filters]);

  const unreadCount = notifications.filter(notif => !notif.read).length;

  // Loading state
  if (loading && notifications.length === 0) {
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

  // Error state
  if (error && notifications.length === 0) {
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
              <AlertCircle className="h-12 w-12 text-destructive" />
              <p className="text-destructive font-medium">{error}</p>
              <Button onClick={refreshNotifications} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
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
          
          <Button onClick={refreshNotifications} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
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
        
        <div className="flex gap-2">
          <Button
            onClick={refreshNotifications}
            variant="outline"
            size="sm"
            disabled={actionInProgress}
          >
            <RefreshCw className={`h-4 w-4 ${actionInProgress ? 'animate-spin' : ''}`} />
          </Button>
          
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              disabled={actionInProgress}
              variant="outline"
            >
              {actionInProgress && !selectedNotificationId ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCheck className="mr-2 h-4 w-4" />
              )}
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <Button
          variant={filters.unreadOnly ? "default" : "outline"}
          size="sm"
          onClick={() => applyFilters({ unreadOnly: !filters.unreadOnly })}
        >
          {filters.unreadOnly ? "All" : "Unread Only"}
        </Button>
        <Button
          variant={filters.type === "new_post" ? "default" : "outline"}
          size="sm"
          onClick={() => applyFilters({ type: filters.type === "new_post" ? "" : "new_post" })}
        >
          Posts
        </Button>
        <Button
          variant={filters.type === "new_video" ? "default" : "outline"}
          size="sm"
          onClick={() => applyFilters({ type: filters.type === "new_video" ? "" : "new_video" })}
        >
          Videos
        </Button>
        <Button
          variant={filters.type === "live_stream" ? "default" : "outline"}
          size="sm"
          onClick={() => applyFilters({ type: filters.type === "live_stream" ? "" : "live_stream" })}
        >
          Live
        </Button>
        <Button
          variant={filters.type === "announcement" ? "default" : "outline"}
          size="sm"
          onClick={() => applyFilters({ type: filters.type === "announcement" ? "" : "announcement" })}
        >
          Announcements
        </Button>
        <Button
          variant={filters.type === "special_offer" ? "default" : "outline"}
          size="sm"
          onClick={() => applyFilters({ type: filters.type === "special_offer" ? "" : "special_offer" })}
        >
          Offers
        </Button>
      </div>

      {/* Notifications List */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {notifications.map((notification) => {
              const IconComponent = getNotificationIcon(notification.type);
              const iconColor = getNotificationColor(notification.type);
              const isActionInProgress = actionInProgress && selectedNotificationId === notification._id;
              
              return (
                <div
                  key={notification._id}
                  className={`p-4 transition-colors hover:bg-muted/30 ${
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
                        <div className="flex-1">
                          <div className="flex items-center flex-wrap gap-2">
                            <h3 className="font-semibold text-base">
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <Badge variant="default" className="text-xs">
                                New
                              </Badge>
                            )}
                          </div>
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
                              disabled={isActionInProgress}
                            >
                              {isActionInProgress ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MailOpen className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost" disabled={isActionInProgress}>
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
          
          {/* Load More */}
          {pagination.hasMore && (
            <div className="p-4 text-center border-t">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;