import React, { useState } from 'react'
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


const StripeOnboarding = () => {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    country: 'US',
    accountType: 'individual',
    platformUserId: '',
  })
  const [onboardingUrl, setOnboardingUrl] = useState('')
  const [error, setError] = useState('')

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
    setOnboardingUrl(response.data.data.onboardingUrl)
    setStep(2)
  } catch (err) {
    setError(err.response?.data?.error || err.message)
  } finally {
    setIsLoading(false)
  }
}
  const handleStartOnboarding = () => {
    if (onboardingUrl) {
      window.location.href = onboardingUrl
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          
          {step === 1 ? (
            <>
              {/* Hero Section */}
              <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold  mb-4">
                  Start Earning Today
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                  Join thousands of creators monetizing their passion. Set up your Stripe account in minutes and start selling subscriptions.
                </p>
              </div>

              {/* Onboarding Form */}
              <div className="max-w-2xl mx-auto">
                <Card className="border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-2xl">Creator Account Setup</CardTitle>
                    <CardDescription>
                      Enter your details to start the Stripe verification process
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
                              <SelectItem value="DE">Germany</SelectItem>
                              <SelectItem value="FR">France</SelectItem>
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
                              <SelectItem value="non_profit">Non-Profit</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                        <div className="flex items-start space-x-3">
                          <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                          <div>
                            <AlertTitle className="text-blue-900 dark:text-blue-100">
                              Your information is secure
                            </AlertTitle>
                            <AlertDescription className="text-blue-700 dark:text-blue-300">
                              Stripe uses bank-level security. We never store your sensitive data.
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
                            Continue to Stripe
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>

                <div className="text-center mt-8">
                  <p className="text-sm text-slate-500">
                    By continuing, you agree to Stripe's{' '}
                    <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                  </p>
                </div>
              </div>
            </>
          ) : (
            // Step 2: Stripe Onboarding Redirect
            <div className="max-w-2xl mx-auto">
              <Card className="border-0 shadow-xl">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">Ready to Complete Setup</CardTitle>
                  <CardDescription>
                    You'll be redirected to Stripe to complete your verification
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>What happens next?</AlertTitle>
                    <AlertDescription>
                      Stripe will ask for some additional information to verify your identity and set up payouts.
                      This usually takes 5-10 minutes.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">1</Badge>
                      <span className="text-sm">Verify your identity with government ID</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">2</Badge>
                      <span className="text-sm">Connect a bank account for payouts</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">3</Badge>
                      <span className="text-sm">Provide tax information (if applicable)</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <DollarSign className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Platform Fee: 10%</p>
                        <p className="text-xs text-slate-500 mt-1">
                          You keep 90% of every subscription. Stripe fees are automatically deducted.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleStartOnboarding}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Continue to Stripe
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>

              <div className="text-center mt-6">
                <p className="text-xs text-slate-400">
                  You'll be redirected to Stripe's secure onboarding portal. This page will close automatically.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StripeOnboarding