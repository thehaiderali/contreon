import React from 'react';
import { motion } from 'motion/react';
import { Crown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router';
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
            <div className="absolute inset-0 rounded-full blur-2xl" />
            <div className="relative bg-amber-500/10 p-6 rounded-full ring-1 ring-amber-500/20">
              <Crown className="w-16 h-16 " strokeWidth={1.5} />
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
          <Link to="/creator/memberships/create">
          <Button 
            size="lg" 
            className="mt-4 gap-2  shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            Create Membership
          </Button>
          </Link>
        </div>
      </Card>
    </motion.div>
  );
};

export default NoMemberships;

