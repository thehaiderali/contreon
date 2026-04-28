import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, DollarSign, CreditCard, Calendar, AlertCircle, ExternalLink, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore.js'

const Payouts = () => {
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [onboarding, setOnboarding] = useState(false)
  const [stripeStatus, setStripeStatus] = useState(null)
  const { user, checkAuth } = useAuthStore()

  const isConnected = user?.connectedID && user.connectedID !== ""

  useEffect(() => {
    checkAuth()
    fetchStripeStatus()
  }, [])

  const fetchStripeStatus = async () => {
    try {
      const res = await api.get('/creators/stripe-status')
      if (res.data.success) {
        setStripeStatus(res.data.data)
      }
    } catch (error) {
      console.error('Error fetching stripe status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConnectStripe = async () => {
    setConnecting(true)
    try {
      const res = await api.post('/creators/connect-stripe')
      if (res.data.success) {
        toast.success('Stripe account created')
        await checkAuth()
        await fetchStripeStatus()
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to connect Stripe')
    } finally {
      setConnecting(false)
    }
  }

  const handleOnboarding = async () => {
    setOnboarding(true)
    try {
      const res = await api.post('/creators/stripe-onboarding')
      if (res.data.url) {
        window.location.href = res.data.url
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to start onboarding')
    } finally {
      setOnboarding(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <h1 className="text-xl font-semibold">Earnings</h1>

      {!isConnected ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Connect Stripe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Connect your Stripe account to start receiving earnings automatically.
            </p>
            <Button onClick={handleConnectStripe} disabled={connecting}>
              {connecting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {connecting ? 'Connecting...' : 'Connect Stripe Account'}
            </Button>
          </CardContent>
        </Card>
      ) : !stripeStatus?.isOnboarded ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Complete Stripe Onboarding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800 dark:text-yellow-200">Onboarding Required</p>
                <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                  Complete onboarding to receive automatic payouts.
                </p>
              </div>
            </div>

            <Button onClick={handleOnboarding} disabled={onboarding}>
              {onboarding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ExternalLink className="h-4 w-4 mr-2" />}
              {onboarding ? 'Loading...' : 'Complete Onboarding'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">Total Earnings</span>
                </div>
                <p className="text-xl font-semibold">
                  {formatCurrency(user?.deferredOnboarding?.pendingEarnings || 0)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-sm">Payments</span>
                </div>
                <p className="text-xl font-semibold">
                  {user?.deferredOnboarding?.earningsCount || 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Last Payment</span>
                </div>
                <p className="text-sm font-medium">
                  {user?.deferredOnboarding?.lastEarningDate
                    ? new Date(user.deferredOnboarding.lastEarningDate).toLocaleDateString()
                    : 'None'}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payouts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    Automatic Payouts Enabled
                  </span>
                </div>
                <Badge variant="outline" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                  Active
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground">
                Earnings are automatically transferred to your bank account by Stripe based on your payout schedule.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

export default Payouts