import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { api } from '@/lib/api'

const Payouts = () => {
  const [isLoading, setIsLoading] = useState(false)

  const handleConnectStripe = async () => {
    setIsLoading(true)
    
    try {
   

      const response=await api.post("/creators/connect-stripe");
      const data=response.data
      if (data.accountLinkUrl) {
        window.location.href = data.accountLinkUrl
      } else {
        toast.success('Success', {
          description: 'Stripe Connect account created successfully!',
        })
      }
    } catch (error) {
      console.error('Error connecting Stripe:', error)
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to connect to Stripe',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Stripe Connect Integration</CardTitle>
          <CardDescription>
            Connect your Stripe account to receive payments and process payouts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            By connecting your Stripe account, you'll be able to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>Receive instant payouts</li>
            <li>Process payments securely</li>
            <li>Manage your transaction history</li>
            <li>Access detailed financial reports</li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleConnectStripe} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting to Stripe...
              </>
            ) : (
              'Connect Stripe Account'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default Payouts