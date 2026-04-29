import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, DollarSign, CreditCard, Calendar, AlertCircle, ExternalLink, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Loader } from '../../../components/creator/dashboard/Loader'
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
  const [earnings, setEarnings] = useState(null)
  const { user, checkAuth } = useAuthStore()

  const isConnected = user?.connectedID && user.connectedID !== ""

  useEffect(() => {
    checkAuth()
    fetchStripeStatus()
    fetchEarnings()
  }, [])

  const fetchStripeStatus = async () => {
    try {
      const res = await api.get('/creators/stripe-status')
      if (res.data.success) {
        setStripeStatus(res.data.data)
      }
    } catch (error) {
      console.error('Error fetching stripe status:', error)
    }
  }

  const fetchEarnings = async () => {
    try {
      const res = await api.get('/creators/earnings')
      if (res.data.success) {
        setEarnings(res.data.data)
      }
    } catch (error) {
      console.error('Error fetching earnings:', error)
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
        <Loader size="md" />
      </div>
    )
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  const formatDate = (date) => {
    if (!date) return 'None'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const showEarnings = stripeStatus?.isOnboarded && earnings

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

            {earnings?.pendingAmount > 0 && (
              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800 dark:text-blue-200">Funds on Hold</p>
                  <p className="text-blue-700 dark:text-blue-300 mt-1">
                    ${earnings.pendingAmount.toFixed(2)} is being held until you complete onboarding.
                    Platform fees will be deducted before transfer.
                  </p>
                </div>
              </div>
            )}

            <Button onClick={handleOnboarding} disabled={onboarding}>
              {onboarding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ExternalLink className="h-4 w-4 mr-2" />}
              {onboarding ? 'Loading...' : 'Complete Onboarding'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">Total Earnings</span>
                </div>
                <p className="text-xl font-semibold">
                  {formatCurrency(earnings?.totalEarnings)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-sm">Payment Count</span>
                </div>
                <p className="text-xl font-semibold">
                  {earnings?.earningsCount || 0}
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
                  {formatDate(earnings?.lastPaymentDate)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Pending Amount</span>
                </div>
                <p className="text-xl font-semibold">
                  {formatCurrency(earnings?.pendingAmount)}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Stripe Connect Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stripeStatus?.isOnboarded ? (
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                      Connected & Onboarded
                    </span>
                  </div>
                  <Badge variant="outline" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                    Active
                  </Badge>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-3">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="text-sm font-medium text-red-700 dark:text-red-300">
                      Not Fully Onboarded
                    </span>
                  </div>
                  <Badge variant="outline" className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300">
                    Inactive
                  </Badge>
                </div>
              )}

              <div className="text-sm text-muted-foreground space-y-1">
                <p>Platform Fee: {earnings?.platformFeePercent || 0}%</p>
                <p className="text-xs">
                  {showEarnings && earnings.pendingAmount > 0 
                    ? `$${earnings.pendingAmount.toFixed(2)} will be transferred automatically once subscription payments are confirmed.`
                    : 'Earnings are automatically transferred to your bank account by Stripe based on your payout schedule.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

export default Payouts