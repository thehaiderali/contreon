import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Calendar, CreditCard, RefreshCw, XCircle, AlertCircle, CheckCircle, Loader2, RotateCcw } from 'lucide-react';
import NoSubscriptions from './NoSubscriptions';
import useSubscriptionStore from '@/store/memberShipStore';
import { api } from '@/lib/api';

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// Helper function to get status badge variant
const getStatusBadge = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return { variant: 'default', icon: CheckCircle, label: 'Active' };
    case 'past_due':
      return { variant: 'destructive', icon: AlertCircle, label: 'Past Due' };
    case 'cancelled':
      return { variant: 'secondary', icon: XCircle, label: 'Cancelled' };
    case 'incomplete':
      return { variant: 'outline', icon: AlertCircle, label: 'Incomplete' };
    case 'incomplete_expired':
      return { variant: 'secondary', icon: XCircle, label: 'Expired' };
    default:
      return { variant: 'outline', icon: AlertCircle, label: status || 'Unknown' };
  }
};

// Helper function to get tier type display
const getTierTypeDisplay = (tierType, tierId) => {
  if (tierType) return tierType;
  if (tierId?.tierName) return tierId.tierName;
  return 'Subscription';
};

// Helper function to get price
const getPrice = (tierId) => {
  if (tierId?.price) return tierId.price;
  return 0;
};

// Helper function to get description
const getDescription = (tierId) => {
  if (tierId?.description) return tierId.description;
  return 'No description available';
};

// Helper function to get perks
const getPerks = (tierId) => {
  if (tierId?.perks && Array.isArray(tierId.perks)) {
    return tierId.perks.filter(perk => perk && perk !== 'No Perks');
  }
  return [];
};

const Memberships = () => {
  const { subscriptions, fetchMySubscriptions, updateSubscription, isLoading: storeLoading } = useSubscriptionStore();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [reactivateDialogOpen, setReactivateDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  console.log("Subscriptions : ", subscriptions);
  
  // Fetch subscriptions on component mount
  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setError(null);
      await fetchMySubscriptions();
    } catch (err) {
      console.error('Failed to load subscriptions:', err);
      setError('Failed to load your memberships. Please try again.');
    }
  };

  // Handle cancel subscription
  const handleCancelClick = (subscription) => {
    setSelectedSubscription(subscription);
    setCancelDialogOpen(true);
    setError(null);
  };

  const confirmCancel = async () => {
    if (!selectedSubscription) return;
    
    setIsCancelling(true);
    setError(null);
    
    try {
      const response = await api.post(`subscriptions/${selectedSubscription._id}/cancel`);
      
      if (response.data.success) {
        // Update local store
        updateSubscription(selectedSubscription._id, {
          status: 'cancelled',
          autoRenew: false,
          cancelDate: response.data.data?.cancelDate || new Date().toISOString()
        });
        
        setSuccessMessage('Membership cancelled successfully');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error(response.data.error || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      setError(error.response?.data?.error || error.message || 'Failed to cancel subscription. Please try again.');
    } finally {
      setIsCancelling(false);
      setCancelDialogOpen(false);
      setSelectedSubscription(null);
    }
  };

  // Handle reactivate subscription
  const handleReactivateClick = (subscription) => {
    setSelectedSubscription(subscription);
    setReactivateDialogOpen(true);
    setError(null);
  };

  const confirmReactivate = async () => {
    if (!selectedSubscription) return;
    
    setIsReactivating(true);
    setError(null);
    
    try {
      const response = await api.post(`subscriptions/${selectedSubscription._id}/reactivate`);
      
      if (response.data.success) {
        // Update local store
        updateSubscription(selectedSubscription._id, {
          status: 'active',
          autoRenew: true,
          cancelDate: null,
          nextBillingDate: response.data.data?.nextBillingDate
        });
        
        setSuccessMessage('Membership reactivated successfully! Your subscription will continue.');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error(response.data.error || 'Failed to reactivate subscription');
      }
    } catch (error) {
      console.error('Failed to reactivate subscription:', error);
      setError(error.response?.data?.error || error.message || 'Failed to reactivate subscription. Please try again.');
    } finally {
      setIsReactivating(false);
      setReactivateDialogOpen(false);
      setSelectedSubscription(null);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setError(null);
    await loadSubscriptions();
  };

  // Navigation handlers for NoSubscriptions component
  const handleBrowseClick = () => {
    // TODO: Navigate to browse memberships page
    console.log('Navigate to browse memberships');
  };

  const handleExploreClick = () => {
    // TODO: Navigate to explore creators page
    console.log('Navigate to explore creators');
  };

  // Loading state
  if (storeLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading your memberships...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state with retry
  if (error && (!subscriptions || subscriptions.length === 0)) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <Card className="text-center border-destructive/50">
          <CardContent className="py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <p className="text-destructive mb-2">{error}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show NoSubscriptions component if no subscriptions
  if (!subscriptions || subscriptions.length === 0) {
    return (
      <NoSubscriptions 
        onBrowseClick={handleBrowseClick}
        onExploreClick={handleExploreClick}
      />
    );
  }

  // Separate subscriptions by status
  const activeSubscriptions = subscriptions.filter(sub => 
    sub.status === 'active' || sub.status === 'past_due'
  );
  
  const cancelledSubscriptions = subscriptions.filter(sub => 
    sub.status === 'cancelled'
  );

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header with refresh button */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Memberships</h1>
          <p className="text-muted-foreground mt-2">
            Manage your active subscriptions and memberships
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={storeLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${storeLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
          <CheckCircle className="inline h-4 w-4 mr-2" />
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          <AlertCircle className="inline h-4 w-4 mr-2" />
          {error}
        </div>
      )}

      {/* Active Subscriptions Section */}
      {activeSubscriptions.length > 0 && (
        <>
          <h2 className="text-2xl font-semibold mb-4">Active Memberships</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
            {activeSubscriptions.map((subscription) => {
              const StatusBadge = getStatusBadge(subscription.status);
              const isActive = subscription.status === 'active';
              const isCancellable = isActive || subscription.status === 'past_due';
              const tierType = getTierTypeDisplay(subscription.tierType, subscription.tierId);
              const price = getPrice(subscription.tierId);
              const description = getDescription(subscription.tierId);
              const perks = getPerks(subscription.tierId);
              
              return (
                <Card key={subscription._id} className="flex flex-col transition-all hover:shadow-lg">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">
                          {subscription.tierId?.tierName || subscription.tierType || 'Membership'}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          by {subscription.creatorId?.fullName || subscription.creatorId?.name || 'Creator'}
                        </CardDescription>
                      </div>
                      <Badge variant={StatusBadge.variant}>
                        <StatusBadge.icon className="mr-1 h-3 w-3" />
                        {StatusBadge.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-1">
                    <div className="space-y-4">
                      <div>
                        <span className="text-2xl font-bold">
                          ${typeof price === 'number' ? price.toFixed(2) : price}
                        </span>
                        <span className="text-muted-foreground">
                          /{tierType.toLowerCase().includes('year') ? 'year' : 'month'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {description}
                      </p>
                      
                      {perks.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Includes:</p>
                          <ul className="space-y-1">
                            {perks.map((perk, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                                <CheckCircle className="h-3 w-3 text-green-600 shrink-0" />
                                <span className="line-clamp-1">{perk}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <Separator />
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Started:
                          </span>
                          <span>{formatDate(subscription.startDate)}</span>
                        </div>
                        {subscription.nextBillingDate && isActive && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <RefreshCw className="h-3 w-3" />
                              Next billing:
                            </span>
                            <span>{formatDate(subscription.nextBillingDate)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <RefreshCw className="h-3 w-3" />
                            Auto-renew:
                          </span>
                          <span>{subscription.autoRenew ? 'Enabled' : 'Disabled'}</span>
                        </div>
                        {subscription.stripeSubscriptionId && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground text-xs">
                              Subscription ID:
                            </span>
                            <span className="text-xs font-mono truncate ml-2">
                              {subscription.stripeSubscriptionId.slice(-8)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="border-t pt-4">
                    {isCancellable ? (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleCancelClick(subscription)}
                        disabled={isCancelling}
                      >
                        {isCancelling && selectedSubscription?._id === subscription._id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="mr-2 h-4 w-4" />
                        )}
                        Cancel Membership
                      </Button>
                    ) : subscription.status === 'incomplete' ? (
                      <Button variant="outline" className="w-full" disabled>
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Payment Incomplete
                      </Button>
                    ) : null}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Cancelled Subscriptions Section */}
      {cancelledSubscriptions.length > 0 && (
        <>
          <h2 className="text-2xl font-semibold mb-4">Cancelled Memberships</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cancelledSubscriptions.map((subscription) => {
              const StatusBadge = getStatusBadge(subscription.status);
              const tierType = getTierTypeDisplay(subscription.tierType, subscription.tierId);
              const price = getPrice(subscription.tierId);
              const description = getDescription(subscription.tierId);
              const perks = getPerks(subscription.tierId);
              
              return (
                <Card key={subscription._id} className="flex flex-col transition-all hover:shadow-lg opacity-75">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">
                          {subscription.tierId?.tierName || subscription.tierType || 'Membership'}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          by {subscription.creatorId?.fullName || subscription.creatorId?.name || 'Creator'}
                        </CardDescription>
                      </div>
                      <Badge variant={StatusBadge.variant}>
                        <StatusBadge.icon className="mr-1 h-3 w-3" />
                        {StatusBadge.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-1">
                    <div className="space-y-4">
                      <div>
                        <span className="text-2xl font-bold">
                          ${typeof price === 'number' ? price.toFixed(2) : price}
                        </span>
                        <span className="text-muted-foreground">
                          /{tierType.toLowerCase().includes('year') ? 'year' : 'month'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {description}
                      </p>
                      
                      {perks.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Includes:</p>
                          <ul className="space-y-1">
                            {perks.map((perk, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                                <CheckCircle className="h-3 w-3 text-green-600 shrink-0" />
                                <span className="line-clamp-1">{perk}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <Separator />
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Started:
                          </span>
                          <span>{formatDate(subscription.startDate)}</span>
                        </div>
                        {subscription.cancelDate && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <XCircle className="h-3 w-3" />
                              Cancelled on:
                            </span>
                            <span>{formatDate(subscription.cancelDate)}</span>
                          </div>
                        )}
                        {subscription.nextBillingDate && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Expires on:
                            </span>
                            <span>{formatDate(subscription.nextBillingDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="border-t pt-4">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleReactivateClick(subscription)}
                      disabled={isReactivating}
                    >
                      {isReactivating && selectedSubscription?._id === subscription._id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <RotateCcw className="mr-2 h-4 w-4" />
                      )}
                      Reactivate Membership
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* If no active subscriptions but there are cancelled/incomplete ones */}
      {activeSubscriptions.length === 0 && cancelledSubscriptions.length === 0 && (
        <div className="text-center py-12">
          <Card className="text-center border-dashed">
            <CardContent className="py-12">
              <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No memberships found</p>
              <Button onClick={handleExploreClick} className="mt-4">
                Explore Creators
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Membership</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your subscription to{' '}
              <span className="font-semibold">
                {selectedSubscription?.tierId?.tierName || selectedSubscription?.tierType}
              </span>{' '}
              by {selectedSubscription?.creatorId?.fullName || selectedSubscription?.creatorId?.name}?
              <br />
              <br />
              You will lose access to all benefits at the end of your current billing period
              on {selectedSubscription?.nextBillingDate && formatDate(selectedSubscription.nextBillingDate)}.
              <br />
              <br />
              This action can be undone by reactivating before the cancellation takes effect.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Keep Membership</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancel}
              disabled={isCancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Yes, Cancel Membership'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reactivate Confirmation Dialog */}
      <AlertDialog open={reactivateDialogOpen} onOpenChange={setReactivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reactivate Membership</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reactivate your subscription to{' '}
              <span className="font-semibold">
                {selectedSubscription?.tierId?.tierName || selectedSubscription?.tierType}
              </span>{' '}
              by {selectedSubscription?.creatorId?.fullName || selectedSubscription?.creatorId?.name}?
              <br />
              <br />
              Your subscription will continue with the same billing cycle and price.
              <br />
              <br />
              You will be charged at the next billing date.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isReactivating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmReactivate}
              disabled={isReactivating}
            >
              {isReactivating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Reactivating...
                </>
              ) : (
                'Yes, Reactivate Membership'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Memberships;