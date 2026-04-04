// frontend/src/components/creator/dashboard/Home.jsx
import { useAuthStore } from '@/store/authStore';
import CreatorProfileForm from '../onboarding/CreatorProfileForm';
import CreatorProfile from './Profile';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { SquarePen } from 'lucide-react';
import { Link } from 'react-router';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Stripe Status Banner Component
const StripeStatusBanner = ({ status, onVerify }) => {
  if (!status?.accountId) {
    return (
      <Alert className="mb-4 border-blue-500 bg-blue-50 dark:bg-blue-950">
        <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-900 dark:text-blue-100">Set up payments to start earning</AlertTitle>
        <AlertDescription className="flex justify-between items-center gap-4">
          <span className="text-blue-700 dark:text-blue-300">Connect Stripe to accept subscriber payments</span>
          <Button 
            size="sm" 
            onClick={() => window.location.href = '/creator/onboarding'}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Set Up
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  
  if (status?.accountId && !status?.onboarded) {
    return (
      <Alert className="mb-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
        <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        <AlertTitle className="text-yellow-900 dark:text-yellow-100">Action Required: Complete Verification</AlertTitle>
        <AlertDescription className="flex justify-between items-center gap-4">
          <span className="text-yellow-700 dark:text-yellow-300">
            Your account is accepting payments, but you need to verify your identity to withdraw funds.
          </span>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onVerify}
            className="border-yellow-500 text-yellow-700 hover:bg-yellow-100 dark:text-yellow-300 dark:hover:bg-yellow-900"
          >
            Verify Now
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  
  return null;
};

const CreatorHome = () => {
  const { user } = useAuthStore();
  const [hasProfile, setHasProfile] = useState(false);
  const [stripeStatus, setStripeStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch creator profile
  const fetchProfile = async () => {
    try {
      const response = await api.get("/creators/profile/me");
      if (response.data.success) {
        setHasProfile(true);
      } else {
        setHasProfile(false);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setHasProfile(false);
    }
  };

  // Fetch Stripe status
  const fetchStripeStatus = async () => {
    try {
      const response = await api.get('/creators/stripe-status');
      if (response.data.success) {
        setStripeStatus(response.data.data.status);
      }
    } catch (error) {
      console.error('Error fetching Stripe status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle starting Stripe onboarding for verification
  const handleStartOnboarding = async () => {
    try {
      const response = await api.post('/creators/start-onboarding');
      if (response.data.success) {
        window.location.href = response.data.data.onboardingUrl;
      } else {
        console.error('Failed to start onboarding:', response.data.error);
      }
    } catch (error) {
      console.error('Error starting onboarding:', error);
      alert(error.response?.data?.error || 'Failed to start verification process');
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchStripeStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      {hasProfile ? (
        // Show profile component when onboarded
        <div className="max-w-2xl mx-auto px-4 py-8 relative">
          {/* Stripe Status Banner */}
          <StripeStatusBanner 
            status={stripeStatus} 
            onVerify={handleStartOnboarding} 
          />
          
          <CreatorProfile/>
          <div className='flex gap-3 justify-center absolute top-20 right-10'>
            <span className='text-background dark:text-foreground text-sm'>Edit Profile </span>
            <Link to={"profile/edit"}>
              <SquarePen size={20} className='text-background dark:text-foreground cursor-pointer'/> 
            </Link>
          </div>
        </div>
      ) : (
        // Show onboarding form when not onboarded
        <div className="flex flex-col gap-5 justify-center items-center min-h-screen px-4">
          <div className="text-center space-y-2">
            <p className="text-3xl font-semibold">
              Welcome to our Platform
            </p>
            <p className="text-muted-foreground text-base">
              Let's begin creating your page!
            </p>
          </div>
          <div className="w-full max-w-2xl min-h-screen">
            <CreatorProfileForm/>
          </div>
        </div>
      )}
    </>
  );
};

export default CreatorHome;