import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Crown, Gift, ArrowRight, ShoppingBag } from 'lucide-react';

const NoSubscriptions = ({  onExploreClick }) => {
  const featuredCategories = [
    {
      icon: Crown,
      title: "Premium Content",
      description: "Exclusive tutorials, courses, and resources"
    },
    {
      icon: Gift,
      title: "Creator Perks",
      description: "Special discounts and early access"
    },
    {
      icon: Sparkles,
      title: "Community Access",
      description: "Join exclusive creator communities"
    }
  ];

  return (
    <div className="container mx-auto py-12 px-4 max-w-6xl">
      {/* Main Empty State Card */}
      <Card className="text-center border-dashed">
        <CardHeader>
          <div className="mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">No Active Memberships</CardTitle>
          <CardDescription className="text-base mt-2">
            You haven't subscribed to any creators yet.
            <br />
            Discover amazing content and support your favorite creators.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex justify-center gap-4 flex-wrap">
            <Button onClick={onExploreClick} variant="outline" size="lg">
              Explore Creators
            </Button>
          </div>

          {/* Featured Categories Section */}
          <div className="pt-6">
            <p className="text-sm text-muted-foreground mb-4">Popular membership categories</p>
            <div className="grid gap-4 md:grid-cols-3">
              {featuredCategories.map((category, index) => {
                const IconComponent = category.icon;
                return (
                  <div key={index} className="flex flex-col items-center p-4 rounded-lg border bg-card">
                    <IconComponent className="h-8 w-8 mb-2 text-muted-foreground" />
                    <h3 className="font-medium text-sm">{category.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{category.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>

      </Card>
    </div>
  );
};

export default NoSubscriptions;