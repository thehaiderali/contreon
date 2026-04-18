import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { api } from '@/lib/api';
import { Lock, ArrowLeft, Play, Music, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const PostViewer = () => {
  const { creatorUrl, postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/creators/by-url/${creatorUrl}/posts/${postId}`);
        if (res.data.success) {
          setPost(res.data.data);
        } else {
          setError('Post not found');
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load post');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [creatorUrl, postId]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-6 h-6 rounded-full border-2 border-border border-t-foreground animate-spin" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="text-center py-24">
        <p className="text-muted-foreground">{error || 'Post not found'}</p>
        <Button onClick={() => navigate(`/c/${creatorUrl}/posts`)} className="mt-4">
          Back to posts
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate(`/c/${creatorUrl}/posts`)}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to posts
      </button>

      {/* Post header */}
      <div className="mb-6">
        {post.isPaid && (
          <Badge variant="secondary" className="mb-3 gap-1">
            <Lock className="h-3 w-3" />
            Members only
          </Badge>
        )}
        <h1 className="text-3xl md:text-4xl font-bold mb-3">{post.title}</h1>
        <p className="text-sm text-muted-foreground">
          {new Date(post.createdAt).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      </div>

      {/* Post content based on type */}
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        {post.type === 'text' && (
          <div 
            className="text-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content || post.description }}
          />
        )}

        {post.type === 'video' && (
          <div className="aspect-video rounded-xl overflow-hidden bg-black">
            {post.playbackId ? (
              <video
                src={`https://stream.mux.com/${post.playbackId}.m3u8`}
                controls
                className="w-full h-full"
                poster={post.thumbnailUrl}
              />
            ) : post.videoUrl ? (
              <video
                src={post.videoUrl}
                controls
                className="w-full h-full"
                poster={post.thumbnailUrl}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <Play className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>
        )}

        {post.type === 'audio' && (
          <div className="rounded-xl bg-muted p-6">
            {post.audioUrl ? (
              <audio controls className="w-full">
                <source src={post.audioUrl} />
                Your browser does not support the audio element.
              </audio>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <Music className="h-8 w-8 text-muted-foreground" />
                <span className="text-muted-foreground">Audio preview not available</span>
              </div>
            )}
          </div>
        )}

        {/* Description for audio/video */}
        {(post.type === 'audio' || post.type === 'video') && post.description && (
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="font-semibold mb-2">About this {post.type}</h3>
            <p className="text-muted-foreground leading-relaxed">{post.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostViewer;