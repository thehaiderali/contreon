// import React, { useState, useEffect } from 'react';
// import { Loader2, AlertCircle } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { toast } from 'sonner';
// import MuxUploader from '@mux/mux-uploader-react';
// import { api } from '@/lib/api';

// const PaidVideoUploadStep = ({ onUploadSuccess, onBack, isMountedRef }) => {
//   const [uploadUrl, setUploadUrl] = useState('');
//   const [uploadId, setUploadId] = useState(null);
//   const [uploadStatus, setUploadStatus] = useState('idle');
//   const [muxUploadProgress, setMuxUploadProgress] = useState(0);
//   const [uploadError, setUploadError] = useState(null);

//   useEffect(() => {
//     fetchUploadUrl();
//   }, []);

//   const fetchUploadUrl = async () => {
//     try {
//       const res = await api.post('/creators/mux-upload-url');
//       if (res.data.success) {
//         setUploadUrl(res.data.data.url);
//         setUploadId(res.data.data.uploadId);
//         setUploadStatus('ready');
//         console.log('Upload URL obtained:', res.data.data.url);
//       } else {
//         setUploadError('Failed to get upload URL');
//       }
//     } catch (error) {
//       if (!isMountedRef.current) return;
//       setUploadError('Error getting upload URL');
//       console.error(error);
//     }
//   };

//   useEffect(() => {
//     if (!uploadId) return;

//     let statusCheckInterval;
//     let isCancelled = false;

//     const startPolling = () => {
//       statusCheckInterval = setInterval(async () => {
//         if (isCancelled || !isMountedRef.current) {
//           if (statusCheckInterval) clearInterval(statusCheckInterval);
//           return;
//         }

//         try {
//           const res = await api.get(`/creators/mux-upload-status/${uploadId}`);
//           if (!isMountedRef.current || isCancelled) return;

//           if (res.data.success) {
//             const { status, playbackId, assetId, duration } = res.data.data;

//             console.log('Upload status:', status, 'Playback ID:', playbackId);

//             if (status === 'asset_ready' && playbackId) {
//               const signedUrl = await getSignedUrl(playbackId);
//               setUploadStatus('asset_ready');
//               toast.success('Video processed successfully!');
//               if (statusCheckInterval) clearInterval(statusCheckInterval);
              
//               if (isMountedRef.current) {
//                 onUploadSuccess({
//                   playbackId,
//                   assetId,
//                   duration: duration || 0,
//                   signedUrl
//                 });
//               }
//             } else if (status === 'errored') {
//               setUploadStatus('error');
//               setUploadError('Video processing failed. Please try again.');
//               if (statusCheckInterval) clearInterval(statusCheckInterval);
//             } else {
//               setUploadStatus(status);
//             }
//           }
//         } catch (err) {
//           console.error('Status check error:', err);
//           if (statusCheckInterval) clearInterval(statusCheckInterval);
//         }
//       }, 3000);
//     };

//     startPolling();

//     return () => {
//       isCancelled = true;
//       if (statusCheckInterval) clearInterval(statusCheckInterval);
//     };
//   }, [uploadId, onUploadSuccess, isMountedRef]);

//   const getSignedUrl = async (pbId) => {
//     try {
//       const res = await api.get(`/creators/mux-playback-url/${pbId}`);
//       if (!isMountedRef.current) return null;

//       if (res.data.success) {
//         console.log('Signed URL obtained');
//         return res.data.data.signedUrl;
//       }
//     } catch (error) {
//       if (!isMountedRef.current) return null;
//       console.error('Error getting signed URL:', error);
//       setUploadError('Error getting playback URL');
//       return null;
//     }
//   };

//   const handleMuxUploadSuccess = () => {
//     console.log('Upload successful, waiting for processing...');
//     setUploadStatus('processing');
//     toast.success('Upload complete! Processing video...');
//   };

//   const handleMuxUploadError = (err) => {
//     console.error('Upload error:', err);
//     setUploadStatus('error');
//     setUploadError('Upload failed. Please try again.');
//   };

//   const handleMuxUploadProgress = (event) => {
//     if (event.detail && event.detail.percentUploaded) {
//       setMuxUploadProgress(event.detail.percentUploaded);
//     }
//   };

//   return (
//     <div className="container mx-auto py-6">
//       <div className="mx-auto max-w-2xl">
//         <Card>
//           <CardHeader>
//             <CardTitle>Upload Paid/Exclusive Video</CardTitle>
//             <CardDescription>Upload your video for secure playback (No size limit)</CardDescription>
//           </CardHeader>
//           <CardContent>
//             {uploadStatus === 'idle' ? (
//               <div className="flex justify-center py-8">
//                 <Loader2 className="w-8 h-8 animate-spin" />
//                 <p className="ml-2 text-muted-foreground">Preparing upload...</p>
//               </div>
//             ) : uploadStatus === 'error' ? (
//               <div className="text-center py-8">
//                 <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
//                 <p className="text-destructive mb-4">Failed to initialize upload</p>
//                 <div className="flex gap-4">
//                   <Button variant="outline" onClick={onBack}>
//                     Back
//                   </Button>
//                   <Button onClick={fetchUploadUrl}>Try Again</Button>
//                 </div>
//               </div>
//             ) : uploadStatus === 'ready' && uploadUrl ? (
//               <div className="space-y-4">
//                 <div className="border-2 border-dashed rounded-lg p-8 text-center">
//                   <MuxUploader
//                     endpoint={uploadUrl}
//                     onSuccess={handleMuxUploadSuccess}
//                     onError={handleMuxUploadError}
//                     onProgress={handleMuxUploadProgress}
//                   />
//                   {muxUploadProgress > 0 && muxUploadProgress < 100 && (
//                     <div className="mt-4">
//                       <div className="w-full bg-muted rounded-full h-2">
//                         <div
//                           className="bg-primary h-2 rounded-full transition-all duration-300"
//                           style={{ width: `${muxUploadProgress}%` }}
//                         />
//                       </div>
//                       <p className="text-sm text-muted-foreground mt-2">
//                         {Math.round(muxUploadProgress)}% uploaded
//                       </p>
//                     </div>
//                   )}
//                 </div>
//                 <div className="flex gap-4">
//                   <Button
//                     variant="outline"
//                     onClick={onBack}
//                     className="flex-1"
//                   >
//                     Back
//                   </Button>
//                 </div>
//                 <p className="text-xs text-muted-foreground text-center">
//                   Supported formats: MP4, MOV, M4V (No size limit)
//                   <br />
//                   Videos will be processed with signed playback for security
//                 </p>
//               </div>
//             ) : uploadStatus === 'processing' ? (
//               <div className="flex flex-col items-center justify-center py-12">
//                 <Loader2 className="w-12 h-12 animate-spin mb-4" />
//                 <p className="text-center">Processing your video...</p>
//                 <p className="text-sm text-muted-foreground mt-2">
//                   This may take a few minutes depending on video length
//                 </p>
//               </div>
//             ) : null}

//             {uploadError && (
//               <Alert variant="destructive" className="mt-4">
//                 <AlertCircle className="h-4 w-4" />
//                 <AlertDescription>{uploadError}</AlertDescription>
//               </Alert>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default PaidVideoUploadStep;
import React, { useState, useEffect, useRef } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import MuxUploader from '@mux/mux-uploader-react';
import { api } from '@/lib/api';


const PaidVideoUploadStep = ({ onUploadSuccess, onBack }) => {
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadId, setUploadId] = useState(null);
  const [playbackId, setPlaybackId] = useState(null);
  const [assetId, setAssetId] = useState(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [signedUrl, setSignedUrl] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  
  const statusCheckInterval = useRef(null);

  useEffect(() => {
    fetchUploadUrl();
    return () => {
      if (statusCheckInterval.current) {
        clearInterval(statusCheckInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!uploadId || playbackId) return;

    if (statusCheckInterval.current) {
      clearInterval(statusCheckInterval.current);
    }

    statusCheckInterval.current = setInterval(async () => {
      try {
        const res = await api.get(`/creators/mux-upload-status/${uploadId}`);
        
        if (res.data.success) {
          const { status, playbackId: newPlaybackId, assetId: newAssetId, duration } = res.data.data;
          
          console.log('Upload status:', status, 'Playback ID:', newPlaybackId);
          
          if (status === 'asset_ready' && newPlaybackId) {
            setPlaybackId(newPlaybackId);
            setAssetId(newAssetId);
            setVideoDuration(duration || 0);
            const signedUrlResult = await getSignedUrl(newPlaybackId);
            setUploadStatus('asset_ready');
            toast.success('Video processed successfully!');
            if (statusCheckInterval.current) {
              clearInterval(statusCheckInterval.current);
            }
            
            onUploadSuccess({
              playbackId: newPlaybackId,
              assetId: newAssetId,
              duration: duration || 0,
              signedUrl: signedUrlResult
            });
          } else if (status === 'errored') {
            setUploadStatus('error');
            setUploadError('Video processing failed. Please try again.');
            if (statusCheckInterval.current) {
              clearInterval(statusCheckInterval.current);
            }
          } else {
            setUploadStatus(status);
            setUploadProgress(0);
          }
        }
      } catch (err) {
        console.error('Status check error:', err);
      }
    }, 3000);

    return () => {
      if (statusCheckInterval.current) {
        clearInterval(statusCheckInterval.current);
      }
    };
  }, [uploadId, playbackId, onUploadSuccess]);

  const fetchUploadUrl = async () => {
    try {
      const res = await api.post('/creators/mux-upload-url');
      
      if (res.data.success) {
        setUploadUrl(res.data.data.url);
        setUploadId(res.data.data.uploadId);
        setUploadStatus('ready');
        console.log('Upload URL obtained:', res.data.data.url);
      } else {
        setUploadError('Failed to get upload URL');
      }
    } catch (error) {
      setUploadError('Error getting upload URL');
      console.error(error);
    }
  };

  const getSignedUrl = async (pbId) => {
    try {
      const res = await api.get(`/creators/mux-playback-url/${pbId}`);
      
      if (res.data.success) {
        console.log('Signed URL obtained');
        setSignedUrl(res.data.data.signedUrl);
        return res.data.data.signedUrl;
      }
    } catch (error) {
      console.error('Error getting signed URL:', error);
      setUploadError('Error getting playback URL');
      return null;
    }
  };

  const handleUploadSuccess = () => {
    console.log('Upload successful, waiting for processing...');
    setUploadStatus('processing');
    toast.success('Upload complete! Processing video...');
  };

  const handleUploadError = (err) => {
    console.error('Upload error:', err);
    setUploadStatus('error');
    setUploadError('Upload failed. Please try again.');
  };

  const handleUploadProgress = (event) => {
    if (event.detail && event.detail.percentUploaded) {
      setUploadProgress(event.detail.percentUploaded);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Upload Paid/Exclusive Video</CardTitle>
            <CardDescription>Upload your video for secure playback (Max 10GB)</CardDescription>
          </CardHeader>
          <CardContent>
            {uploadStatus === 'idle' ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="ml-2 text-muted-foreground">Preparing upload...</p>
              </div>
            ) : uploadStatus === 'error' ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                <p className="text-destructive mb-4">Failed to initialize upload</p>
                <div className="flex gap-4">
                  <Button variant="outline" onClick={onBack}>
                    Back
                  </Button>
                  <Button onClick={fetchUploadUrl}>Try Again</Button>
                </div>
              </div>
            ) : !playbackId && uploadUrl ? (
              <div className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <MuxUploader
                    endpoint={uploadUrl}
                    onSuccess={handleUploadSuccess}
                    onError={handleUploadError}
                    onProgress={handleUploadProgress}
                  />
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="mt-4">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{Math.round(uploadProgress)}% uploaded</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={onBack}
                    className="flex-1"
                  >
                    Back
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Supported formats: MP4, MOV, M4V (Max 10GB)
                  <br />
                  Videos will be processed with signed playback for security
                </p>
              </div>
            ) : uploadStatus === 'processing' || (uploadStatus !== 'asset_ready' && uploadStatus !== 'error' && uploadId) ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                <p className="text-center">Processing your video...</p>
                <p className="text-sm text-muted-foreground mt-2">
                  This may take a few minutes depending on video length
                </p>
              </div>
            ) : null}

            {uploadError && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaidVideoUploadStep;