import { useState, useEffect } from 'react';
import MuxPlayer from '@mux/mux-player-react';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function MuxPlayerComponent({ playbackId, creatorUrl }) {
  const [signedUrl, setSignedUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSignedUrl = async () => {
      if (!playbackId) {
        setError('No playback ID provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const res = await api.get(`/content/video/${playbackId}`);
        console.log(res)
        if (res.data.success) {
          setSignedUrl(res.data.data.signedUrl);
        } else {
          setError('Failed to get signed URL');
        }
      } catch (err) {
        console.error('Error fetching signed URL:', err);
        setError(err.response?.data?.error || 'Failed to load video');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSignedUrl();
  }, [playbackId, creatorUrl]);

  if (isLoading) {
    return (
      <div className="w-full aspect-video flex items-center justify-center bg-black rounded-xl">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <span className="text-white text-sm">Loading video...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full aspect-video flex items-center justify-center bg-black rounded-xl">
        <div className="text-red-400 text-center">
          <p className="text-lg font-medium">Failed to load video</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video rounded-xl overflow-hidden bg-black">
      <MuxPlayer
        src={signedUrl}
        streamType="on-demand"
        metadata={{
          video_id: playbackId,
          video_title: 'Video',
        }}
        style={{ height: '100%', width: '100%' }}
        className="w-full h-full"
        accentColor="#6366f1"
      />
    </div>
  );
}