import React from 'react';
import { motion } from 'motion/react';
import { FolderOpen, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const NoCollections = () => {
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
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl" />
            <div className="relative bg-primary/10 p-6 rounded-full ring-1 ring-primary/20">
              <FolderOpen className="w-16 h-16 text-primary" strokeWidth={1.5} />
            </div>
          </div>

          
          <div className="space-y-3">
            <h2 className="text-3xl font-semibold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              No Collections Yet
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Organize your posts into collections. Create your first collection to start grouping your content.
            </p>
          </div>

          
          <Button 
            size="lg" 
            className="mt-4 gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => window.location.href = '/creator/collections/create'}
          >
            <Plus className="w-5 h-5" />
            Create Collection
          </Button>

          
          <p className="text-xs text-muted-foreground/60 pt-4">
            Collections help your subscribers find related content easily
          </p>
        </div>
      </Card>
    </motion.div>
  );
};

export default NoCollections;
