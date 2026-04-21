import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
  Share2,
  Clock,
  ChevronDown,
  FlaskConical
} from 'lucide-react';
import { RefreshCw } from 'lucide-react';
const generateMockPosts = () => {
  const creators = [
    { _id: 'creator_1', name: 'Tech Guru', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TechGuru' },
    { _id: 'creator_2', name: 'Fitness Coach', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=FitnessCoach' },
    { _id: 'creator_3', name: 'Music Academy', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MusicAcademy' },
    { _id: 'creator_4', name: 'Art Masterclass', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ArtMaster' },
    { _id: 'creator_5', name: 'Coding Bootcamp', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CodingBootcamp' },
  ];

  const titles = {
    video: [
      'Complete Guide to Modern JavaScript',
      'React Hooks Deep Dive',
      'Building Scalable APIs with Node.js',
      'Full Stack Development Tutorial',
      'Database Design Best Practices',
      'Advanced CSS Techniques',
      'TypeScript Mastery Course',
      'Next.js 15 New Features',
      'Tailwind CSS Tips and Tricks',
      'GraphQL from Scratch'
    ],
    audio: [
      'The Future of AI in Development',
      'Mental Health for Developers',
      'Career Growth in Tech',
      'Remote Work Success Stories',
      'Tech Leadership Podcast',
      'Startup Funding Insights',
      'Cybersecurity Best Practices',
      'Cloud Computing Explained',
      'Agile Methodology Deep Dive',
      'DevOps Culture Transformation'
    ],
    text: [
      '10 Tips for Better Code Reviews',
      'How to Land Your Dream Job',
      'The Art of Debugging',
      'Clean Code Principles',
      'Technical Writing Guide',
      'Open Source Contribution Guide',
      'Interview Preparation Tips',
      'Freelancing Success Strategies',
      'Time Management for Developers',
      'Building Your Personal Brand'
    ]
  };

  const mockData = {};
  
  for (let page = 1; page <= 6; page++) {
    const pagePosts = [];
    for (let i = 0; i < 5; i++) {
      const type = ['video', 'audio', 'text'][Math.floor(Math.random() * 3)];
      const creator = creators[Math.floor(Math.random() * creators.length)];
      const isPaid = Math.random() > 0.3; // 70% are paid
      const titleIndex = (page * i) % titles[type].length;
      
      pagePosts.push({
        _id: `post_${page}_${i}`,
        title: titles[type][titleIndex],
        type: type,
        slug: titles[type][titleIndex].toLowerCase().replace(/ /g, '-'),
        content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.`,
        creatorId: creator,
        isPaid: isPaid,
        tierId: isPaid ? {
          _id: `tier_${creator._id}`,
          tierName: creator.name === 'Tech Guru' ? 'Pro Plan' : 
                    creator.name === 'Fitness Coach' ? 'Elite Membership' :
                    creator.name === 'Music Academy' ? 'Annual Pass' : 'Premium Access',
          price: Math.floor(Math.random() * 100) + 9.99
        } : null,
        isPublished: true,
        thumbnailUrl: `https://picsum.photos/seed/${page}_${i}_${type}/400/200`,
        videoDuration: type === 'video' ? Math.floor(Math.random() * 3600) + 300 : 0,
        audioUrl: type === 'audio' ? 'https://example.com/audio.mp3' : null,
        transcriptionUrl: type === 'audio' ? 'https://example.com/transcription.pdf' : null,
        description: type !== 'text' ? 'Comprehensive guide to mastering this topic' : null,
        speakers: type === 'audio' ? [
          { name: `Speaker ${Math.floor(Math.random() * 3) + 1}`, order: 1 },
          { name: `Speaker ${Math.floor(Math.random() * 3) + 2}`, order: 2 }
        ] : [],
        commentsAllowed: true,
        createdAt: new Date(Date.now() - (page * 86400000) - (i * 3600000)).toISOString(),
        likes: Math.floor(Math.random() * 500) + 10,
        comments: Math.floor(Math.random() * 100) + 1,
        views: Math.floor(Math.random() * 5000) + 100
      });
    }
    mockData[page] = pagePosts;
  }
  
  return mockData;
};

const mockPostsData = generateMockPosts();

const SubscriberHome = () => {
  const [hasSubscriptions, setHasSubscriptions] = useState(null);
  const [testMode, setTestMode] = useState(false);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerRef = useRef();

  useEffect(() => {
    checkUserSubscriptions();
  }, []);

  useEffect(() => {
    if (hasSubscriptions === true) {
      fetchFeedData(false);
    }
  }, [hasSubscriptions, page]);

  const lastElementRef = useCallback((node) => {
    if (loadingFeed || loadingMore) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loadingFeed && !loadingMore) {
        loadMorePosts();
      }
    }, { threshold: 0.1 });
    
    if (node) observerRef.current.observe(node);
  }, [loadingFeed, loadingMore, hasMore]);

  const checkUserSubscriptions = async () => {
    setInitialLoading(true);
    
    // TODO: Replace with actual API call
    // const response = await fetch('/api/user/subscriptions');
    // const data = await response.json();
    // setHasSubscriptions(data.hasSubscriptions);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Use test mode to override subscription check
    const mockHasSubscriptions = testMode ? false : true;
    setHasSubscriptions(mockHasSubscriptions);
    setInitialLoading(false);
  };

  const fetchFeedData = async (isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoadingFeed(true);
    }
    
    // TODO: Replace with actual API call
    // const response = await fetch(`/api/feed?page=${page}&limit=10`);
    // const data = await response.json();
    // if (isLoadMore) {
    //   setPosts(prev => [...prev, ...data.posts]);
    // } else {
    //   setPosts(data.posts);
    // }
    // setHasMore(data.hasMore);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const currentPageData = mockPostsData[page] || [];
    
    setTimeout(() => {
      if (isLoadMore) {
        setPosts(prev => [...prev, ...currentPageData]);
      } else {
        setPosts(currentPageData);
      }
      setHasMore(page < 6); // 6 pages total
      
      if (isLoadMore) {
        setLoadingMore(false);
      } else {
        setLoadingFeed(false);
      }
    }, 1000);
  };

  const loadMorePosts = () => {
    if (!loadingMore && hasMore && !loadingFeed) {
      setPage(prevPage => prevPage + 1);
    }
  };

  const handleLoadMoreClick = () => {
    loadMorePosts();
  };

  const handleTestModeToggle = async () => {
    setTestMode(!testMode);
    // Reset all states
    setPosts([]);
    setPage(1);
    setHasMore(true);
    setLoadingFeed(false);
    setLoadingMore(false);
    setInitialLoading(true);
    
    // Short delay to show toggle effect
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!testMode) {
      // Switching to test mode (no subscriptions)
      setHasSubscriptions(false);
      setInitialLoading(false);
    } else {
      // Switching back to normal mode
      setHasSubscriptions(true);
      setInitialLoading(false);
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

  const handleExploreClick = () => {
    // TODO: Navigate to explore creators page
    console.log('Navigate to explore creators');
  };

  const handleRefresh = () => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
    fetchFeedData(false);
  };

  // Loading state while checking subscriptions
  if (initialLoading || hasSubscriptions === null) {
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

  // No subscriptions state
  if (hasSubscriptions === false) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        {/* Test Mode Toggle */}
        <div className="mb-6 flex justify-end">
          <div className="flex items-center space-x-2 bg-muted/50 px-4 py-2 rounded-lg border">
            <FlaskConical className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="test-mode" className="text-sm cursor-pointer">
              Test Mode (No Subs)
            </Label>
            <Switch
              id="test-mode"
              checked={testMode}
              onCheckedChange={handleTestModeToggle}
            />
          </div>
        </div>

        <Card className="text-center border-dashed">
          <CardHeader>
            <div className="mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Users className="h-10 w-10 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">No Subscriptions Yet</CardTitle>
            <CardDescription className="text-base mt-2">
              Your feed is empty because you haven't subscribed to any creators yet.
              <br />
              Subscribe to your favorite creators to personalize your feed and see their exclusive content.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="flex justify-center gap-4 flex-wrap">
              <Button onClick={handleExploreClick} size="lg">
                <Compass className="mr-2 h-4 w-4" />
                Explore Creators
              </Button>
            </div>

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

  // Main feed view
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header with Test Toggle */}
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Feed</h1>
          <p className="text-muted-foreground mt-2">
            Personalized content from creators you follow
            {posts.length > 0 && ` • ${posts.length} posts`}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={loadingFeed || loadingMore}
          >
            {(loadingFeed || loadingMore) ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          
          <div className="flex items-center space-x-2 bg-muted/50 px-4 py-2 rounded-lg border">
            <FlaskConical className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="test-mode" className="text-sm cursor-pointer">
              Test Mode (No Subs)
            </Label>
            <Switch
              id="test-mode"
              checked={testMode}
              onCheckedChange={handleTestModeToggle}
            />
          </div>
        </div>
      </div>

      {/* Feed Content */}
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
      ) : (
        <>
          <div className="space-y-6">
            {posts.map((post, index) => {
              const PostIcon = getPostIcon(post.type, post.isPaid);
              const isLastElement = index === posts.length - 1;
              
              return (
                <Card 
                  key={post._id} 
                  ref={isLastElement ? lastElementRef : null}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Thumbnail */}
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
                        <Badge variant="secondary" className="absolute top-2 right-2 bg-black/70 text-white">
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
                          <AvatarImage src={post.creatorId.avatar} />
                          <AvatarFallback>{post.creatorId.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-xl hover:text-primary transition-colors cursor-pointer line-clamp-1">
                            {post.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-sm text-muted-foreground">{post.creatorId.name}</span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(post.createdAt)}
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">
                              {post.views} views
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
                      {post.content}
                    </p>
                    
                    {post.type === 'audio' && post.speakers && post.speakers.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {post.speakers.map((speaker, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {speaker.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter className="border-t pt-4 flex justify-between flex-wrap gap-2">
                    <div className="flex gap-4">
                      <Button variant="ghost" size="sm">
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        {post.likes}
                      </Button>
                      {post.commentsAllowed && (
                        <Button variant="ghost" size="sm">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          {post.comments}
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button variant="outline" size="sm">
                      Read More
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {/* Load More Button */}
          {hasMore && posts.length > 0 && (
            <div className="flex justify-center py-8">
              <Button
                onClick={handleLoadMoreClick}
                disabled={loadingMore}
                size="lg"
                variant="outline"
                className="min-w-[200px]"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading more...
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-2 h-4 w-4" />
                    Load More Posts
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Loading indicator for infinite scroll */}
          {loadingMore && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* End of Feed */}
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