// pages/creator/CreatorRecommendations.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader, ExternalLink, UserPlus } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const CreatorRecommendations = () => {
  const navigate = useNavigate();
  const { creatorUrl } = useParams(); // Get creator URL from params
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [creator, setCreator] = useState(null);

  const fetchCreatorAndRecommendations = async () => {
    setIsLoading(true);
    try {
      // First fetch creator info to get creatorId
      const creatorRes = await api.get(`/creators/by-url/${creatorUrl}`);
      if (!creatorRes.data.success) {
        throw new Error('Creator not found');
      }
      const creatorData = creatorRes.data.data;
      setCreator(creatorData);

      const response = await api.get('/creators/recommendations/my-recommendations');
            if (response.data.success) {
              setRecommendations(response.data.data);
            }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast.error('Failed to load recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (creatorUrl) {
      fetchCreatorAndRecommendations();
    }
  }, [creatorUrl]);

  const navigateToCreator = (recommendedCreatorUrl) => {
    if (recommendedCreatorUrl) {
      navigate(`/c/${recommendedCreatorUrl}`);
    }
  };

  const getInitials = (name) => name?.charAt(0).toUpperCase() || '?';

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-black dark:text-white">
          {creator?.displayName || 'Creator'} Recommendations
        </h2>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
          Creators recommended by {creator?.displayName}
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader className="h-6 w-6 animate-spin text-gray-400 dark:text-zinc-600" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && recommendations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-gray-200 dark:border-zinc-700 rounded-xl bg-gray-50/30 dark:bg-zinc-900/30">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
            <UserPlus className="h-5 w-5 text-gray-400 dark:text-zinc-500" />
          </div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">No recommendations yet</h3>
          <p className="text-xs text-gray-400 dark:text-zinc-500">
            This creator hasn't recommended anyone yet
          </p>
        </div>
      )}

      {/* Recommendations Grid */}
      {!isLoading && recommendations.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recommendations.map((recommendation) => {
              const creatorData = recommendation.recommendedCreator || recommendation.recommendedCreatorId;
              
              return (
                <div
                  key={recommendation._id}
                  className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl p-4 hover:border-gray-200 dark:hover:border-zinc-700 transition-all cursor-pointer"
                  onClick={() => navigateToCreator(creatorData?.pageUrl)}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="shrink-0">
                      <Avatar className="h-12 w-12 rounded-full border border-gray-100 dark:border-zinc-700">
                        <AvatarImage src={creatorData?.profileImageUrl} />
                        <AvatarFallback className="bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-semibold">
                          {getInitials(creatorData?.fullName)}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-gray-900 dark:text-zinc-100 hover:underline truncate">
                        {creatorData?.fullName || 'Unknown Creator'}
                      </h3>
                      
                      {creatorData?.pageName && (
                        <p className="text-xs text-gray-500 dark:text-zinc-400 truncate mt-0.5">
                          @{creatorData.pageName}
                        </p>
                      )}

                      {/* Badges */}
                      {creatorData?.category && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          <Badge variant="secondary" className="text-xs px-1.5 py-0">
                            {creatorData.category}
                          </Badge>
                        </div>
                      )}

                      {/* Bio preview */}
                      {creatorData?.bio && (
                        <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-2 mt-2">
                          {creatorData.bio}
                        </p>
                      )}

                      {/* Visit link */}
                      <div className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 mt-2">
                        <ExternalLink className="h-3 w-3" />
                        Visit Profile
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-3 pt-2 border-t border-gray-50 dark:border-zinc-800">
                    <p className="text-xs text-gray-400 dark:text-zinc-500">
                      Recommended on {new Date(recommendation.recommendedAt || recommendation.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer count */}
          <p className="text-center text-xs text-gray-400 dark:text-zinc-500 mt-6">
            {recommendations.length} creator{recommendations.length !== 1 ? 's' : ''} recommended
          </p>
        </>
      )}
    </div>
  );
};

export default CreatorRecommendations;