// frontend/src/pages/private/creator/StripeOnboarding.jsx
import React, { useState, useEffect } from 'react'
import { 
  CreditCard, 
  Users, 
  Globe, 
  Shield, 
  CheckCircle, 
  ArrowRight,
  AlertCircle,
  Loader2,
  User,
  Mail,
  DollarSign
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { api } from '@/lib/api'
import { useNavigate } from 'react-router'

const StripeOnboarding = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [stripeAccountCreated, setStripeAccountCreated] = useState(false)
  const [stripeStatus, setStripeStatus] = useState(null)
  
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    country: 'US',
    accountType: 'individual',
  })

  // Check existing Stripe status on load
  useEffect(() => {
    checkStripeStatus()
  }, [])

  const checkStripeStatus = async () => {
    try {
      const response = await api.get('/creators/stripe-status')
      if (response.data.success && response.data.data.accountId) {
        setStripeAccountCreated(true)
        setStripeStatus(response.data.data)
      }
    } catch (err) {
      console.log('No Stripe account found')
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      const response = await api.post("/creators/connect-stripe", {
        email: formData.email,
        fullName: formData.fullName,
        country: formData.country,
        accountType: formData.accountType,
      })
      
      if(!response.data.success){
        throw new Error(response.data.error || "Error in Request")
      }
      
      // Account created successfully - no onboarding URL returned
      setStripeAccountCreated(true)
      setStripeStatus(response.data.data)
      
      // Show success message and redirect after 2 seconds
      setTimeout(() => {
        navigate('/creator/payouts') // Redirect to payouts page
      }, 2000)
      
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (stripeAccountCreated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Stripe Account Created! 🎉
          </h1>
          
          <p className="text-gray-600 mb-4">
            Your Stripe account is ready. You can now accept payments from subscribers.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              ⚠️ <strong>Important:</strong> To withdraw funds, you'll need to complete verification when you request your first payout.
            </p>
          </div>
          
          <Button 
            onClick={() => navigate('/creator/payouts')}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
          >
            Go to Payouts →
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Set Up Payments
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Create your Stripe account to start accepting payments. You'll verify your identity when you're ready to withdraw funds.
            </p>
          </div>

          {/* Onboarding Form */}
          <div className="max-w-2xl mx-auto">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl">Creator Account Setup</CardTitle>
                <CardDescription>
                  Create your Stripe account in seconds. No verification needed to start earning.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        id="fullName"
                        name="fullName"
                        placeholder="John Doe"
                        className="pl-9"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="creator@example.com"
                        className="pl-9"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Select 
                        value={formData.country} 
                        onValueChange={(value) => setFormData({...formData, country: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="US">United States</SelectItem>
                          <SelectItem value="GB">United Kingdom</SelectItem>
                          <SelectItem value="CA">Canada</SelectItem>
                          <SelectItem value="AU">Australia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="accountType">Account Type</Label>
                      <Select 
                        value={formData.accountType} 
                        onValueChange={(value) => setFormData({...formData, accountType: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="individual">Individual</SelectItem>
                          <SelectItem value="company">Company</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                    <div className="flex items-start space-x-3">
                      <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div>
                        <AlertTitle className="text-blue-900 dark:text-blue-100">
                          Start earning immediately
                        </AlertTitle>
                        <AlertDescription className="text-blue-700 dark:text-blue-300">
                          You can accept payments right away. Identity verification is only required for withdrawals.
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                </CardContent>

                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Stripe Account
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StripeOnboarding