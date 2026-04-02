import React from 'react';
import { motion } from 'motion/react';
import { Crown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const NoMemberships = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full min-h-[70vh] flex items-center justify-center p-8"
    >
      <Card className="max-w-2xl w-full bg-linear-to-br from-background to-muted/30 border-border shadow-xl">
        <div className="flex flex-col items-center text-center p-12 space-y-6">
          
          <div className="relative">
            <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-2xl" />
            <div className="relative bg-amber-500/10 p-6 rounded-full ring-1 ring-amber-500/20">
              <Crown className="w-16 h-16 text-amber-500" strokeWidth={1.5} />
            </div>
          </div>

          
          <div className="space-y-3">
            <h2 className="text-3xl font-semibold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              No Memberships Created
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Start earning from your content. Create membership tiers for your subscribers to support your work.
            </p>
          </div>

          <Button 
            size="lg" 
            className="mt-4 gap-2 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => window.location.href = '/creator/memberships/create'}
          >
            <Plus className="w-5 h-5" />
            Create Membership
          </Button>

          <p className="text-xs text-muted-foreground/60 pt-4">
            Offer Regular ($5) and Premium ($15) tiers to your audience
          </p>
        </div>
      </Card>
    </motion.div>
  );
};

export default NoMemberships;

