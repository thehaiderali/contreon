import React from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const NoShop = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full min-h-[70vh] flex items-center justify-center p-8"
    >
      <Card className="max-w-2xl w-full bg-linear-to-br from-background to-muted/30 border-border shadow-xl">
        <div className="flex flex-col items-center text-center p-12 space-y-6">
          {/* Icon Container */}
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl" />
            <div className="relative bg-emerald-500/10 p-6 rounded-full ring-1 ring-emerald-500/20">
              <ShoppingBag className="w-16 h-16 text-emerald-500" strokeWidth={1.5} />
            </div>
          </div>

          {/* Text Content */}
          <div className="space-y-3">
            <h2 className="text-3xl font-semibold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Shop is Empty
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Sell digital products, merchandise, or exclusive content. Add your first product to start earning.
            </p>
          </div>

          {/* Create Button */}
          <Button 
            size="lg" 
            className="mt-4 gap-2 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => window.location.href = '/creator/shop/create'}
          >
            <Plus className="w-5 h-5" />
            Add Product
          </Button>

          {/* Subtle Hint */}
          <p className="text-xs text-muted-foreground/60 pt-4">
            Sell e-books, courses, presets, or physical merchandise
          </p>
        </div>
      </Card>
    </motion.div>
  );
};

export default NoShop;
