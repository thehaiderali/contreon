
import '@videojs/react/video/skin.css';
import { createPlayer, videoFeatures } from '@videojs/react';
import { VideoSkin, Video } from '@videojs/react/video';

const Player = createPlayer({ features: videoFeatures });

export default function PublicVideoPlayer({ videoUrl }) {
  return (
    <Player.Provider>
      <VideoSkin>
        <div className="w-full max-w-3xl mx-auto rounded-2xl shadow-lg overflow-hidden bg-black aspect-video">
          <Video 
            src={videoUrl}
            className="w-full h-full"
          />
        </div>
      </VideoSkin>
    </Player.Provider>
  );
}