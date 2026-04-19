// src/pages/PaymentSuccess.jsx
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Download, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { api } from '@/lib/api';
export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [paymentData, setPaymentData] = useState(null);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    const sessionId = searchParams.get('session_id');

    const setPaymentSuccess=async()=>{

        setLoading(true);

        const response=await api.post("/subscriptions/stripe-success",{
            sessionId
        })
        if(response.data.success){
            setLoading(false)
        }
        else{
            console.log("Response Error : ",response.data.error);
            setLoading(false)
        }


    }

    useEffect(() => {
        if (!sessionId) {
            setError('No session ID found in URL');
            setLoading(false);
            return;
        }
        setPaymentSuccess();

    }, [sessionId]);

    const handleRetry = () => {
        setRetryCount(prev => prev + 1);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                    <p className="mt-4 text-gray-400">Processing your payment...</p>
                    <p className="text-sm text-gray-500 mt-2">Please don't close this page</p>
                </div>
            </div>
        );
    }

    if (error && !paymentData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black p-4">
                <Card className="max-w-md w-full bg-white">
                    <CardHeader>
                        <div className="mx-auto mb-4">
                            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                                <AlertCircle className="h-8 w-8 text-red-600" />
                            </div>
                        </div>
                        <CardTitle className="text-center text-2xl">Processing Error</CardTitle>
                        <CardDescription className="text-center">
                            {error}
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex flex-col space-y-2">
                        <Button 
                            onClick={handleRetry}
                            className="w-full bg-black text-white hover:bg-gray-800"
                        >
                            Try Again
                        </Button>
                        <Button 
                            onClick={() => navigate('/home')} 
                            variant="outline"
                            className="w-full"
                        >
                            Go to Home
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Success Animation */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center">
                        <CheckCircle className="h-20 w-20 text-green-500" />
                    </div>
                    <h1 className="mt-4 text-3xl font-bold text-white">
                        Payment Successful!
                    </h1>
                    <p className="mt-2 text-gray-400">
                        Thank you for your subscription. Your membership is now active.
                    </p>
                </div>

                {/* Payment Details Card */}
                <Card className="mb-6 bg-white">
                    <CardHeader>
                        <CardTitle>Payment Details</CardTitle>
                        <CardDescription>
                            Your transaction has been completed successfully
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="border-t border-b border-gray-200 py-4">
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-600">Status</span>
                                <span className="font-semibold text-green-600">Completed</span>
                            </div>
                            {paymentData?.tier && (
                                <>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-gray-600">Plan</span>
                                        <span className="font-semibold">{paymentData.tier.name}</span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-gray-600">Amount</span>
                                        <span className="font-semibold">${paymentData.tier.price}</span>
                                    </div>
                                </>
                            )}
                            <div className="flex justify-between">
                                <span className="text-gray-600">Date</span>
                                <span className="font-semibold">
                                    {new Date().toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        <Alert className="bg-green-50 border-green-200">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                                A confirmation email has been sent to your registered email address.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button
                        onClick={() => navigate('/dashboard')}
                        className="bg-white text-black hover:bg-gray-100"
                    >
                        Go to Dashboard
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    
                    <Button
                        onClick={() => window.print()}
                        variant="outline"
                        className="bg-transparent text-white border-white hover:bg-white hover:text-black"
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Download Receipt
                    </Button>
                </div>
            </div>
        </div>
    );
}