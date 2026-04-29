import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { api } from '@/lib/api';
import { Loader2, Search, Filter, ChevronDown, Plus, MoreHorizontal, Pencil, Trash2, FileText, Music, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loader } from '../dashboard/Loader';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';

const TYPE_ICONS = { text: FileText, audio: Music, video: Video };

const TypeIcon = ({ type, className = 'h-3.5 w-3.5' }) => {
  const Icon = TYPE_ICONS[type] ?? FileText;
  return <Icon className={className} />;
};

const Thumb = ({ post }) =>
  post.thumbnailUrl ? (
    <img src={post.thumbnailUrl} alt={post.title} className="w-full h-full object-cover" />
  ) : (
    <div className="w-full h-full bg-muted flex items-center justify-center">
      <TypeIcon type={post.type} className="h-6 w-6 text-muted-foreground/40" />
    </div>
  );

const PostRow = ({ post, creatorUrl }) => {
  const navigate = useNavigate();
  
  return (
    <div 
      onClick={() => navigate(`/c/${creatorUrl}/posts/${post._id}`)}
      className="flex gap-4 py-4 -mx-2 px-2 rounded-lg cursor-pointer group hover:bg-muted/40 transition-colors duration-150"
    >
      <div className="w-36 h-20 rounded-lg overflow-hidden bg-muted shrink-0 relative">
        <Thumb post={post} />
        {post.isPaid && (
          <span className="absolute top-1.5 right-1.5 bg-black/65 text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1">
            <Lock className="h-2.5 w-2.5" />
          </span>
        )}
      </div>
      <div className="flex flex-col justify-center gap-1.5 min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground capitalize flex items-center gap-1">
            <TypeIcon type={post.type} />
            {post.type}
          </span>
          {post.isPaid && (
            <Badge variant="secondary" className="text-xs py-0 font-normal gap-1">
              <Lock className="h-2.5 w-2.5" />
              Members only
            </Badge>
          )}
        </div>
        <p className="text-sm font-semibold line-clamp-2 leading-snug group-hover:text-muted-foreground transition-colors duration-150">
          {post.title}
        </p>
        {post.description && (
          <p className="text-xs text-muted-foreground line-clamp-1 leading-relaxed">{post.description}</p>
        )}
        <p className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</p>
      </div>
    </div>
  );
};

const UpgradeSidebar = ({ creator }) => (
  <aside className="w-64 shrink-0 hidden lg:block space-y-5">
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
      <p className="font-semibold text-sm">Join Membership</p>
      <p className="text-xs text-muted-foreground leading-relaxed">
        Become a paid member to unlock exclusive posts, chats and more from{' '}
        <span className="text-foreground font-medium">{creator?.displayName ?? 'this creator'}</span>.
      </p>
      <Button size="sm" className="w-full font-semibold">
        Join
      </Button>
    </div>
  </aside>
);

const TYPES = ['all', 'text', 'audio', 'video'];

export default function CreatorPosts({ creatorUrl, creator }) {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.get(`/creators/by-url/${creatorUrl}/posts`);
        if (res.data.success) setPosts(res.data.data || []);
        else setError(res.data.error || 'Failed to load');
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, [creatorUrl]);

  const filtered = useMemo(
    () =>
      posts.filter((p) => {
        const matchType = activeType === 'all' || p.type === activeType;
        const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
        return matchType && matchSearch;
      }),
    [posts, activeType, search]
  );

  return (
    <div className="flex gap-8">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-5">
          <h1 className="text-2xl font-bold flex-1">Recent posts</h1>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 font-medium"
            onClick={() => setShowFilters((v) => !v)}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
            {activeType !== 'all' && (
              <span className="h-4 w-4 rounded-full bg-foreground text-background text-[10px] flex items-center justify-center font-semibold">
                1
              </span>
            )}
          </Button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts"
              className="pl-9 pr-8 h-9 w-44 text-sm"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="flex items-center gap-2 mb-4">
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setActiveType(t)}
                className={`px-3 py-1 text-xs rounded-full border font-medium capitalize transition-all duration-150 ${
                  activeType === t
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border text-muted-foreground hover:border-foreground/50 hover:text-foreground'
                }`}
              >
                {t === 'all' ? 'All types' : t}
              </button>
            ))}
          </div>
        )}

        <Separator className="mb-1" />

        {isLoading && (
          <div className="flex justify-center py-20">
            <Loader size="lg" />
          </div>
        )}

        {error && (
          <p className="text-sm text-muted-foreground text-center py-16">{error}</p>
        )}

        {!isLoading && !error && filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-16">
            {search || activeType !== 'all' ? 'No posts match your filters.' : 'No posts yet.'}
          </p>
        )}

        {!isLoading && !error && (
          <div className="divide-y divide-border">
            {filtered.map((post) => (
              <PostRow key={post._id} post={post} creatorUrl={creatorUrl} />
            ))}
          </div>
        )}
      </div>

      <UpgradeSidebar creator={creator} />
    </div>
  );
}