import React, { useRef, useState } from 'react';
import { Upload, Loader2, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { uploadFiles } from '@/lib/uploadthing';

const FreeVideoUploadStep = ({ onUploadSuccess, onBack, isMountedRef }) => {
  const videoInputRef = useRef(null);
  const [videoFile, setVideoFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState('');

  const handleVideoFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ['video/mp4', 'video/mov', 'video/m4v', 'video/mpeg'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Please select a valid video file (MP4, MOV, M4V, MPEG)');
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      setUploadError('File size must be less than 500MB');
      return;
    }

    setVideoFile(file);
    setUploadError(null);
  };

  const handleUpload = async () => {
    if (!videoFile) {
      setUploadError('Please select a video file first');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 500);

      const result = await uploadFiles('videoUploader', {
        files: [videoFile]
      });

      clearInterval(progressInterval);

      if (!isMountedRef.current) return;

      setUploadProgress(100);
      const url = result[0].ufsUrl;
      setUploadedUrl(url);

      toast.success('Video uploaded successfully!');
      setTimeout(() => {
        if (isMountedRef.current) {
          onUploadSuccess(url);
        }
      }, 800);
    } catch (err) {
      if (!isMountedRef.current) return;
      console.error('Upload error:', err);
      setUploadError('Failed to upload video. Please try again.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  if (uploadedUrl) {
    return (
      <div className="container mx-auto py-6">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Upload Free Video</CardTitle>
              <CardDescription>Video uploaded successfully</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <Check className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <p className="text-lg font-semibold mb-2">Upload Complete!</p>
              <p className="text-muted-foreground mb-4">Your video has been uploaded successfully</p>
              <Button onClick={() => onUploadSuccess(uploadedUrl)}>
                Continue to Preview
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Upload Free Video</CardTitle>
            <CardDescription>Select a video file to upload (Max 500MB)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <input
                type="file"
                ref={videoInputRef}
                accept="video/mp4,video/mov,video/m4v,video/mpeg"
                onChange={handleVideoFileSelect}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => videoInputRef.current?.click()}
                disabled={isUploading}
                className="mb-4"
              >
                <Upload className="w-4 h-4 mr-2" />
                Select Video File
              </Button>
              {videoFile && (
                <div className="mt-4">
                  <p className="text-sm">
                    Selected: {videoFile.name}
                    <br />
                    Size: {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Uploading: {Math.round(uploadProgress)}%
                </p>
              </div>
            )}

            {uploadError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={onBack}
                className="flex-1"
                disabled={isUploading}
              >
                Back
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!videoFile || isUploading}
                className="flex-1"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload Video'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FreeVideoUploadStep;