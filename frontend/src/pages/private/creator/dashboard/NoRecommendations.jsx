import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const NoRecommendations = () => {
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
            <div className="absolute inset-0  rounded-full blur-2xl" />
            <div className="relative bg-purple-500/10 p-6 rounded-full ring-1 ring-white">
              <Sparkles className="w-16 h-16 " strokeWidth={1.5} />
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-semibold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              No Recommendations Yet
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Recommend other creators to your audience. Build a community and grow together.
            </p>
          </div>

          <Button 
            size="lg" 
            className="mt-4 gap-2  shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => window.location.href = '/creator/recommendations/create'}
          >
            <Plus className="w-5 h-5" />
            Add Recommendation
          </Button>

          <p className="text-xs text-muted-foreground/60 pt-4">
            Cross-promote with other creators to grow your audience
          </p>
        </div>
      </Card>
    </motion.div>
  );
};

export default NoRecommendations;