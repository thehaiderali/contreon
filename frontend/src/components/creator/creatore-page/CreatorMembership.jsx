import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { RotateCw, Check, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

const TierCard = ({ tier, currentTierId, onUpgrade }) => {
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
        >
          Upgrade
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
    try {
      const res = await api.post('/subscriptions/checkout', { tierId, creatorUrl });
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
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
    return <p className="text-sm text-muted-foreground text-center py-12">{error}</p>;
  }

  const activeTiers = tiers.filter((t) => t.isActive);

  return (
    <div className="max-w-3xl space-y-8">
      <section>
        <h2 className="text-xl font-bold mb-1">Support {creator?.displayName}</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Choose a membership tier to unlock exclusive content and support this creator.
        </p>
        {activeTiers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No membership tiers available yet.</p>
        ) : (
          <div className="flex flex-col gap-4 max-w-sm">
            {activeTiers.map((tier) => (
              <TierCard
                key={tier._id}
                tier={tier}
                currentTierId={null}
                onUpgrade={handleUpgrade}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default CreatorMembership;