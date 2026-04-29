
import React, { useEffect, useState } from 'react';
import { useParams, NavLink, Routes, Route, Navigate, useNavigate } from 'react-router';
import { api } from '@/lib/api';
import { Twitter, Instagram, Youtube, Github, Linkedin, Globe, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loader, PageLoader } from '../dashboard/Loader';
import CreatorHome from './CreatorHome';
import CreatorPosts from './CreatorPosts';
import CreatorCollections from './CreatorCollections';
import CreatorMembership from './CreatorMembership';
import CreatorAbout from './CreatorAbout';
import PostViewer from './PostViewer';
import { useAuthStore } from '@/store/authStore';
import chatService from '@/src/services/chatService';
import CreatorRecommendations from './CreatorRecommendations';
const NAV_LINKS = [
  { label: 'Home', path: '' },
  { label: 'Posts', path: 'posts' },
  { label: 'Collections', path: 'collections' },
  { label: 'Membership', path: 'membership' },
  { label: 'About', path: 'about' },
  {label:"Recommendations",path:'recommendations'}
];

const getSocialIcon = (url = '') => {
  if (url.includes('twitter') || url.includes('x.com')) return Twitter;
  if (url.includes('instagram')) return Instagram;
  if (url.includes('youtube')) return Youtube;
  if (url.includes('github')) return Github;
  if (url.includes('linkedin')) return Linkedin;
  return Globe;
};

export default function CreatorPage() {
  const { creatorUrl } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [creator, setCreator] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [avatarError, setAvatarError] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(false);
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    const fetchCreator = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/creators/by-url/${creatorUrl}`);
        if (res.data.success) setCreator(res.data.data);
        else setError('Creator not found');
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load creator');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCreator();
  }, [creatorUrl]);

  // Check subscription status if user is logged in as subscriber
  useEffect(() => {
    if (isAuthenticated && user?.role === 'subscriber' && creator?._id) {
      checkSubscriptionStatus();
    }
  }, [isAuthenticated, user, creator]);

  const checkSubscriptionStatus = async () => {
    try {
      setCheckingSubscription(true);
      const response = await api.get(`/subscriptions/check/${creator._id}`);
      setIsSubscribed(response.data.data.isSubscribed);
    } catch (error) {
      console.error('Failed to check subscription:', error);
      setIsSubscribed(false);
    } finally {
      setCheckingSubscription(false);
    }
  };

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      navigate('/login', { state: { from: `/c/${creatorUrl}` } });
      return;
    }

    if (user?.role !== 'subscriber') {
      alert('Only subscribers can message creators');
      return;
    }
    if (!isSubscribed) {
      // Redirect to membership page to subscribe
      navigate(`/c/${creatorUrl}/membership`);
      return;
    }

    setStartingChat(true);
    try {
      // Get or create conversation
      const response = await chatService.getOrCreateConversation(creator._id);
      const { conversationId } = response.data;
      
      // Navigate to subscriber chat with conversation ID
      navigate(`/subscriber/chats?conversation=${conversationId}`);
    } catch (error) {
      console.error('Failed to start chat:', error);
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else {
        alert('Failed to start conversation. Please try again.');
      }
    } finally {
      setStartingChat(false);
    }
  };

  const basePath = `/c/${creatorUrl}`;

  if (isLoading) {
    return <PageLoader />;
  }

  if (error || !creator) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">{error || 'Creator not found'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Banner */}
      <div className="relative h-48 md:h-64 lg:h-80 overflow-hidden">
        {creator.bannerUrl ? (
          <img
            src={creator.bannerUrl}
            alt="banner"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : creator.avatarUrl && !avatarError ? (
          <img
            src={creator.avatarUrl}
            alt="banner"
            className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-800" />
        )}

        <div className="absolute inset-0 bg-black/40" />

        {/* Action Buttons - Updated */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          {/* Chat Button - Only for subscribers */}
          {isAuthenticated && user?.role === 'subscriber' && (
            <Button 
              onClick={handleStartChat}
              disabled={startingChat || checkingSubscription}
              size="sm" 
              className="font-semibold rounded-full px-5 shadow-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {startingChat ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Starting...</span>
                </div>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {!isSubscribed ? 'Subscribe to Chat' : 'Message'}
                </>
              )}
            </Button>
          )}

          {/* Join/Subscribe Button */}
          <Button 
            size="sm" 
            className="font-semibold rounded-full px-5 shadow-lg bg-white text-black hover:bg-gray-100"
            onClick={() => navigate(`/c/${creatorUrl}/membership`)}
          >
            {isAuthenticated && user?.role === 'subscriber' && isSubscribed ? 'Manage' : 'Join'}
          </Button>
        </div>
      </div>

      {/* Profile Info Section */}
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <div className="relative">
          {/* Avatar - Circular */}
          <div className="absolute -top-12 md:-top-16 left-0 md:left-0 z-20">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-background shadow-xl bg-background">
              {creator.avatarUrl && !avatarError ? (
                <img 
                  src={creator.avatarUrl} 
                  alt={creator.displayName} 
                  className="w-full h-full object-cover"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary flex items-center justify-center text-4xl md:text-5xl font-bold text-foreground">
                  {creator.displayName?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Creator Info */}
          <div className="pt-14 md:pt-20 pb-6 pl-28 md:pl-36">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
              {creator.displayName}
            </h1>

            {creator.bio && (
              <p className="text-muted-foreground text-sm md:text-base max-w-2xl leading-relaxed mt-2">
                {creator.bio}
              </p>
            )}

            {creator.socialLinks?.length > 0 && (
              <div className="flex items-center gap-2 mt-4">
                {creator.socialLinks.map((link, i) => {
                  const href = typeof link === 'object' ? link.url : link;
                  const Icon = getSocialIcon(href);
                  return (
                    <a
                      key={i}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground hover:bg-foreground hover:text-background transition-all duration-150"
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4">
          <nav className="flex gap-6 md:gap-8 overflow-x-auto scrollbar-none">
            {NAV_LINKS.map(({ label, path }) => {
              const to = path ? `${basePath}/${path}` : basePath;
              return (
                <NavLink
                  key={label}
                  to={to}
                  end={path === ''}
                  className={({ isActive }) =>
                    `relative py-4 text-sm whitespace-nowrap font-medium transition-colors duration-150 ${
                      isActive
                        ? 'text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-foreground after:rounded-full'
                        : 'text-muted-foreground hover:text-foreground'
                    }`
                  }
                >
                  {label}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Page content */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 pb-32">
        <Routes>
          <Route index element={<CreatorHome creator={creator} creatorUrl={creatorUrl} />} />
          <Route path="posts" element={<CreatorPosts creator={creator} creatorUrl={creatorUrl} />} />
          <Route path="posts/:postId" element={<PostViewer />} />
          <Route path="collections" element={<CreatorCollections creatorUrl={creatorUrl} />} />
          <Route path="membership" element={<CreatorMembership creator={creator} creatorUrl={creatorUrl} />} />
          <Route path="about" element={<CreatorAbout creator={creator} />} />
          <Route path="recommendations" element={<CreatorRecommendations />} />
          <Route path="*" element={<Navigate to={basePath} replace />} />
        </Routes>
      </div>
    </div>
  );
}