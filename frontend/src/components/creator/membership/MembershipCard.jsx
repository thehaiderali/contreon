import React from 'react';
import { useNavigate } from 'react-router';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, Edit } from 'lucide-react';

const MembershipCard = ({ 
  id,
  tierName, 
  price, 
  perks, 
  description, 
  isActive 
}) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/creator/memberships/${id}/edit`);
  };

  return (
    <Card className={`w-full max-w-sm ${!isActive ? 'opacity-75' : ''}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{tierName}</CardTitle>
          <div className="flex gap-2">
            {!isActive && (
              <Badge variant="secondary">Inactive</Badge>
            )}
            {isActive && (
              <Badge variant="default">Active</Badge>
            )}
          </div>
        </div>
        <CardDescription>
          ${typeof price === 'number' ? price.toFixed(2) : price}/month
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {description && (
          <p className="text-sm text-gray-600">{description}</p>
        )}
        
        {perks && perks.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">What's included:</h4>
            <ul className="space-y-2">
              {perks.map((perk, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>{perk}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between items-center">
        <div className="text-xs text-gray-500">
          {isActive ? 'Available for subscription' : 'Currently unavailable'}
        </div>
        <Button 
          onClick={handleEdit} 
          variant="outline" 
          size="sm"
          className="gap-2"
        >
          <Edit className="h-4 w-4" />
          Edit
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MembershipCard;