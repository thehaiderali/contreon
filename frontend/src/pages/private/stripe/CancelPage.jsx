// src/pages/PaymentCancel.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, ArrowLeft, RefreshCw, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { api } from '@/lib/api';

export default function PaymentCancel() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [cancelled, setCancelled] = useState(false);
    
    const sessionId = searchParams.get('session_id');

   
       const setPaymentCancell=async()=>{
   
           setLoading(true);
   
           const response=await api.post("/subscriptions/stripe-cancell",{
               sessionId
           })
           if(response.data.success){
               setLoading(false)
               setCancelled(true)
           }
           else{
               console.log("Response Error : ",response.data.error);
               setLoading(false)
           }
   
   
       }

    useEffect(() => {

        setPaymentCancell()

    }, []);

    const handleRetry = () => {
        navigate(-1);
    };

    const handleContactSupport = () => {
        window.location.href = 'mailto:support@example.com';
    };

    return (
        <div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                {/* Cancel Icon */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center">
                        <XCircle className="h-20 w-20 text-red-500" />
                    </div>
                    <h1 className="mt-4 text-3xl font-bold text-white">
                        Payment Cancelled
                    </h1>
                    <p className="mt-2 text-gray-400">
                        Your payment was cancelled and no charges were made.
                    </p>
                </div>

                {/* Main Message Card */}
                <Card className="mb-6 bg-white">
                    <CardHeader>
                        <CardTitle>What happened?</CardTitle>
                        <CardDescription>
                            Your transaction was cancelled before completion
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert className="bg-yellow-50 border-yellow-200">
                            <AlertDescription className="text-yellow-800">
                                No payment has been processed. Your account has not been charged.
                            </AlertDescription>
                        </Alert>

                        <div className="space-y-2">
                            <p className="text-sm text-gray-600">
                                {loading ? (
                                    <span className="flex items-center">
                                        <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                                        Updating payment status...
                                    </span>
                                ) : cancelled ? (
                                    "Your payment cancellation has been recorded."
                                ) : (
                                    "Your payment was cancelled. If this was a mistake, you can try again."
                                )}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <Button
                        onClick={handleRetry}
                        className="w-full bg-white text-black hover:bg-gray-100"
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Try Again
                    </Button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Button
                            onClick={() => navigate('/')}
                            variant="outline"
                            className="bg-transparent text-white border-white hover:bg-white hover:text-black"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Return to Home
                        </Button>

                        <Button
                            onClick={handleContactSupport}
                            variant="outline"
                            className="bg-transparent text-white border-white hover:bg-white hover:text-black"
                        >
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Contact Support
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}