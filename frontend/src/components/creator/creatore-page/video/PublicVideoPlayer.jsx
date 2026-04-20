
import '@videojs/react/video/skin.css';
import { createPlayer, videoFeatures } from '@videojs/react';
import { VideoSkin, Video } from '@videojs/react/video';

const Player = createPlayer({ features: videoFeatures });

export default function PublicVideoPlayer({ videoUrl }) {
  return (
    <Player.Provider>
      <VideoSkin>
        <Video 
          src={videoUrl} 
          controls
          className="w-full max-w-3xl mx-auto rounded-2xl shadow-lg"
        />
      </VideoSkin>
    </Player.Provider>
  );
}