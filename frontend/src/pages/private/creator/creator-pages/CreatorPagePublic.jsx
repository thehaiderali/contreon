import { api } from '@/lib/api';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarIcon, LockIcon, PlayIcon, FileTextIcon, MusicIcon, VideoIcon, CrownIcon, CheckCircleIcon } from 'lucide-react';
import { useMembershipStore } from '@/store/useMembershipStore';

const CreatorPagePublic = ({ creatorUrl }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [creatorProfile, setCreatorProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [membershipTiers, setMembershipTiers] = useState([]);
  const [isPostsLoading, setIsPostsLoading] = useState(false);
  const [isMembershipsLoading, setIsMembershipsLoading] = useState(false);
  
  // Get membership store actions and state
  const { fetchMemberships, hasAccess, memberships: userMemberships } = useMembershipStore();

  useEffect(() => {
    if (creatorUrl) {
      fetchCreatorData();
      fetchUserMemberships();
    }
  }, [creatorUrl]);

  const fetchUserMemberships = async () => {
    await fetchMemberships();
  };

  const fetchCreatorData = async () => {
    setIsLoading(true);
    try {
      // Fetch creator profile
      const profileResponse = await api.get(`/creators/page/${creatorUrl}/profile`);
      if (profileResponse.data.success) {
        console.log("Creator Profile:", profileResponse.data.data.profile);
        const profile = profileResponse.data.data.profile;
        setCreatorProfile(profile);
        
        // Fetch posts after getting creator profile
        await fetchCreatorPosts(profile.creatorId);
        
        // Fetch membership tiers for this creator
        await fetchCreatorMembershipTiers(profile.creatorId);
      }
    } catch (error) {
      console.error('Error fetching creator:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCreatorPosts = async (creatorId) => {
    setIsPostsLoading(true);
    try {
      const postsResponse = await api.get(`/creators/${creatorId}/posts?status=published`);
      if (postsResponse.data.success) {
        console.log("Post Data:", postsResponse.data.data);
        setPosts(postsResponse.data.data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsPostsLoading(false);
    }
  };

  const fetchCreatorMembershipTiers = async (creatorId) => {
    setIsMembershipsLoading(true);
    try {
      const response = await api.get(`/creators/${creatorId}/memberships`);
      if (response.data.success) {
        console.log("Membership Tiers Data:", response.data.data.memberShips);
        // Filter only active tiers
        const activeTiers = response.data.data.memberShips.filter(tier => tier.isActive === true);
        setMembershipTiers(activeTiers);
      }
    } catch (error) {
      console.error('Error fetching membership tiers:', error);
    } finally {
      setIsMembershipsLoading(false);
    }
  };

  const getPostIcon = (type) => {
    switch (type) {
      case 'video':
        return <VideoIcon className="h-5 w-5" />;
      case 'audio':
        return <MusicIcon className="h-5 w-5" />;
      default:
        return <FileTextIcon className="h-5 w-5" />;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleMembershipSubscribe = async (tierId) => {
    try {
      const response = await api.post(`/subscription-tiers/${tierId}/subscribe`);
      if (response.data.success) {
        // Refresh user memberships
        await fetchMemberships();
        alert('Successfully subscribed!');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      alert(error.response?.data?.message || 'Failed to subscribe. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Loading State */}
      {isLoading && (
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-64 w-full mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-80 w-full" />
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      {!isLoading && creatorProfile && (
        <>
          {/* Banner Section - Fixed */}
          <div className="relative h-64 md:h-80 lg:h-96 w-full bg-gradient-to-r from-purple-600 to-pink-600">
            {creatorProfile.bannerUrl && creatorProfile.bannerUrl !== '' ? (
              <img 
                src={creatorProfile.bannerUrl} 
                alt="Banner"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.classList.add('bg-gradient-to-r', 'from-purple-600', 'to-pink-600');
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-purple-600 to-pink-600" />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-40" />
            
            {/* Profile Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
              <div className="container mx-auto">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20 md:h-24 md:w-24 border-4 border-white">
                    <AvatarImage src={creatorProfile.profileImageUrl || creatorProfile.avatarUrl} />
                    <AvatarFallback>{creatorProfile.pageName?.charAt(0) || creatorProfile.fullName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold">{creatorProfile.pageName || creatorProfile.fullName}</h1>
                    <p className="text-gray-200 mt-1">@{creatorUrl}</p>
                    {creatorProfile.bio && (
                      <p className="text-sm text-gray-200 mt-2 max-w-2xl">{creatorProfile.bio}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Membership Tiers Section */}
          <div className="container mx-auto px-4 py-12 border-b">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <CrownIcon className="h-6 w-6 text-yellow-500" />
                Support {creatorProfile.pageName || creatorProfile.fullName}
              </h2>
              <p className="text-gray-600 mt-2">Choose a membership tier to access exclusive content</p>
            </div>

            {isMembershipsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-96 w-full" />
                ))}
              </div>
            ) : membershipTiers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {membershipTiers.map((tier) => {
                  const isMember = hasAccess(tier._id);
                  return (
                    <Card key={tier._id} className={`relative hover:shadow-xl transition-all duration-300 ${isMember ? 'border-green-500 border-2' : ''}`}>
                      {isMember && (
                        <Badge className="absolute top-4 right-4 bg-green-500">
                          <CheckCircleIcon className="h-3 w-3 mr-1" />
                          Active Member
                        </Badge>
                      )}
                      <CardHeader>
                        <CardTitle className="text-xl">{tier.tierName}</CardTitle>
                        <div className="mt-2">
                          <span className="text-3xl font-bold">${tier.price}</span>
                          <span className="text-gray-500">/month</span>
                        </div>
                        {tier.description && (
                          <CardDescription className="mt-2">
                            {tier.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {tier.perks && tier.perks.length > 0 ? (
                            tier.perks.map((perk, index) => (
                              <li key={index} className="flex items-center gap-2 text-sm">
                                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                <span>{perk}</span>
                              </li>
                            ))
                          ) : (
                            <li className="text-sm text-gray-500">No perks listed</li>
                          )}
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full"
                          variant={isMember ? "outline" : "default"}
                          onClick={() => handleMembershipSubscribe(tier._id)}
                          disabled={isMember}
                        >
                          {isMember ? 'Already a Member' : `Subscribe for $${tier.price}/month`}
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <CrownIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No membership tiers available</h3>
                <p className="text-gray-500 mt-2">This creator hasn't set up any membership tiers yet.</p>
              </div>
            )}
          </div>

          {/* Posts Section */}
          <div className="container mx-auto px-4 py-12">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Published Posts</h2>
              <p className="text-gray-600 mt-2">Explore content from this creator</p>
            </div>

            {isPostsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <Skeleton className="h-48 w-full" />
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => {
                  // Check if user has access to this post
                  const hasPostAccess = !post.isPaid || (post.tierId && hasAccess(post.tierId));
                  
                  return (
                    <Card key={post._id} className="hover:shadow-lg transition-shadow duration-300">
                      {/* Thumbnail */}
                      {post.thumbnailUrl && (
                        <div className="relative h-48 overflow-hidden rounded-t-lg">
                          <img 
                            src={post.thumbnailUrl} 
                            alt={post.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                          {post.isPaid && !hasPostAccess && (
                            <Badge className="absolute top-2 right-2 bg-yellow-500">
                              <LockIcon className="h-3 w-3 mr-1" />
                              Premium
                            </Badge>
                          )}
                          {post.type === 'video' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                              <PlayIcon className="h-12 w-12 text-white opacity-80" />
                            </div>
                          )}
                        </div>
                      )}

                      <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                          {getPostIcon(post.type)}
                          <Badge variant="secondary" className="capitalize">
                            {post.type}
                          </Badge>
                          {post.isPublished && (
                            <Badge variant="outline" className="bg-green-50">
                              Published
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                        {post.description && (
                          <CardDescription className="line-clamp-2">
                            {post.description}
                          </CardDescription>
                        )}
                      </CardHeader>

                      <CardContent>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            <span>{formatDate(post.createdAt)}</span>
                          </div>
                        </div>
                      </CardContent>

                      <CardFooter>
                        <Button 
                          variant={post.isPaid && !hasPostAccess ? "outline" : "default"} 
                          className="w-full"
                          onClick={() => {
                            if (post.isPaid && !hasPostAccess) {
                              // Redirect to membership page or show modal
                              alert('Subscribe to a membership tier to access this content');
                            } else {
                              // Navigate to post detail
                              window.location.href = `/post/${post.slug}`;
                            }
                          }}
                        >
                          {post.isPaid && !hasPostAccess ? (
                            <>
                              <LockIcon className="h-4 w-4 mr-2" />
                              Subscribe to Unlock
                            </>
                          ) : (
                            'Read More'
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No posts yet</h3>
                <p className="text-gray-500 mt-2">This creator hasn't published any posts yet.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CreatorPagePublic;