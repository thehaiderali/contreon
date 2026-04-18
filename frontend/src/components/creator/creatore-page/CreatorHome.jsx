import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { api } from '@/lib/api';
import { Lock, FileText, Music, Video, ChevronLeft, ChevronRight } from 'lucide-react';

const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
};

const TYPE_ICONS = { text: FileText, audio: Music, video: Video };

const TypeIcon = ({ type, className = 'h-3.5 w-3.5' }) => {
  const Icon = TYPE_ICONS[type] ?? FileText;
  return <Icon className={className} />;
};

const Thumb = ({ post, className = '' }) =>
  post.thumbnailUrl ? (
    <img
      src={post.thumbnailUrl}
      alt={post.title}
      className={`w-full h-full object-cover ${className}`}
    />
  ) : (
    <div className={`w-full h-full bg-muted flex items-center justify-center ${className}`}>
      <TypeIcon type={post.type} className="h-10 w-10 text-muted-foreground/50" />
    </div>
  );

const LatestHero = ({ post, creatorUrl }) => {
  const navigate = useNavigate();
  if (!post) return null;
  
  return (
    <section className="mb-10">
      <h2 className="text-lg font-semibold mb-4 text-foreground">Latest post</h2>
      <div 
        onClick={() => navigate(`/c/${creatorUrl}/posts/${post._id}`)}
        className="flex flex-col md:flex-row gap-6 md:gap-10 items-start group cursor-pointer"
      >
        <div className="w-full md:w-[55%] aspect-video rounded-xl overflow-hidden bg-muted shrink-0 shadow-sm hover:shadow-md transition-shadow duration-200">
          <Thumb post={post} />
        </div>
        <div className="flex flex-col justify-center gap-3 flex-1 py-2">
          {post.isPaid && (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground w-fit">
              <Lock className="h-3 w-3" />
              Members only
            </span>
          )}
          <h3 className="text-xl md:text-2xl font-bold leading-snug group-hover:text-muted-foreground transition-colors duration-150">
            {post.title}
          </h3>
          <p className="text-sm text-muted-foreground">{formatDate(post.createdAt)}</p>
          {post.description && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mt-1">
              {post.description}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

const PopularCarousel = ({ posts, creatorUrl }) => {
  const ref = useRef(null);
  const navigate = useNavigate();
  const scroll = (dir) => ref.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });

  if (!posts?.length) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-1.5">
          Popular posts
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll(-1)}
            className="h-9 w-9 rounded-full border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll(1)}
            className="h-9 w-9 rounded-full border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto scrollbar-none pb-1"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {posts.map((post) => (
          <div
            key={post._id}
            onClick={() => navigate(`/c/${creatorUrl}/posts/${post._id}`)}
            style={{ scrollSnapAlign: 'start', minWidth: '30%', maxWidth: '320px' }}
            className="shrink-0 flex-1 rounded-xl overflow-hidden bg-card border border-border cursor-pointer group hover:border-border/80 hover:shadow-lg transition-all duration-200"
          >
            <div className="aspect-video w-full bg-muted relative overflow-hidden">
              <Thumb post={post} />
              {post.isPaid && (
                <span className="absolute top-2 right-2 flex items-center gap-1 bg-black/65 text-white text-[10px] px-2 py-0.5 rounded-full">
                  <Lock className="h-2.5 w-2.5" /> Paid
                </span>
              )}
              <span className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded capitalize">
                <TypeIcon type={post.type} className="h-3 w-3" />
                {post.type}
              </span>
            </div>
            <div className="px-3 py-3">
              <p className="text-sm font-semibold line-clamp-2 leading-snug group-hover:text-muted-foreground transition-colors duration-150">
                {post.title}
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">{formatDate(post.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const RecentList = ({ posts, creatorUrl }) => {
  const navigate = useNavigate();
  if (!posts?.length) return null;

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4 text-foreground">Recent posts</h2>
      <div className="flex flex-col divide-y divide-border">
        {posts.map((post) => (
          <div
            key={post._id}
            onClick={() => navigate(`/c/${creatorUrl}/posts/${post._id}`)}
            className="flex gap-4 py-4 -mx-2 px-2 rounded-lg cursor-pointer group hover:bg-muted/40 transition-colors duration-150"
          >
            <div className="w-32 h-[72] rounded-lg overflow-hidden bg-muted shrink-0">
              <Thumb post={post} />
            </div>
            <div className="flex flex-col justify-center gap-1.5 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground capitalize flex items-center gap-1">
                  <TypeIcon type={post.type} />
                  {post.type}
                </span>
                {post.isPaid && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    Members only
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold line-clamp-1 group-hover:text-muted-foreground transition-colors duration-150">
                {post.title}
              </p>
              {post.description && (
                <p className="text-xs text-muted-foreground line-clamp-1 leading-relaxed">
                  {post.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default function CreatorHome({ creatorUrl }) {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/creators/by-url/${creatorUrl}/posts`);
        if (res.data.success) setPosts(res.data.data || []);
        else setError(res.data.error || 'Failed to load posts');
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, [creatorUrl]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-6 h-6 rounded-full border-2 border-border border-t-foreground animate-spin" />
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-muted-foreground text-center py-20">{error}</p>;
  }

  const published = posts.filter((p) => p.isPublished);

  if (!published.length) {
    return (
      <div className="text-center py-24">
        <p className="text-sm text-muted-foreground">No posts published yet.</p>
      </div>
    );
  }

  const latest = published[0];
  const popular = published.slice(1, 7);
  const recent = published.slice(0, 12);

  return (
    <div>
      <LatestHero post={latest} creatorUrl={creatorUrl} />
      <PopularCarousel posts={popular} creatorUrl={creatorUrl} />
      <RecentList posts={recent} creatorUrl={creatorUrl} />
    </div>
  );
}