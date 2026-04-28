import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/lib/api';

export default function PaymentCancel() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    
    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        const setPaymentCancel = async () => {
            setLoading(true);
            try {
                await api.post("/subscriptions/stripe-cancel", { sessionId });
            } catch (error) {
                console.log("Error: ", error);
            } finally {
                setLoading(false);
            }
        };
        
        if (sessionId) {
            setPaymentCancel();
        }
    }, [sessionId]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-md border border-border shadow-lg">
                <CardContent className="pt-12 pb-8 px-8 text-center">
                    <div className="mb-6">
                        <div className="w-16 h-16 rounded-full border-2 border-muted flex items-center justify-center mx-auto">
                            <XCircle className="w-8 h-8 text-muted-foreground" />
                        </div>
                    </div>
                    
                    <h1 className="text-2xl font-semibold tracking-tight mb-2">
                        Payment Cancelled
                    </h1>
                    <p className="text-sm text-muted-foreground mb-8">
                        No charges were made to your account. Your subscription was not activated.
                    </p>

                    <div className="space-y-3">
                        <Button 
                            onClick={() => navigate(-1)} 
                            className="w-full bg-black text-white hover:bg-black/90"
                        >
                            <ArrowLeft className="mr-2 w-4 h-4" />
                            Try Again
                        </Button>
                        
                        <Button 
                            onClick={() => navigate('/explore')} 
                            variant="outline" 
                            className="w-full border-black text-black hover:bg-black hover:text-white"
                        >
                            Browse Creators
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
