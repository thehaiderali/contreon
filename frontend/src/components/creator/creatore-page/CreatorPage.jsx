import React, { useEffect, useState } from 'react';
import { useParams, NavLink, Routes, Route, Navigate } from 'react-router';
import { api } from '@/lib/api';
import { Twitter, Instagram, Youtube, Github, Linkedin, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CreatorHome from './CreatorHome';
import CreatorPosts from './CreatorPosts';
import CreatorCollections from './CreatorCollections';
import CreatorMembership from './CreatorMembership';
import CreatorAbout from './CreatorAbout';
import PostViewer from './PostViewer';

const NAV_LINKS = [
  { label: 'Home', path: '' },
  { label: 'Posts', path: 'posts' },
  { label: 'Collections', path: 'collections' },
  { label: 'Membership', path: 'membership' },
  { label: 'About', path: 'about' },
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
  const [creator, setCreator] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const basePath = `/c/${creatorUrl}`;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-border border-t-foreground animate-spin" />
      </div>
    );
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
      <div className="relative h-64 md:h-80 overflow-hidden">
        {creator.bannerUrl ? (
          <img
            src={creator.bannerUrl}
            alt="banner"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : creator.avatarUrl ? (
          <img
            src={creator.avatarUrl}
            alt="banner"
            className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl"
          />
        ) : (
          <div className="absolute inset-0 bg-muted" />
        )}

        <div className="absolute inset-0 bg-black/50" />

        <div className="absolute top-4 right-4 z-10">
          <Button size="sm" className="font-semibold rounded-full px-5 shadow-lg">
            Upgrade
          </Button>
        </div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 gap-3">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 border-white/30 shadow-xl shrink-0">
            {creator.avatarUrl ? (
              <img src={creator.avatarUrl} alt={creator.displayName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-secondary flex items-center justify-center text-3xl font-bold text-foreground">
                {creator.displayName?.[0]?.toUpperCase()}
              </div>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
            {creator.displayName}
          </h1>

          {creator.bio && (
            <p className="text-white/75 text-sm md:text-base max-w-xl leading-relaxed line-clamp-2">
              {creator.bio}
            </p>
          )}

          {creator.socialLinks?.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              {creator.socialLinks.map((link, i) => {
                const href = typeof link === 'object' ? link.url : link;
                const Icon = getSocialIcon(href);
                return (
                  <a
                    key={i}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-150"
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>

<div className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md">
  <div className="max-w-5xl mx-auto px-4">
    <nav className="flex justify-center gap-8 overflow-x-auto scrollbar-none">
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
          <Route path="*" element={<Navigate to={basePath} replace />} />
        </Routes>
      </div>
    </div>
  );
}