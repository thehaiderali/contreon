import React, { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, DollarSign, CreditCard, Calendar, BadgeCheck } from 'lucide-react'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore.js'

const Payouts = () => {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const hasInitialized = useRef(false) // ✅ Prevent multiple calls
  const { user, checkAuth, loading } = useAuthStore();

  // Refresh user data on component mount - ONLY ONCE
  useEffect(() => {
    let isMounted = true;
    
    const refreshUser = async () => {
      try {
        if (isMounted) {
          // Call twice at first load as requested
          await checkAuth();
          await checkAuth();
        }
      } catch (error) {
        console.error('Error refreshing user:', error);
        toast.error('Error', {
          description: 'Failed to load user data',
        });
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };
    
    // Only run once on mount
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      refreshUser();
    }
    
    return () => {
      isMounted = false;
    };
  }, []); // ✅ Empty dependency array - run once on mount only

  const handleConnectStripe = async () => {
    setIsConnecting(true)
    try {
      const response = await api.post("/creators/connect-stripe")
      const data = response.data
      
      if (data.success) {
        toast.success('Success', {
          description: 'Stripe Connect account created successfully!',
        })
        
        // Call checkAuth twice after Stripe connection
        await checkAuth()
        await checkAuth()
        
        toast.success('Account Updated', {
          description: 'Your Stripe account has been connected successfully!',
        })
      } else {
        toast.error('Error', {
          description: data.error || 'Failed to connect to Stripe',
        })
      }
    } catch (error) {
      console.error('Error connecting Stripe:', error)
      toast.error('Error', {
        description: error.response?.data?.error || error.message || 'Failed to connect to Stripe',
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const formatDate = (date) => {
    if (!date) return 'No payments yet'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Safely access user properties with optional chaining
  const pendingEarnings = user?.deferredOnboarding?.pendingEarnings || 0
  const earningsCount = user?.deferredOnboarding?.earningsCount || 0
  const lastEarningDate = user?.deferredOnboarding?.lastEarningDate
  const isStripeConnected = user?.connectedID && user.connectedID !== ""

  // Show loading during initial load OR auth loading
  if (loading || isInitializing) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm">Pending Earnings</span>
              </div>
              <div className="text-2xl font-bold">
                {formatCurrency(pendingEarnings)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <CreditCard className="h-4 w-4" />
                <span className="text-sm">Payment Count</span>
              </div>
              <div className="text-2xl font-bold">
                {earningsCount}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Last Payment</span>
              </div>
              <div className="text-sm font-medium">
                {formatDate(lastEarningDate)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stripe Connect Card */}
        <Card>
          <CardHeader>
            <CardTitle>Stripe Connect</CardTitle>
          </CardHeader>
          <CardContent>
            {!isStripeConnected ? (
              <Button 
                onClick={handleConnectStripe} 
                disabled={isConnecting}
                className="w-full"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Connect Stripe Account'
                )}
              </Button>
            ) : (
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <BadgeCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="font-medium text-green-700 dark:text-green-300">
                    Stripe Account Connected
                  </span>
                </div>
                <Badge variant="outline" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                  Active
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Payouts