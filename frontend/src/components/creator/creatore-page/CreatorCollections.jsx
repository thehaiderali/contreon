import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { api } from '@/lib/api';
import {
  RotateCw, FolderOpen, FileText,
  Music, Video, ChevronRight,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

const TYPE_ICONS = { text: FileText, audio: Music, video: Video };

const TypeIcon = ({ type, className = 'h-3.5 w-3.5' }) => {
  const Icon = TYPE_ICONS[type] ?? FileText;
  return <Icon className={className} />;
};

const PublicCollectionCard = ({ collection, creatorUrl }) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const posts = collection.posts?.filter((p) => typeof p === 'object' && p.title) || [];

  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow duration-200 bg-card border-border">
      <button
        className="w-full text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <FolderOpen className="h-4.5 w-4.5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-base">{collection.title}</CardTitle>
                {collection.description && (
                  <CardDescription className="text-xs mt-0.5 line-clamp-2">
                    {collection.description}
                  </CardDescription>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 pt-0.5">
              <Badge variant="secondary" className="text-xs font-normal">
                {posts.length} {posts.length === 1 ? 'post' : 'posts'}
              </Badge>
              <ChevronRight
                className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                  expanded ? 'rotate-90' : ''
                }`}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground ml-12">
            Created {formatDate(collection.createdAt)}
          </p>
        </CardHeader>
      </button>

      {expanded && (
        <CardContent className="pt-0 pb-2">
          <div className="border-t border-border divide-y divide-border mt-1">
            {posts.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground text-center">
                No posts in this collection yet.
              </p>
            ) : (
              posts.map((post) => (
                <div
                  key={post._id}
                  onClick={() => navigate(`/c/${creatorUrl}/posts/${post._id}`)}
                  className="flex items-center gap-3 py-3 cursor-pointer group hover:bg-muted/30 -mx-6 px-6 transition-colors"
                >
                  {post.thumbnailUrl ? (
                    <img
                      src={post.thumbnailUrl}
                      alt={post.title}
                      className="h-10 w-16 rounded object-cover shrink-0"
                    />
                  ) : (
                    <div className="h-10 w-16 rounded bg-muted flex items-center justify-center shrink-0">
                      <TypeIcon type={post.type} className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium line-clamp-1 group-hover:text-muted-foreground transition-colors">
                      {post.title}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize flex items-center gap-1 mt-0.5">
                      <TypeIcon type={post.type} className="h-3 w-3" />
                      {post.type}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

const CreatorCollections = ({ creatorUrl }) => {
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCollections = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.get(`/creators/by-url/${creatorUrl}/collections`);
        if (res.data.success) {
          setCollections(res.data.data || []);
        } else {
          setError(res.data.error || 'Failed to load collections');
        }
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCollections();
  }, [creatorUrl]);

  if (isLoading)
    return (
      <div className="flex justify-center py-24">
        <RotateCw className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );

  if (error)
    return <p className="text-sm text-muted-foreground text-center py-16">{error}</p>;

  return (
    <div className="max-w-4xl pb-20">
      <h1 className="text-2xl font-bold mb-6">Collections</h1>

      {collections.length === 0 ? (
        <div className="text-center py-20 flex flex-col items-center gap-3">
          <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
            <FolderOpen className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No collections yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {collections.map((col) => (
            <PublicCollectionCard key={col._id} collection={col} creatorUrl={creatorUrl} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CreatorCollections;