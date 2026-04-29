import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { api } from '@/lib/api';
import { Lock, ArrowLeft, Play, Music, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AudioPost from './post-view/AudioPost';
import PublicVideoPlayer from './video/PublicVideoPlayer';
import MuxPlayerComponent from './video/MuxPlayer';
import Comments from './post-view/Comments';
import { Loader } from '../dashboard/Loader';
import Editor from '../posts/Editor';

const PostViewer = () => {
  const { creatorUrl, postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requiresSubscription, setRequiresSubscription] = useState(false);

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
        if (err.response?.data?.requiresSubscription) {
          setRequiresSubscription(true);
          setError(err.response?.data?.error || 'Subscription required');
        } else {
          setError(err.response?.data?.error || 'Failed to load post');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [creatorUrl, postId]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader size="lg" />
      </div>
    );
  }

  if (requiresSubscription) {
    return (
      <div className="text-center py-24 px-4">
        <div className="rounded-full bg-muted p-4 mb-4 inline-flex">
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Members Only Content</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
          This content is available exclusively to paid members. Subscribe to unlock this and other exclusive content.
        </p>
        <Button onClick={() => navigate(`/c/${creatorUrl}/membership`)} className="gap-2">
          <Lock className="h-4 w-4" />
          Subscribe to Unlock
        </Button>
        <Button variant="ghost" onClick={() => navigate(`/c/${creatorUrl}/posts`)} className="ml-2">
          Back to posts
        </Button>
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
    <div className="w-full mx-auto">
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
        {/* <h1 className="text-3xl md:text-4xl font-bold mb-3">{post.title}</h1> */}
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
          <div className='w-full h-full  p-10 '>
              <Editor editable={false} initialContent={JSON.parse(post.content)} />
          </div>
        
        )}


    {post.type === 'video' && (
      <div className="aspect-video rounded-xl overflow-hidden bg-black">
        {post.playbackId ? (
          <MuxPlayerComponent playbackId={post.playbackId} creatorUrl={creatorUrl} />
        ) : post.videoUrl ? (
          <PublicVideoPlayer videoUrl={post.videoUrl} />
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
             <AudioPost post={post}/>
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

        {/* Comments Section */}
        <Comments 
          postId={postId} 
          creatorUrl={creatorUrl} 
          commentsAllowed={post.commentsAllowed} 
        />
      </div>
    </div>
  );
};

export default PostViewer;