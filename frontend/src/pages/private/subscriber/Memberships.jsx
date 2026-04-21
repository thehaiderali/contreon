import React, { useState } from 'react';
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
import { Calendar, CreditCard, RefreshCw, XCircle, AlertCircle, CheckCircle } from 'lucide-react';
import NoSubscriptions from './NoSubscriptions';

// Hardcoded subscription data matching the models
const hardcodedSubscriptions = [
  {
    _id: 'sub_1',
    subscriberId: { _id: 'user_1', name: 'John Doe', email: 'john@example.com' },
    creatorId: { _id: 'creator_1', name: 'Tech Guru', email: 'tech@example.com' },
    tierId: {
      _id: 'tier_1',
      tierName: 'Pro Plan',
      price: 29.99,
      description: 'Access to all premium content',
      perks: ['Exclusive tutorials', 'Monthly Q&A', 'Downloadable resources'],
    },
    tierType: 'monthly',
    stripeSubscriptionId: 'sub_abc123',
    status: 'active',
    startDate: '2024-01-15T00:00:00.000Z',
    nextBillingDate: '2024-02-15T00:00:00.000Z',
    autoRenew: true,
  },
  {
    _id: 'sub_2',
    subscriberId: { _id: 'user_1', name: 'John Doe', email: 'john@example.com' },
    creatorId: { _id: 'creator_2', name: 'Fitness Coach', email: 'fitness@example.com' },
    tierId: {
      _id: 'tier_2',
      tierName: 'Elite Membership',
      price: 49.99,
      description: 'Personalized workout plans and nutrition guides',
      perks: ['1-on-1 coaching', 'Custom meal plans', 'Progress tracking'],
    },
    tierType: 'monthly',
    stripeSubscriptionId: 'sub_xyz789',
    status: 'active',
    startDate: '2024-01-01T00:00:00.000Z',
    nextBillingDate: '2024-02-01T00:00:00.000Z',
    autoRenew: true,
  },
  {
    _id: 'sub_3',
    subscriberId: { _id: 'user_1', name: 'John Doe', email: 'john@example.com' },
    creatorId: { _id: 'creator_3', name: 'Music Academy', email: 'music@example.com' },
    tierId: {
      _id: 'tier_3',
      tierName: 'Annual Pass',
      price: 299.99,
      description: 'Full year access to all music lessons',
      perks: ['All courses included', 'Certificate of completion', 'Priority support'],
    },
    tierType: 'yearly',
    stripeSubscriptionId: 'sub_def456',
    status: 'past_due',
    startDate: '2023-12-01T00:00:00.000Z',
    nextBillingDate: '2024-01-15T00:00:00.000Z',
    autoRenew: true,
  },
];

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// Helper function to get status badge variant
const getStatusBadge = (status) => {
  switch (status) {
    case 'active':
      return { variant: 'default', icon: CheckCircle, label: 'Active' };
    case 'past_due':
      return { variant: 'destructive', icon: AlertCircle, label: 'Past Due' };
    case 'cancelled':
      return { variant: 'secondary', icon: XCircle, label: 'Cancelled' };
    default:
      return { variant: 'outline', icon: AlertCircle, label: status };
  }
};

const Memberships = () => {
  const [subscriptions, setSubscriptions] = useState(hardcodedSubscriptions);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Handle cancel subscription
  const handleCancelClick = (subscription) => {
    setSelectedSubscription(subscription);
    setCancelDialogOpen(true);
  };

  const confirmCancel = async () => {
    if (!selectedSubscription) return;
    
    setIsCancelling(true);
    
    // API call placeholder for canceling subscription
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/subscriptions/${selectedSubscription._id}/cancel`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ cancelAtPeriodEnd: true }),
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setSubscriptions(prev =>
        prev.map(sub =>
          sub._id === selectedSubscription._id
            ? { ...sub, status: 'cancelled', autoRenew: false }
            : sub
        )
      );
      
      console.log(`Cancelled subscription: ${selectedSubscription._id}`);
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
    } finally {
      setIsCancelling(false);
      setCancelDialogOpen(false);
      setSelectedSubscription(null);
    }
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

  // Show NoSubscriptions component if no active/cancelled subscriptions
  if (subscriptions.length === 0) {
    return (
      <NoSubscriptions 
        onBrowseClick={handleBrowseClick}
        onExploreClick={handleExploreClick}
      />
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Memberships</h1>
        <p className="text-muted-foreground mt-2">
          Manage your active subscriptions and memberships
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {subscriptions.map((subscription) => {
          const StatusBadge = getStatusBadge(subscription.status);
          const isActive = subscription.status === 'active';
          const isCancellable = isActive || subscription.status === 'past_due';
          
          return (
            <Card key={subscription._id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">
                      {subscription.tierId.tierName}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      by {subscription.creatorId.name}
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
                      ${subscription.tierId.price}
                    </span>
                    <span className="text-muted-foreground">
                      /{subscription.tierType}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {subscription.tierId.description}
                  </p>
                  
                  {subscription.tierId.perks && subscription.tierId.perks.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Includes:</p>
                      <ul className="space-y-1">
                        {subscription.tierId.perks.map((perk, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            {perk}
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
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="border-t pt-4">
                {isCancellable ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleCancelClick(subscription)}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel Membership
                  </Button>
                ) : subscription.status === 'cancelled' ? (
                  <Button variant="outline" className="w-full" disabled>
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancelled
                  </Button>
                ) : null}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Membership</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your subscription to{' '}
              <span className="font-semibold">
                {selectedSubscription?.tierId.tierName}
              </span>{' '}
              by {selectedSubscription?.creatorId.name}?
              <br />
              <br />
              You will lose access to all benefits at the end of your current billing period
              on {selectedSubscription?.nextBillingDate && formatDate(selectedSubscription.nextBillingDate)}.
              <br />
              <br />
              This action can be undone by resubscribing before the cancellation takes effect.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Keep Membership</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancel}
              disabled={isCancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCancelling ? 'Cancelling...' : 'Yes, Cancel Membership'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Memberships;