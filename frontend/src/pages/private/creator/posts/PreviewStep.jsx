import React from 'react';
import { Edit2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const PreviewStep = ({ videoUrl, thumbnailUrl, accessType, playbackId, assetId, videoDuration, onEdit, onUploadDifferent }) => {
  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const previewVideoUrl = accessType === 'free' ? videoUrl : videoUrl;

  return (
    <div className="container mx-auto py-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Video Preview</CardTitle>
            <CardDescription>Review your video before adding details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video
                  controls
                  className="w-full h-full"
                  src={previewVideoUrl}
                  poster={thumbnailUrl}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
              {accessType === 'paid' && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Duration: {formatDuration(videoDuration)}</span>
                  <Badge variant="outline">
                    <Check className="w-3 h-3 mr-1" />
                    Processed with Secure Playback
                  </Badge>
                </div>
              )}
            </div>

            {accessType === 'paid' && playbackId && assetId && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Playback ID</p>
                  <p className="text-sm font-mono truncate">{playbackId}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Asset ID</p>
                  <p className="text-sm font-mono truncate">{assetId}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={onUploadDifferent}
            className="flex-1"
          >
            Upload Different Video
          </Button>
          <Button
            onClick={onEdit}
            className="flex-1"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Continue to Edit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PreviewStep;