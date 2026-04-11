// pages/creator/Recommendations.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, UserPlus, Loader, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const NoRecommendations = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch all recommendations
  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/creators/recommendations');
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

  // Delete recommendation
  const handleDelete = async (recommendedCreatorId) => {
    setDeletingId(recommendedCreatorId);
    try {
      const response = await api.delete(`/creators/recommendations/${recommendedCreatorId}`);
      
      if (response.data.success) {
        toast.success('Recommendation removed successfully');
        // Remove from state
        setRecommendations(prev => 
          prev.filter(rec => rec.recommendedCreatorId._id !== recommendedCreatorId)
        );
      }
    } catch (error) {
      console.error('Error deleting recommendation:', error);
      toast.error(error.response?.data?.message || 'Failed to remove recommendation');
    } finally {
      setDeletingId(null);
    }
  };

  const getInitials = (name) => {
    return name?.charAt(0).toUpperCase() || '?';
  };

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">My Recommendations</h1>
            <p className="text-gray-600 mt-1">
              Creators you recommend to your subscribers
            </p>
          </div>
          <Button
            onClick={() => navigate('/creator/recommendations/create')}
            className="gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Add New Recommendation
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && recommendations.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <UserPlus className="h-12 w-12 text-gray-400" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">No recommendations yet</h3>
                <p className="text-gray-500 mt-1">
                  Start recommending creators to your subscribers
                </p>
              </div>
              <Button
                onClick={() => navigate('/creator/recommendations/create')}
                variant="outline"
              >
                Add Your First Recommendation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations Grid */}
      {!isLoading && recommendations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((recommendation) => {
            const creator = recommendation.recommendedCreatorId;
            return (
              <Card key={recommendation._id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={creator.profileImageUrl} />
                        <AvatarFallback>{getInitials(creator.fullName)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{creator.fullName}</h3>
                        {creator.email && (
                          <p className="text-sm text-gray-500">{creator.email}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(creator._id)}
                      disabled={deletingId === creator._id}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      {deletingId === creator._id ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Additional Info if available from profile */}
                  {creator.pageName && (
                    <div className="mt-3">
                      <Badge variant="outline" className="text-xs">
                        {creator.pageName}
                      </Badge>
                    </div>
                  )}

                  {/* Recommendation Metadata */}
                  <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                    <p>Recommended on: {new Date(recommendation.recommendedAt).toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Stats */}
      {!isLoading && recommendations.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            You are recommending <span className="font-semibold">{recommendations.length}</span> creator{recommendations.length !== 1 ? 's' : ''} to your subscribers
          </p>
        </div>
      )}
    </div>
  );
};

export default NoRecommendations;