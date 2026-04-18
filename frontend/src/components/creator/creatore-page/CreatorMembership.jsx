// import React, { useEffect, useState } from 'react';
// import { api } from '@/lib/api';
// import { RotateCw, Check, Crown } from 'lucide-react';
// import { Button } from '@/components/ui/button';

// const TierCard = ({ tier, currentTierId, onUpgrade }) => {
//   const isCurrentTier = currentTierId === tier._id;

//   return (
//     <div
//       className={`rounded-xl border p-6 flex flex-col gap-4 transition-colors ${
//         isCurrentTier
//           ? 'border-primary/60 bg-primary/5'
//           : 'border-border/60 bg-card hover:border-border'
//       }`}
//     >
//       <div>
//         <div className="flex items-center gap-2 mb-1">
//           {isCurrentTier && <Crown className="h-4 w-4 text-primary" />}
//           <p className="text-lg font-bold">{tier.tierName}</p>
//         </div>
//         <p className="text-2xl font-bold">
//           ${tier.price}
//           <span className="text-sm font-normal text-muted-foreground"> / month</span>
//         </p>
//       </div>

//       {isCurrentTier ? (
//         <Button variant="outline" size="sm" disabled className="w-full">
//           Current plan
//         </Button>
//       ) : (
//         <Button
//           size="sm"
//           className="w-full"
//           onClick={() => onUpgrade(tier._id)}
//         >
//           Subscribe
//         </Button>
//       )}

//       {(tier.description || tier.perks?.length > 0) && (
//         <div className="space-y-2">
//           {tier.description && (
//             <p className="text-xs text-muted-foreground">{tier.description}</p>
//           )}
//           {tier.perks?.length > 0 && (
//             <>
//               <p className="text-xs font-medium text-foreground">At this tier you get:</p>
//               <ul className="space-y-1.5">
//                 {tier.perks.map((perk, i) => (
//                   <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
//                     <Check className="h-3.5 w-3.5 text-foreground mt-0.5 shrink-0" />
//                     {perk}
//                   </li>
//                 ))}
//               </ul>
//             </>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// const CreatorMembership = ({ creator, creatorUrl }) => {
//   const [tiers, setTiers] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchTiers = async () => {
//       setIsLoading(true);
//       setError(null);
//       try {
//         const res = await api.get(`/creators/by-url/${creatorUrl}/memberships`);
//         if (res.data.success) {
//           setTiers(res.data.data || []);
//         } else {
//           setError(res.data.error || 'Failed to load memberships');
//         }
//       } catch (err) {
//         setError(err.response?.data?.error || err.message);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchTiers();
//   }, [creatorUrl]);

//   const handleUpgrade = async (tierId) => {
//     try {
//       const res = await api.post('/subscriptions/checkout', { tierId, creatorUrl });
//       if (res.data?.url) {
//         window.location.href = res.data.url;
//       }
//     } catch (err) {
//       console.error('Checkout error:', err);
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="flex justify-center py-20">
//         <RotateCw className="h-5 w-5 animate-spin text-muted-foreground" />
//       </div>
//     );
//   }

//   if (error) {
//     return <p className="text-sm text-muted-foreground text-center py-12">{error}</p>;
//   }

//   const activeTiers = tiers.filter((t) => t.isActive);

//   return (
//     <div className="max-w-3xl space-y-8">
//       <section>
//         <h2 className="text-xl font-bold mb-1">Support {creator?.displayName}</h2>
//         <p className="text-sm text-muted-foreground mb-6">
//           Choose a membership tier to unlock exclusive content and support this creator.
//         </p>
//         {activeTiers.length === 0 ? (
//           <p className="text-sm text-muted-foreground">No membership tiers available yet.</p>
//         ) : (
//           <div className="flex flex-col gap-4 max-w-sm">
//             {activeTiers.map((tier) => (
//               <TierCard
//                 key={tier._id}
//                 tier={tier}
//                 currentTierId={null}
//                 onUpgrade={handleUpgrade}
//               />
//             ))}
//           </div>
//         )}
//       </section>
//     </div>
//   );
// };

// export default CreatorMembership;

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { RotateCw, Check, Crown, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe (add your publishable key to env)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const TierCard = ({ tier, currentTierId, onUpgrade, isProcessing }) => {
  const isCurrentTier = currentTierId === tier._id;

  return (
    <div
      className={`rounded-xl border p-6 flex flex-col gap-4 transition-colors ${
        isCurrentTier
          ? 'border-primary/60 bg-primary/5'
          : 'border-border/60 bg-card hover:border-border'
      }`}
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          {isCurrentTier && <Crown className="h-4 w-4 text-primary" />}
          <p className="text-lg font-bold">{tier.tierName}</p>
        </div>
        <p className="text-2xl font-bold">
          ${tier.price}
          <span className="text-sm font-normal text-muted-foreground"> / month</span>
        </p>
      </div>

      {isCurrentTier ? (
        <Button variant="outline" size="sm" disabled className="w-full">
          Current plan
        </Button>
      ) : (
        <Button
          size="sm"
          className="w-full"
          onClick={() => onUpgrade(tier._id)}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <RotateCw className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <CreditCard className="h-4 w-4 mr-2" />
          )}
          Subscribe
        </Button>
      )}

      {(tier.description || tier.perks?.length > 0) && (
        <div className="space-y-2">
          {tier.description && (
            <p className="text-xs text-muted-foreground">{tier.description}</p>
          )}
          {tier.perks?.length > 0 && (
            <>
              <p className="text-xs font-medium text-foreground">At this tier you get:</p>
              <ul className="space-y-1.5">
                {tier.perks.map((perk, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-foreground mt-0.5 shrink-0" />
                    {perk}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const CreatorMembership = ({ creator, creatorUrl }) => {
  const [tiers, setTiers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    const fetchTiers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.get(`/creators/by-url/${creatorUrl}/memberships`);
        if (res.data.success) {
          setTiers(res.data.data || []);
        } else {
          setError(res.data.error || 'Failed to load memberships');
        }
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTiers();
  }, [creatorUrl]);

  const handleUpgrade = async (tierId) => {
    const tier = tiers.find(t => t._id === tierId);
    setSelectedTier(tier);
    setShowConfirmDialog(true);
  };

  const confirmSubscription = async () => {
    if (!selectedTier) return;
    
    setIsProcessing(true);
    setShowConfirmDialog(false);
    
    try {
      // Call your backend to create checkout session
      const res = await api.post('/subscriptions/create-checkout', {
        tierId: selectedTier._id,
        creatorUrl: creatorUrl
      });
      
      if (res.data.success && res.data.data.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = res.data.data.checkoutUrl;
      } else if (res.data.data.sessionId) {
        // Alternative: Use Stripe.js redirect
        const stripe = await stripePromise;
        const { error } = await stripe.redirectToCheckout({
          sessionId: res.data.data.sessionId,
        });
        
        if (error) {
          console.error('Stripe redirect error:', error);
          setError(error.message);
        }
      } else {
        setError('Failed to create checkout session');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.error || 'Failed to start checkout process');
      setIsProcessing(false);
    }
  };

  // Check for successful payment return
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const success = urlParams.get('success');
    
    if (success === 'true' && sessionId) {
      // Show success message
      const timer = setTimeout(() => {
        // Refresh page or show success notification
        window.location.href = window.location.pathname;
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <RotateCw className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-red-500 mb-2">{error}</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  const activeTiers = tiers.filter((t) => t.isActive !== false);

  return (
    <>
      <div className="max-w-3xl space-y-8">
        <section>
          <h2 className="text-xl font-bold mb-1">Support {creator?.displayName || creator?.name}</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Choose a membership tier to unlock exclusive content and support this creator.
          </p>
          {activeTiers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No membership tiers available yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeTiers.map((tier) => (
                <TierCard
                  key={tier._id}
                  tier={tier}
                  currentTierId={null}
                  onUpgrade={handleUpgrade}
                  isProcessing={isProcessing}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Subscription</DialogTitle>
            <DialogDescription>
              You are about to subscribe to the <strong>{selectedTier?.tierName}</strong> tier for <strong>${selectedTier?.price}/month</strong>.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm font-medium mb-2">What you'll get:</p>
              <ul className="space-y-1.5">
                {selectedTier?.perks?.slice(0, 3).map((perk, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                    {perk}
                  </li>
                ))}
                {selectedTier?.perks?.length > 3 && (
                  <li className="text-xs text-muted-foreground pl-5">
                    +{selectedTier.perks.length - 3} more benefits
                  </li>
                )}
              </ul>
            </div>
            
            <div className="text-sm">
              <p className="text-muted-foreground">
                You will be charged <strong>${selectedTier?.price}</strong> immediately, and then every month until you cancel.
                You can cancel anytime from your account settings.
              </p>
            </div>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmSubscription}>
              <CreditCard className="h-4 w-4 mr-2" />
              Confirm & Pay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Message */}
      {window.location.search.includes('success=true') && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
          <div className="rounded-lg bg-green-500 text-white p-4 shadow-lg">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5" />
              <p className="text-sm font-medium">Subscription successful!</p>
            </div>
            <p className="text-xs mt-1 opacity-90">Thank you for your support</p>
          </div>
        </div>
      )}
    </>
  );
};

export default CreatorMembership;