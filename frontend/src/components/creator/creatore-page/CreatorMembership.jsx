import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { RotateCw, Check, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useSubscriptionStore from '@/store/memberShipStore';

const TierCard = ({ tier, currentSubscription, onUpgrade }) => {
  // Check if this specific tier is the user's current subscription
  const isCurrentTier = currentSubscription?.tierId === tier._id;
  const isActive = currentSubscription?.status === 'active';

  return (
    <div
      className={`rounded-xl border p-6 flex flex-col gap-4 transition-colors ${
        isCurrentTier && isActive
          ? 'border-primary/60 bg-primary/5'
          : 'border-border/60 bg-card hover:border-border'
      }`}
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          {isCurrentTier && isActive && <Crown className="h-4 w-4 text-primary" />}
          <p className="text-lg font-bold">{tier.tierName}</p>
        </div>
        <p className="text-2xl font-bold">
          ${tier.price}
          <span className="text-sm font-normal text-muted-foreground"> / month</span>
        </p>
      </div>

      {isCurrentTier && isActive ? (
        <Button variant="outline" size="sm" disabled className="w-full">
          Current plan
        </Button>
      ) : (
        <Button
          size="sm"
          className="w-full"
          onClick={() => onUpgrade(tier._id)}
        >
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
  const subscriptions = useSubscriptionStore((state) => state.subscriptions);
  const fetchMySubscriptions = useSubscriptionStore((state) => state.fetchMySubscriptions);

  // Find active subscription for this specific creator
  const getCurrentSubscriptionForCreator = () => {
    // Handle both cases: creatorId can be string or object
    const activeSubscription = subscriptions.find(sub => {
      const subCreatorId = typeof sub.creatorId === 'object' 
        ? sub.creatorId._id || sub.creatorId.url
        : sub.creatorId;
      const currentCreatorId = creator?._id || creatorUrl;
      
      return subCreatorId === currentCreatorId && sub.status === 'active';
    });
    
    return activeSubscription || null;
  };

  const currentSubscription = getCurrentSubscriptionForCreator();
  const hasActiveSubscription = !!currentSubscription;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch subscriptions if not already loaded
        if (subscriptions.length === 0) {
          await fetchMySubscriptions();
        }
        
        const res = await api.get(`/creators/by-url/${creatorUrl}/memberships`);
        if (res.data.success) {
          setTiers(res.data.data || []);
        } else {
          setError(res.data.error || 'Failed to load memberships');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.error || err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [creatorUrl, fetchMySubscriptions, subscriptions.length]);

  const handleUpgrade = async (tierId) => {
    try {
      const res = await api.post('/subscriptions/create-checkout', { tierId });
      if (res.data.data?.checkoutUrl) {
        window.location.href = res.data.data.checkoutUrl;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.error || 'Failed to start checkout');
    }
  };

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

  const activeTiers = tiers.filter((t) => t.isActive);

  return (
    <div className="max-w-3xl space-y-8">
      <section>
        <h2 className="text-xl font-bold mb-1">Support {creator?.displayName}</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Choose a membership tier to unlock exclusive content and support this creator.
        </p>
        
        {/* Show current membership status */}
        {hasActiveSubscription && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
            <div className="flex items-start gap-3">
              <Crown className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  ✓ Active Member
                </p>
                <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                  Thank you for supporting {creator?.displayName}! 
                  You have access to all member-only content.
                </p>
                {currentSubscription?.tierType && (
                  <p className="text-xs text-green-700 dark:text-green-400 mt-2">
                    Current tier: <span className="font-semibold">{currentSubscription.tierType}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {activeTiers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No membership tiers available yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeTiers.map((tier) => (
              <TierCard
                key={tier._id}
                tier={tier}
                currentSubscription={currentSubscription}
                onUpgrade={handleUpgrade}
              />
            ))}
          </div>
        )}
        
        {/* Footer note */}
        {activeTiers.length > 0 && (
          <p className="text-xs text-muted-foreground text-center mt-6">
            By subscribing, you agree to our Terms of Service. Cancel anytime.
          </p>
        )}
      </section>
    </div>
  );
};

export default CreatorMembership;