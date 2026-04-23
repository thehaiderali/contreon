import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, UserPlus, Loader, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const Recommendations = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
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
    fetchRecommendations();
  }, []);

  const handleDelete = async (recommendationId, recommendedCreatorId) => {
    setDeletingId(recommendedCreatorId);
    try {
      const response = await api.delete(`/creators/recommendations/${recommendationId}`);
      if (response.data.success) {
        toast.success('Recommendation removed successfully');
        setRecommendations(prev => prev.filter(rec => rec._id !== recommendationId));
      }
    } catch (error) {
      console.error('Error deleting recommendation:', error);
      toast.error(error.response?.data?.message || 'Failed to remove recommendation');
    } finally {
      setDeletingId(null);
    }
  };

  const getInitials = (name) => name?.charAt(0).toUpperCase() || '?';

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 transition-colors">
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-black dark:hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>

        {/* Header */}
        <div className="flex items-end justify-between mb-10 pb-8 border-b border-gray-100 dark:border-zinc-800">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white">My Recommendations</h1>
            <p className="text-sm text-gray-400 dark:text-zinc-500 mt-1.5">
              Creators you recommend to your subscribers
            </p>
          </div>
          <button
            onClick={() => navigate('/creator/recommendations/create')}
            className="inline-flex items-center gap-2 bg-black text-white dark:bg-white dark:text-black text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-800 dark:hover:bg-zinc-200 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Add Recommendation
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center items-center py-24">
            <Loader className="h-6 w-6 animate-spin text-gray-300 dark:text-zinc-600" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && recommendations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 rounded-full border-2 border-dashed border-gray-200 dark:border-zinc-700 flex items-center justify-center mb-5">
              <UserPlus className="h-6 w-6 text-gray-300 dark:text-zinc-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-zinc-100 mb-1">No recommendations yet</h3>
            <p className="text-sm text-gray-400 dark:text-zinc-500 mb-6 max-w-xs">
              Start recommending creators to your subscribers
            </p>
            <button
              onClick={() => navigate('/creator/recommendations/create')}
              className="inline-flex items-center gap-2 border border-gray-200 dark:border-zinc-700 text-sm font-medium px-4 py-2 rounded-lg text-gray-700 dark:text-zinc-300 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-colors"
            >
              Add Your First Recommendation
            </button>
          </div>
        )}

        {/* Grid */}
        {!isLoading && recommendations.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map((recommendation) => {
                const creatorData = recommendation.recommendedCreator || recommendation.recommendedCreatorId;
                const isDeleting = deletingId === creatorData?._id;

                return (
                  <div
                    key={recommendation._id}
                    className="group relative border border-gray-100 dark:border-zinc-800 rounded-xl p-5 hover:border-gray-300 dark:hover:border-zinc-600 hover:shadow-sm dark:hover:shadow-none transition-all bg-white dark:bg-zinc-900"
                  >
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(recommendation._id, creatorData?._id)}
                      disabled={isDeleting}
                      className="absolute top-4 right-4 p-1.5 rounded-md text-gray-300 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      {isDeleting
                        ? <Loader className="h-3.5 w-3.5 animate-spin" />
                        : <Trash2 className="h-3.5 w-3.5" />
                      }
                    </button>

                    {/* Avatar + Name */}
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="h-10 w-10 rounded-full border border-gray-100 dark:border-zinc-700 shrink-0">
                        <AvatarImage src={creatorData?.profileImageUrl} />
                        <AvatarFallback className="bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-semibold">
                          {getInitials(creatorData?.fullName || creatorData?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-gray-900 dark:text-zinc-100 truncate">
                          {creatorData?.fullName || 'Unknown Creator'}
                        </p>
                        {creatorData?.email && (
                          <p className="text-xs text-gray-400 dark:text-zinc-500 truncate">{creatorData.email}</p>
                        )}
                      </div>
                    </div>

                    {/* Badges */}
                    {(creatorData?.pageName || creatorData?.category) && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {creatorData?.pageName && (
                          <span className="inline-block text-xs px-2 py-0.5 rounded-full border border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400">
                            {creatorData.pageName}
                          </span>
                        )}
                        {creatorData?.category && (
                          <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300">
                            {creatorData.category}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Bio */}
                    {creatorData?.bio && (
                      <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-4">
                        {creatorData.bio}
                      </p>
                    )}

                    {/* Date */}
                    <p className="text-xs text-gray-300 dark:text-zinc-600 border-t border-gray-50 dark:border-zinc-800 pt-3 mt-auto">
                      Added {new Date(recommendation.recommendedAt || recommendation.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Footer count */}
            <p className="text-center text-xs text-gray-300 dark:text-zinc-600 mt-8">
              {recommendations.length} creator{recommendations.length !== 1 ? 's' : ''} recommended
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Recommendations;