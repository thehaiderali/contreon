import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ReactConfetti from 'react-confetti';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/lib/api';

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!sessionId) {
            setLoading(false);
            return;
        }

        const setPaymentSuccess = async () => {
            try {
                const response = await api.post("/subscriptions/stripe-success", { sessionId });
                if (response.data.success) {
                    setSuccess(true);
                }
            } catch (error) {
                console.log("Response Error: ", error);
            } finally {
                setLoading(false);
            }
        };
        setPaymentSuccess();
    }, [sessionId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-muted-foreground">Processing your payment...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <ReactConfetti
                width={windowSize.width}
                height={windowSize.height}
                recycle={false}
                numberOfPieces={200}
                colors={['#000000', '#1a1a1a', '#22c55e', '#16a34a', '#15803d']}
                pieceSize={6}
                gravity={0.15}
            />
            
            <Card className="w-full max-w-md border border-border shadow-lg">
                <CardContent className="pt-12 pb-8 px-8 text-center">
                    <div className="mb-6">
                        <div className="w-16 h-16 rounded-full border-2 border-green-500 flex items-center justify-center mx-auto bg-green-50">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                    
                    <h1 className="text-2xl font-semibold tracking-tight mb-2">
                        Welcome Aboard
                    </h1>
                    <p className="text-sm text-muted-foreground mb-8">
                        Your subscription is now active. Start exploring exclusive content from your favorite creators.
                    </p>

                    <div className="space-y-3">
                        <Button 
                            onClick={() => navigate('/home')} 
                            className="w-full bg-black text-white hover:bg-black/90"
                        >
                            Start Exploring
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                        
                        <Button 
                            onClick={() => navigate('/memberships')} 
                            variant="outline" 
                            className="w-full border-black text-black hover:bg-black hover:text-white"
                        >
                            View My Memberships
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
