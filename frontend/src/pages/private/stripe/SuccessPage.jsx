import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ReactConfetti from 'react-confetti';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

    const sessionId = searchParams.get('session_id');
    const pageUrl = searchParams.get("creator_url");

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
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <p className="text-sm text-muted-foreground">Processing your payment...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex min-h-screen items-center justify-center p-4">
            <ReactConfetti
                width={windowSize.width}
                height={windowSize.height}
                recycle={false}
                numberOfPieces={200}
                colors={['#000000', '#1a1a1a', '#22c55e', '#16a34a', '#15803d']}
                pieceSize={6}
                gravity={0.15}
            />
            
            <Card className="w-full max-w-md shadow-lg">
                <CardContent className="pt-12 pb-8 px-8 text-center">
                    <div className="mb-6">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                            <CheckCircle className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    
                    <h1 className="mb-2 text-2xl font-semibold tracking-tight">
                        Welcome Aboard
                    </h1>
                    <p className="mb-8 text-sm text-muted-foreground">
                        Your subscription is now active. Start exploring exclusive content from your favorite creators.
                    </p>

                    <div className="space-y-3">
                        <Button 
                            onClick={() => navigate(`/c/${pageUrl}`)} 
                            className="w-full"
                        >
                            Go Back to Creator Page
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        
                        <Button 
                            onClick={() => navigate('/home/memberships')} 
                            variant="outline"
                            className="w-full"
                        >
                            View My Memberships
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}