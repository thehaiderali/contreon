import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Loader2, 
  Users, 
  Compass, 
  Play, 
  Headphones, 
  FileText,
  Lock,
  ThumbsUp,
  MessageCircle,
  Clock
} from 'lucide-react';
import { api } from '@/lib/api';

const SubscriberHome = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasSubscriptions, setHasSubscriptions] = useState(null);
  const observerRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    checkUserSubscriptions();
  }, []);

  useEffect(() => {
    if (hasSubscriptions === true) {
      fetchFeedData(false);
    }
  }, [hasSubscriptions]);

  useEffect(() => {
    if (hasSubscriptions === true && page > 1) {
      fetchFeedData(true);
    }
  }, [page]);

  const lastElementRef = useCallback((node) => {
    if (loadingFeed || loadingMore) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loadingFeed && !loadingMore) {
        setPage(prev => prev + 1);
      }
    }, { threshold: 0.1 });
    
    if (node) observerRef.current.observe(node);
  }, [loadingFeed, loadingMore, hasMore]);

  const checkUserSubscriptions = async () => {
    try {
      const response = await api.get('/subscriptions/my');
      const subscriptions = response.data?.data?.subscriptions || [];
      setHasSubscriptions(subscriptions.length > 0);
    } catch (error) {
      console.error('Error checking subscriptions:', error);
      setHasSubscriptions(false);
    } finally {
      setLoadingFeed(false);
    }
  };

  const fetchFeedData = async (isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoadingFeed(true);
    }

    try {
      const currentPage = isLoadMore ? page : 1;
      const response = await api.get(`/explore/feed?page=${currentPage}&limit=10`);
      const data = response.data?.data;

      if (data) {
        if (isLoadMore) {
          setPosts(prev => [...prev, ...data.posts]);
        } else {
          setPosts(data.posts || []);
        }
        setHasMore(data.hasMore || false);
      }
    } catch (error) {
      console.error('Error fetching feed:', error);
      if (!isLoadMore) {
        setPosts([]);
      }
    } finally {
      if (isLoadMore) {
        setLoadingMore(false);
      } else {
        setLoadingFeed(false);
      }
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getPostIcon = (type, isPaid) => {
    if (isPaid) return Lock;
    switch (type) {
      case 'video': return Play;
      case 'audio': return Headphones;
      case 'text': return FileText;
      default: return FileText;
    }
  };

  const handleRefresh = () => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
    fetchFeedData(false);
  };

  const handleExploreClick = () => {
    navigate("/home/explore");
  };

  if (loadingFeed && hasSubscriptions === null) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Loading your personalized feed...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (hasSubscriptions === false) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        <Card className="text-center border-dashed">
          <CardHeader>
            <div className="mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Users className="h-10 w-10 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">No Subscriptions Yet</CardTitle>
            <p className="text-muted-foreground mt-2">
              Your feed is empty because you haven't subscribed to any creators yet.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Button onClick={handleExploreClick} size="lg">
              <Compass className="mr-2 h-4 w-4" />
              Explore Creators
            </Button>

            <div className="pt-6 border-t">
              <p className="text-sm text-muted-foreground">
                Subscribe to creators to unlock premium content and personalize your feed
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Feed</h1>
          <p className="text-muted-foreground mt-2">
            Personalized content from creators you follow
            {posts.length > 0 && ` • ${posts.length} posts`}
          </p>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={loadingFeed || loadingMore}
        >
          {loadingFeed || loadingMore ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          Refresh
        </Button>
      </div>

      {loadingFeed && posts.length === 0 ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-muted" />
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted" />
                  <div className="flex-1">
                    <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground">
              Your subscribed creators haven't posted anything yet.
            </p>
            <Button variant="outline" className="mt-4" onClick={handleExploreClick}>
              Discover new creators
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-6">
            {posts.map((post, index) => {
              const PostIcon = getPostIcon(post.type, post.isPaid);
              const isLastElement = index === posts.length - 1;
              const creatorUrl = post.creatorId?.pageUrl || post.creatorId?._id;
              
              return (
                <Link 
                  key={post._id} 
                  to={`/c/${creatorUrl}/posts/${post._id}`}
                  ref={isLastElement ? lastElementRef : null}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    {post.thumbnailUrl && (
                      <div className="relative h-48 bg-muted">
                        <img 
                          src={post.thumbnailUrl} 
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                        {post.type === 'video' && post.videoDuration > 0 && (
                          <Badge className="absolute bottom-2 right-2 bg-black/70 text-white">
                            {formatDuration(post.videoDuration)}
                          </Badge>
                        )}
                        {post.isPaid && (
                          <Badge className="absolute top-2 right-2 bg-black/70 text-white">
                            <Lock className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <Avatar>
                            <AvatarImage src={post.creatorId?.profileImageUrl} />
                            <AvatarFallback>{post.creatorId?.fullName?.charAt(0) || 'C'}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <CardTitle className="text-xl hover:text-primary transition-colors line-clamp-1">
                              {post.title}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-sm text-muted-foreground">
                                {post.creatorId?.fullName || 'Unknown Creator'}
                              </span>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDate(post.createdAt)}
                              </span>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">
                                {post.views || 0} views
                              </span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="flex items-center gap-1 ml-2 shrink-0">
                          <PostIcon className="h-3 w-3" />
                          {post.type}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <p className="text-muted-foreground line-clamp-2">
                        {post.description || post.content || 'No description available'}
                      </p>
                    </CardContent>
                    
                    <CardFooter className="border-t pt-4 flex justify-between flex-wrap gap-2">
                      <div className="flex gap-4">
                        <Button variant="ghost" size="sm">
                          <ThumbsUp className="h-4 w-4 mr-2" />
                          {post.likes || 0}
                        </Button>
                        {post.commentsAllowed !== false && (
                          <Button variant="ghost" size="sm">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            {post.comments || 0}
                          </Button>
                        )}
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              );
            })}
          </div>

          {loadingMore && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {!hasMore && posts.length > 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                You've reached the end! Check back later for more content.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SubscriberHome;
