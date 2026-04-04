// frontend/src/pages/private/creator/Payouts.jsx
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle, DollarSign, Shield } from 'lucide-react';
import { useNavigate } from 'react-router';

const Payouts = () => {
  const navigate = useNavigate();
  const [stripeStatus, setStripeStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestingPayout, setRequestingPayout] = useState(false);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    fetchStripeStatus();
    fetchBalance();
  }, []);

  const fetchStripeStatus = async () => {
    try {
      const response = await api.get('/creators/stripe-status');
      setStripeStatus(response.data.data);
    } catch (error) {
      console.error('Error fetching Stripe status:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async () => {
    try {
      // You'll need to add an endpoint to fetch balance
      // For now, using mock data
      setBalance(0);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const handleRequestPayout = async () => {
    setRequestingPayout(true);
    try {
      const response = await api.post('/payouts/request', { amount: balance });
      
      if (!response.data.success && response.data.data?.requiresOnboarding) {
        // Redirect to Stripe onboarding for verification
        window.location.href = response.data.data.onboardingUrl;
      } else if (response.data.success) {
        alert('Payout requested successfully! Funds will arrive in 2-3 business days.');
        fetchBalance(); // Refresh balance
      }
    } catch (error) {
      console.error('Error requesting payout:', error);
      
      // Check if error contains onboarding URL
      if (error.response?.data?.data?.onboardingUrl) {
        if (confirm('Complete Stripe verification to enable payouts. Continue to Stripe?')) {
          window.location.href = error.response.data.data.onboardingUrl;
        }
      } else {
        alert(error.response?.data?.error || 'Failed to request payout');
      }
    } finally {
      setRequestingPayout(false);
    }
  };

  const handleStartOnboarding = async () => {
    try {
      const response = await api.post('/creators/start-onboarding');
      if (response.data.success) {
        window.location.href = response.data.data.onboardingUrl;
      }
    } catch (error) {
      console.error('Error starting onboarding:', error);
      alert('Failed to start verification process');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const hasStripeAccount = stripeStatus?.accountId;
  const isFullyOnboarded = stripeStatus?.onboarded;
  const needsVerification = hasStripeAccount && !isFullyOnboarded;

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Payouts</h1>
        <p className="text-muted-foreground">Manage your earnings and withdrawals</p>
      </div>

      {/* No Stripe Account */}
      {!hasStripeAccount && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Set up payments to start earning</h3>
              <p className="text-muted-foreground text-sm">
                Create your Stripe account to accept subscriber payments
              </p>
              <Button onClick={() => navigate('/creator/onboarding')}>
                Set Up Payments
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Has Stripe Account */}
      {hasStripeAccount && (
        <>
          {/* Balance Card */}
          <Card>
            <CardHeader>
              <CardTitle>Available Balance</CardTitle>
              <CardDescription>Ready to withdraw</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-4xl font-bold">${balance.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">
                  Your earnings from subscriptions will appear here
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Verification Status Alert */}
          {needsVerification && (
            <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertTitle>Verification Required for Withdrawals</AlertTitle>
              <AlertDescription className="space-y-3">
                <p>
                  Your Stripe account is set up and accepting payments, but you need to complete 
                  identity verification before you can withdraw funds.
                </p>
                <Button 
                  onClick={handleStartOnboarding}
                  variant="outline"
                  size="sm"
                  className="border-yellow-500 text-yellow-700 hover:bg-yellow-100"
                >
                  Complete Verification Now
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Fully Verified Alert */}
          {isFullyOnboarded && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle>Ready for Payouts</AlertTitle>
              <AlertDescription>
                Your account is fully verified. You can withdraw your earnings at any time.
              </AlertDescription>
            </Alert>
          )}

          {/* Payout Request Button */}
          <Card>
            <CardHeader>
              <CardTitle>Request Payout</CardTitle>
              <CardDescription>
                Withdraw your available balance to your connected bank account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleRequestPayout}
                disabled={requestingPayout || balance <= 0 || needsVerification}
                className="w-full md:w-auto"
                size="lg"
              >
                {requestingPayout ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : needsVerification ? (
                  'Complete Verification to Withdraw'
                ) : balance <= 0 ? (
                  'No Funds Available'
                ) : (
                  `Withdraw $${balance.toFixed(2)}`
                )}
              </Button>
              
              {needsVerification && balance > 0 && (
                <p className="text-sm text-yellow-600 mt-3">
                  ⚠️ You have ${balance.toFixed(2)} waiting. Complete verification to withdraw.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Payout Information */}
          <Card>
            <CardHeader>
              <CardTitle>Payout Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Processing Time</p>
                  <p className="text-sm text-muted-foreground">
                    Payouts typically take 2-3 business days to arrive in your bank account
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Platform Fee</p>
                  <p className="text-sm text-muted-foreground">
                    We take 15% platform fee + Stripe processing fees (2.9% + $0.30 per transaction)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Payouts;