// components/ProtectedContent.jsx
import React from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import useSubscriptionStore from '../../store/memberShipStore';
import { useNavigate } from 'react-router';

const ProtectedContent = ({ 
  requiredTierId,
  creatorId,
  children, 
  fallback,
  showUpgradePrompt = true,
  postTitle = "This content"
}) => {
  const { hasAccess, hasAccessToCreator, getSubscriptionByTierId } = useSubscriptionStore();
  const navigate = useNavigate();
  
  // Check access based on props
  let hasAccess_ = false;
  
  if (requiredTierId) {
    hasAccess_ = hasAccess(requiredTierId);
  } else if (creatorId) {
    hasAccess_ = hasAccessToCreator(creatorId);
  }
  
  if (hasAccess_) {
    return <>{children}</>;
  }
  
  if (fallback) {
    return <>{fallback}</>;
  }
  
  if (showUpgradePrompt) {
    const subscription = requiredTierId ? getSubscriptionByTierId(requiredTierId) : null;
    
    return (
      <Card className="border-dashed border-primary/30 bg-muted/20">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Members Only Content</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md">
            {postTitle} is available exclusively to paid members. 
            Subscribe to unlock this and other exclusive content.
          </p>
          <Button 
            onClick={() => navigate(`/c/${creatorId}/membership`)}
            className="gap-2"
          >
            <Lock className="h-4 w-4" />
            Subscribe to Unlock
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return null;
};

export default ProtectedContent;