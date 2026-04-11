// components/RecommendationSearch.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Search, UserPlus, Check, X, Loader } from 'lucide-react';
import { debounce } from 'lodash';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const RecommendationSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [randomCreators, setRandomCreators] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [addingId, setAddingId] = useState(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Fetch random creators with same interests
  const fetchRandomCreators = async () => {
    setLoadingSuggestions(true);
    try {
      const response = await api.get('/creators/recommendations/suggestions');
      if (response.data.success) {
        setRandomCreators(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching random creators:', error);
      toast.error('Failed to load suggestions');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  useEffect(() => {
    fetchRandomCreators();
  }, []);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        setSearchResults([]);
        setShowDropdown(false);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await api.get(`/creators/recommendations/search?search=${query}`);
        if (response.data.success) {
          setSearchResults(response.data.data);
          setShowDropdown(true);
        }
      } catch (error) {
        console.error('Search error:', error);
        toast.error('Failed to search creators');
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleAddRecommendation = async (creatorId) => {
    setAddingId(creatorId);
    try {
      const response = await api.post('/creators/recommendations', {
        recommendedCreatorId: creatorId
      });

      if (response.data.success) {
        toast.success('Creator added to recommendations!');
        
        // Update both search results and random creators
        setSearchResults(prev => 
          prev.map(creator => 
            creator._id === creatorId 
              ? { ...creator, isAlreadyRecommended: true }
              : creator
          )
        );
        
        setRandomCreators(prev =>
          prev.map(creator =>
            creator._id === creatorId
              ? { ...creator, isAlreadyRecommended: true }
              : creator
          )
        );
        
        setShowDropdown(false);
        setSearchTerm('');
        setSearchResults([]);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add recommendation');
    } finally {
      setAddingId(null);
    }
  };

  const getInitials = (name) => {
    return name?.charAt(0).toUpperCase() || '?';
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Recommend Creators</h1>

      {/* Search Bar with Dropdown */}
      <div className="relative mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search creators by name..."
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
            className="pl-10"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSearchResults([]);
                setShowDropdown(false);
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Dropdown Results */}
        {showDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-96 overflow-auto">
            {isSearching ? (
              <div className="p-4 text-center text-gray-500">
                <Loader className="h-4 w-4 animate-spin inline mr-2" />
                Searching...
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((creator) => (
                <div
                  key={creator._id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 border-b last:border-b-0"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={creator.profileImageUrl} />
                      <AvatarFallback>{getInitials(creator.fullName)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{creator.fullName}</p>
                      {creator.pageName && (
                        <p className="text-sm text-gray-500">{creator.pageName}</p>
                      )}
                      {creator.interests?.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {creator.interests.slice(0, 2).map((interest, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAddRecommendation(creator._id)}
                    disabled={creator.isAlreadyRecommended || addingId === creator._id}
                    variant={creator.isAlreadyRecommended ? "secondary" : "default"}
                  >
                    {addingId === creator._id ? (
                      <>
                        <Loader className="h-3 w-3 mr-1 animate-spin" />
                        Adding...
                      </>
                    ) : creator.isAlreadyRecommended ? (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        Added
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-3 w-3 mr-1" />
                        Select
                      </>
                    )}
                  </Button>
                </div>
              ))
            ) : searchTerm ? (
              <div className="p-4 text-center text-gray-500">No creators found</div>
            ) : null}
          </div>
        )}
      </div>

      {/* Random Creators with Same Interests */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Suggested for You</h2>
        <p className="text-gray-600 mb-4">Creators with similar interests</p>
        
        {loadingSuggestions ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {randomCreators.map((creator) => (
              <Card key={creator._id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={creator.profileImageUrl} />
                        <AvatarFallback>{getInitials(creator.fullName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{creator.fullName}</h3>
                        {creator.pageName && (
                          <p className="text-sm text-gray-500">{creator.pageName}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddRecommendation(creator._id)}
                      disabled={creator.isAlreadyRecommended || addingId === creator._id}
                      variant={creator.isAlreadyRecommended ? "secondary" : "outline"}
                    >
                      {addingId === creator._id ? (
                        <>
                          <Loader className="h-3 w-3 mr-1 animate-spin" />
                          Adding...
                        </>
                      ) : creator.isAlreadyRecommended ? (
                        <>
                          <Check className="h-3 w-3 mr-1" />
                          Added
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-3 w-3 mr-1" />
                          Select
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {creator.bio && (
                    <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                      {creator.bio}
                    </p>
                  )}
                  
                  {creator.interests?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {creator.interests.slice(0, 3).map((interest, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                      {creator.interests.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{creator.interests.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {!loadingSuggestions && randomCreators.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No creators found with similar interests</p>
            <p className="text-sm mt-2">Try updating your profile interests</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationSearch;