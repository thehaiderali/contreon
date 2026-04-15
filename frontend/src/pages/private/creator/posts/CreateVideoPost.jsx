// import React, { useState, useEffect } from 'react';
// import MuxUploader from '@mux/mux-uploader-react';
// import { api } from '@/lib/api';

// const TestVideoUpload = () => {
//   const [uploadUrl, setUploadUrl] = useState("");
//   const [uploadId, setUploadId] = useState(null);
//   const [playbackId, setPlaybackId] = useState(null);
//   const [signedUrl, setSignedUrl] = useState(null);
//   const [status, setStatus] = useState('idle');
//   const [message, setMessage] = useState('');

//   const fetchUploadUrl = async () => {
//     try {
//       const res = await api.post("/creators/mux-upload-url");
//       if (res.data.success) {
//         setUploadUrl(res.data.data.url);
//         setUploadId(res.data.data.uploadId);
//         setMessage('Ready to upload');
//       }
//     } catch (error) {
//       setMessage('Error getting upload URL');
//     }
//   };

//   useEffect(() => {
//     fetchUploadUrl();
//   }, []);

//   useEffect(() => {
//     if (!uploadId || status !== 'processing') return;

//     const interval = setInterval(async () => {
//       try {
//         const res = await api.get(`/creators/mux-upload-status/${uploadId}`);
//         if (res.data.success) {
//           const { status: uploadStatus, playbackId: newPlaybackId } = res.data.data;
          
//           console.log('Status:', uploadStatus, 'Playback ID:', newPlaybackId);
          
//           if (uploadStatus === 'asset_ready' && newPlaybackId) {
//             setPlaybackId(newPlaybackId);
//             await getSignedUrl(newPlaybackId);
//             setStatus('success');
//             setMessage('Video ready!');
//             clearInterval(interval);
//           } else if (uploadStatus === 'errored') {
//             setStatus('error');
//             setMessage('Processing failed');
//             clearInterval(interval);
//           }
//         }
//       } catch (error) {
//         console.error('Status check error:', error);
//       }
//     }, 3000);

//     return () => clearInterval(interval);
//   }, [uploadId, status]);

//   const getSignedUrl = async (playbackId) => {
//     try {
//       const res = await api.get(`/creators/mux-playback-url/${playbackId}`);
//       if (res.data.success) {
//         setSignedUrl(res.data.data.signedUrl);
//         console.log('Signed URL:', res.data.data.signedUrl);
//       }
//     } catch (error) {
//       console.error('Error getting signed URL:', error);
//       setMessage('Error getting playback URL');
//     }
//   };

//   const handleSuccess = () => {
//     setStatus('processing');
//     setMessage('Upload complete! Processing...');
//   };

//   const handleError = () => {
//     setStatus('error');
//     setMessage('Upload failed');
//   };

//   return (
//     <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
//       <h2>Test Video Upload (Signed Playbacks)</h2>
      
//       <div style={{ margin: '20px 0' }}>
//         <p><strong>Status:</strong> {status}</p>
//         <p><strong>Message:</strong> {message}</p>
//         {playbackId && <p><strong>Playback ID:</strong> {playbackId}</p>}
//       </div>

//       {!playbackId && uploadUrl && (
//         <div>
//           <MuxUploader
//             endpoint={uploadUrl}
//             onSuccess={handleSuccess}
//             onError={handleError}
//           />
//         </div>
//       )}

//       {signedUrl && (
//         <div style={{ marginTop: '20px' }}>
//           <h3>Video Preview (Signed)</h3>
//           <video
//             controls
//             style={{ width: '100%' }}
//             src={signedUrl}
//           />
//         </div>
//       )}

//       <button 
//         onClick={() => {
//           setStatus('idle');
//           setPlaybackId(null);
//           setSignedUrl(null);
//           setUploadId(null);
//           fetchUploadUrl();
//         }}
//         style={{ marginTop: '20px', padding: '10px' }}
//       >
//         Reset
//       </button>
//     </div>
//   );
// };

// export default TestVideoUpload;

// import React, { useState, useRef, useEffect } from 'react';
// import { Upload, Video, Check, AlertCircle, Loader2, Edit2, DollarSign, MessageSquare, Lock, Play } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { Badge } from '@/components/ui/badge';
// import { Switch } from '@/components/ui/switch';
// import { Label } from '@/components/ui/label';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { api } from '@/lib/api';
// import { toast } from 'sonner';
// import { useLocation, useNavigate } from 'react-router';
// import MuxUploader from '@mux/mux-uploader-react';
// import { uploadFiles } from '@/lib/uploadthing';

// const CreateVideoPost = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [currentStep, setCurrentStep] = useState('upload');
  
//   // Mux upload states
//   const [uploadUrl, setUploadUrl] = useState("");
//   const [uploadId, setUploadId] = useState(null);
//   const [playbackId, setPlaybackId] = useState(null);
//   const [assetId, setAssetId] = useState(null);
//   const [videoDuration, setVideoDuration] = useState(0);
//   const [signedUrl, setSignedUrl] = useState(null);
//   const [uploadStatus, setUploadStatus] = useState('idle');
//   const [uploadProgress, setUploadProgress] = useState(0);
  
//   const [postTitle, setPostTitle] = useState('');
//   const [postDescription, setPostDescription] = useState('');
//   const [thumbnailUrl, setThumbnailUrl] = useState('');
//   const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);

//   const [isPaid, setIsPaid] = useState(false);
//   const [commentsAllowed, setCommentsAllowed] = useState(true);
//   const [selectedTierId, setSelectedTierId] = useState('');
  
//   const [creatorTiers, setCreatorTiers] = useState([]);
//   const [isLoadingTiers, setIsLoadingTiers] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState(null);
  
//   const thumbnailInputRef = useRef(null);
//   const statusCheckInterval = useRef(null);

//   // ✅ FIX #1: Fetch upload URL on component mount
//   useEffect(() => {
//     fetchUploadUrl();
//     return () => {
//       if (statusCheckInterval.current) {
//         clearInterval(statusCheckInterval.current);
//       }
//     };
//   }, []);

//   // ✅ FIX #2: Poll for upload status ONLY when we have an uploadId and no playbackId yet
//   useEffect(() => {
//     if (!uploadId || playbackId) return; // Stop polling once playbackId is received

//     if (statusCheckInterval.current) {
//       clearInterval(statusCheckInterval.current);
//     }

//     statusCheckInterval.current = setInterval(async () => {
//       try {
//         const res = await api.get(`/creators/mux-upload-status/${uploadId}`);
//         if (res.data.success) {
//           const { status, playbackId: newPlaybackId, assetId: newAssetId, duration } = res.data.data;
          
//           console.log('Upload status:', status, 'Playback ID:', newPlaybackId);
          
//           if (status === 'asset_ready' && newPlaybackId) {
//             setPlaybackId(newPlaybackId);
//             setAssetId(newAssetId);
//             setVideoDuration(duration || 0);
//             await getSignedUrl(newPlaybackId);
//             setUploadStatus('asset_ready');
//             setCurrentStep('preview');
//             toast.success('Video processed successfully!');
//             if (statusCheckInterval.current) {
//               clearInterval(statusCheckInterval.current);
//             }
//           } else if (status === 'errored') {
//             setUploadStatus('error');
//             setError('Video processing failed. Please try again.');
//             if (statusCheckInterval.current) {
//               clearInterval(statusCheckInterval.current);
//             }
//           } else {
//             setUploadStatus(status);
//             setUploadProgress(0); // Reset progress during processing
//           }
//         }
//       } catch (err) {
//         console.error('Status check error:', err);
//       }
//     }, 3000);

//     return () => {
//       if (statusCheckInterval.current) {
//         clearInterval(statusCheckInterval.current);
//       }
//     };
//   }, [uploadId, playbackId]); // ✅ Depend on playbackId to stop polling

//   const fetchUploadUrl = async () => {
//     try {
//       const res = await api.post("/creators/mux-upload-url");
//       if (res.data.success) {
//         setUploadUrl(res.data.data.url);
//         setUploadId(res.data.data.uploadId);
//         setUploadStatus('ready');
//         console.log('Upload URL obtained:', res.data.data.url);
//       } else {
//         setError('Failed to get upload URL');
//       }
//     } catch (error) {
//       setError('Error getting upload URL');
//       console.error(error);
//     }
//   };

//   const getSignedUrl = async (pbId) => {
//     try {
//       const res = await api.get(`/creators/mux-playback-url/${pbId}`);
//       if (res.data.success) {
//         setSignedUrl(res.data.data.signedUrl);
//         console.log('Signed URL obtained:', res.data.data.signedUrl);
//         return res.data.data.signedUrl;
//       }
//     } catch (error) {
//       console.error('Error getting signed URL:', error);
//       setError('Error getting playback URL');
//       return null;
//     }
//   };

//   // Fetch creator tiers
//   useEffect(() => {
//     const fetchCreatorTiers = async () => {
//       setIsLoadingTiers(true);
//       try {
//         const response = await api.get("/creators/memberships/me");
//         if (response.data.success) {
//           const tiers = response.data.data.memberShips.map(membership => ({
//             _id: membership._id,
//             tierName: membership.tierName,
//             price: membership.price,
//             perks: membership.perks,
//             description: membership.description,
//             isActive: membership.isActive
//           }));
//           setCreatorTiers(tiers);
//         }
//       } catch (error) {
//         console.error("Error fetching tiers:", error);
//       } finally {
//         setIsLoadingTiers(false);
//       }
//     };

//     fetchCreatorTiers();
//   }, []);

//   const handleThumbnailUpload = async (event) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     setIsUploadingThumbnail(true);
//     try {
//       const uploadResult = await uploadFiles("imageUploader", {
//         files: [file]
//       });
//       setThumbnailUrl(uploadResult[0].ufsUrl);
//       toast.success("Thumbnail uploaded successfully!");
//     } catch (err) {
//       setError('Failed to upload thumbnail. Please try again.');
//       console.error(err);
//     } finally {
//       setIsUploadingThumbnail(false);
//     }
//   };

//   // ✅ FIX #3: Simplified upload handlers
//   const handleUploadSuccess = () => {
//     console.log('Upload successful, waiting for processing...');
//     setUploadStatus('processing');
//     toast.success('Upload complete! Processing video...');
//     // Don't change currentStep - let status polling do that when asset is ready
//   };

//   const handleUploadError = (err) => {
//     console.error('Upload error:', err);
//     setUploadStatus('error');
//     setError('Upload failed. Please try again.');
//   };

//   // ✅ FIX #4: Simplified progress tracking
//   const handleUploadProgress = (event) => {
//     if (event.detail && event.detail.percentUploaded) {
//       setUploadProgress(event.detail.percentUploaded);
//     }
//   };

//   const generateSlug = (title) => {
//     return title
//       .toLowerCase()
//       .replace(/[^a-z0-9]+/g, '-')
//       .replace(/^-+|-+$/g, '');
//   };

//   const handleCreatePost = async () => {
//     console.log('Creating video post with data:', {
//       postTitle,
//       playbackId,
//       assetId,
//       signedUrl,
//       isPaid,
//       selectedTierId,
//       commentsAllowed
//     });
    
//     if (!postTitle.trim()) {
//       setError('Please enter a post title');
//       return;
//     }

//     if (postTitle.length < 3 || postTitle.length > 30) {
//       setError('Title must be between 3 and 30 characters');
//       return;
//     }

//     if (!postDescription || postDescription.trim() === "") {
//       setError('Description is required for video posts');
//       return;
//     }

//     if (!playbackId) {
//       setError('Video is still processing. Please wait.');
//       return;
//     }

//     if (isPaid && !selectedTierId) {
//       setError('Please select a membership tier for paid content');
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       const slug = generateSlug(postTitle);
      
//       const postData = {
//         title: postTitle.trim(),
//         type: "video",
//         slug: slug,
//         content: JSON.stringify({
//           signedUrl: signedUrl,
//           videoDuration: videoDuration
//         }),
//         description: postDescription.trim(),
//         thumbnailUrl: thumbnailUrl || "",
//         playbackId: playbackId,
//         assetId: assetId,
//         videoDuration: videoDuration,
//         isPaid: isPaid,
//         tierId: isPaid ? selectedTierId : undefined,
//         commentsAllowed: commentsAllowed,
//         isPublished: true
//       };
      
//       const response = await api.post('/creators/posts', postData);
      
//       if (!response.data.success) {
//         throw new Error(response.data.message || 'Failed to create post');
//       }
      
//       const newPost = response.data.data;
      
//       // Auto-add to collection if coming from collection page
//       if (location.state?.collectionId) {
//         try {
//           await api.post(`/collections/${location.state.collectionId}/posts/${newPost._id}`);
//           toast.success('Post created and added to collection!');
//         } catch (err) {
//           console.error('Failed to add to collection:', err);
//           toast.success('Post created but failed to add to collection');
//         }
//       } else {
//         toast.success('Video post created successfully!');
//       }
      
//       setCurrentStep('publishing');
      
//       setTimeout(() => {
//         // Reset state
//         setCurrentStep('upload');
//         setUploadUrl("");
//         setUploadId(null);
//         setPlaybackId(null);
//         setAssetId(null);
//         setVideoDuration(0);
//         setSignedUrl(null);
//         setUploadStatus('idle');
//         setUploadProgress(0);
//         setPostTitle('');
//         setPostDescription('');
//         setThumbnailUrl('');
//         setIsPaid(false);
//         setCommentsAllowed(true);
//         setSelectedTierId('');
//         setError(null);
        
//         // Fetch new upload URL for next upload
//         fetchUploadUrl();
        
//         if (location.state?.returnTo) {
//           navigate(location.state.returnTo);
//         }
//       }, 2000);
      
//     } catch (err) {
//       console.error('Error creating post:', err);
//       setError(err.message || 'Failed to create post. Please try again.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const formatDuration = (seconds) => {
//     if (!seconds) return '0:00';
//     const mins = Math.floor(seconds / 60);
//     const secs = Math.floor(seconds % 60);
//     return `${mins}:${secs.toString().padStart(2, '0')}`;
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-6">
//       <div className="mx-auto max-w-4xl">
//         {/* Header */}
//         <div className="mb-8">
//           <div className="flex items-center gap-3 mb-2">
//             <Video className="w-8 h-8 text-blue-600" />
//             <h1 className="text-3xl font-bold text-slate-900">Create Video Post</h1>
//           </div>
//           <p className="text-slate-600">Upload, process, and publish your video content with secure signed playback</p>
//         </div>

//         {/* Progress Steps */}
//         <div className="mb-8">
//           <div className="flex items-center justify-between">
//             {['upload', 'processing', 'preview', 'edit', 'publishing'].map((step, idx) => {
//               const steps = ['upload', 'processing', 'preview', 'edit', 'publishing'];
//               const stepIndex = steps.indexOf(currentStep);
//               const isActive = stepIndex >= idx;
//               const isCompleted = stepIndex > idx;

//               // Show processing step only if we're in it or have a status indicating processing
//               if (step === 'processing' && currentStep !== 'processing' && uploadStatus === 'ready') {
//                 return null;
//               }

//               return (
//                 <React.Fragment key={step}>
//                   <div className="flex flex-col items-center">
//                     <div
//                       className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
//                         isCompleted
//                           ? 'bg-green-500 text-white'
//                           : isActive
//                             ? 'bg-blue-600 text-white'
//                             : 'bg-slate-300 text-slate-600'
//                       }`}
//                     >
//                       {isCompleted ? <Check className="w-5 h-5" /> : 
//                        step === 'processing' && (currentStep === 'processing' || uploadStatus === 'processing') ? 
//                        <Loader2 className="w-5 h-5 animate-spin" /> : idx + 1}
//                     </div>
//                     <span className="text-xs text-slate-600 mt-2 capitalize">{step}</span>
//                   </div>
//                   {idx < 4 && step !== 'processing' && (
//                     <div
//                       className={`flex-1 h-1 mx-2 ${isCompleted ? 'bg-green-500' : isActive ? 'bg-blue-600' : 'bg-slate-300'}`}
//                     />
//                   )}
//                 </React.Fragment>
//               );
//             })}
//           </div>
//         </div>

//         {/* Error Alert */}
//         {error && (
//           <Alert className="mb-6 border-red-200 bg-red-50">
//             <AlertCircle className="h-4 w-4 text-red-600" />
//             <AlertDescription className="text-red-800">{error}</AlertDescription>
//           </Alert>
//         )}

//         {/* Step 1: Upload Video */}
//         {currentStep === 'upload' && (
//           <Card>
//             <CardHeader>
//               <CardTitle>Upload Your Video</CardTitle>
//               <CardDescription>Select a video file to upload and process</CardDescription>
//             </CardHeader>
//             <CardContent>
//               {uploadStatus === 'idle' ? (
//                 <div className="flex justify-center py-8">
//                   <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
//                   <p className="ml-2 text-slate-600">Preparing upload...</p>
//                 </div>
//               ) : uploadStatus === 'error' ? (
//                 <div className="text-center py-8">
//                   <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
//                   <p className="text-red-600 mb-4">Failed to initialize upload</p>
//                   <Button onClick={fetchUploadUrl} className="bg-blue-600 hover:bg-blue-700">
//                     Try Again
//                   </Button>
//                 </div>
//               ) : !playbackId && uploadUrl ? (
//                 // ✅ FIX #5: Keep MuxUploader mounted until playbackId exists
//                 <div className="space-y-4">
//                   <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
//                     <MuxUploader
//                       endpoint={uploadUrl}
//                       onSuccess={handleUploadSuccess}
//                       onError={handleUploadError}
//                       onProgress={handleUploadProgress}
//                     />
//                     {uploadProgress > 0 && uploadProgress < 100 && (
//                       <div className="mt-4">
//                         <div className="w-full bg-slate-200 rounded-full h-2">
//                           <div 
//                             className="bg-blue-600 h-2 rounded-full transition-all duration-300"
//                             style={{ width: `${uploadProgress}%` }}
//                           />
//                         </div>
//                         <p className="text-sm text-slate-600 mt-2">{Math.round(uploadProgress)}% uploaded</p>
//                       </div>
//                     )}
//                   </div>
//                   <p className="text-xs text-slate-500 text-center">
//                     Supported formats: MP4, MOV, M4V (Max 10GB)
//                     <br />
//                     Videos will be processed with signed playback for security
//                   </p>
//                 </div>
//               ) : null}
//             </CardContent>
//           </Card>
//         )}

//         {/* Step 2: Processing */}
//         {currentStep === 'processing' && (
//           <Card>
//             <CardHeader>
//               <CardTitle>Processing Video</CardTitle>
//               <CardDescription>Your video is being processed by Mux</CardDescription>
//             </CardHeader>
//             <CardContent className="flex flex-col items-center justify-center py-12">
//               <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
//               <p className="text-slate-600 text-center">
//                 Processing your video for optimal playback...
//               </p>
//               <p className="text-sm text-slate-500 mt-2">
//                 This may take a few minutes depending on video length
//               </p>
//             </CardContent>
//           </Card>
//         )}

//         {/* Step 3: Preview Video */}
//         {currentStep === 'preview' && signedUrl && (
//           <div className="space-y-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Video Preview</CardTitle>
//                 <CardDescription>Review your video before adding details</CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 {/* Video Player */}
//                 <div className="space-y-3">
//                   <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
//                     <video
//                       controls
//                       className="w-full h-full"
//                       src={signedUrl}
//                       poster={thumbnailUrl}
//                     >
//                       Your browser does not support the video tag.
//                     </video>
//                   </div>
//                   <div className="flex justify-between text-xs text-slate-600">
//                     <span>Duration: {formatDuration(videoDuration)}</span>
//                     <Badge variant="outline" className="text-green-600 border-green-200">
//                       <Check className="w-3 h-3 mr-1" />
//                       Processed
//                     </Badge>
//                   </div>
//                 </div>

//                 {/* Video Info */}
//                 <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
//                   <div>
//                     <p className="text-xs text-slate-500">Playback ID</p>
//                     <p className="text-sm font-mono text-slate-900 truncate">{playbackId}</p>
//                   </div>
//                   <div>
//                     <p className="text-xs text-slate-500">Asset ID</p>
//                     <p className="text-sm font-mono text-slate-900 truncate">{assetId}</p>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Action Buttons */}
//             <div className="flex gap-4">
//               <Button
//                 variant="outline"
//                 onClick={() => {
//                   setCurrentStep('upload');
//                   setUploadStatus('ready');
//                   setUploadProgress(0);
//                   setPlaybackId(null);
//                   setAssetId(null);
//                   setSignedUrl(null);
//                   setVideoDuration(0);
//                   setUploadId(null);
//                   fetchUploadUrl();
//                 }}
//                 className="flex-1"
//               >
//                 Upload Different Video
//               </Button>
//               <Button
//                 onClick={() => setCurrentStep('edit')}
//                 className="flex-1 bg-blue-600 hover:bg-blue-700"
//               >
//                 <Edit2 className="w-4 h-4 mr-2" />
//                 Continue to Edit
//               </Button>
//             </div>
//           </div>
//         )}

//         {/* Step 4: Edit Post Details */}
//         {currentStep === 'edit' && (
//           <div className="space-y-6">
//             {/* Post Details Card */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Post Details</CardTitle>
//                 <CardDescription>Add title, description, and thumbnail for your video post</CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="space-y-2">
//                   <label className="block text-sm font-medium text-slate-900">
//                     Post Title * (3-30 characters)
//                   </label>
//                   <Input
//                     value={postTitle}
//                     onChange={(e) => setPostTitle(e.target.value)}
//                     placeholder="Enter post title..."
//                     className="text-base"
//                     maxLength={30}
//                   />
//                   <p className="text-xs text-slate-500">
//                     {postTitle.length}/30 characters
//                   </p>
//                 </div>

//                 <div className="space-y-2">
//                   <label className="block text-sm font-medium text-slate-900">
//                     Description * (Required for video posts)
//                   </label>
//                   <Textarea
//                     value={postDescription}
//                     onChange={(e) => setPostDescription(e.target.value)}
//                     placeholder="Add a description for your video post..."
//                     className="h-24"
//                     required
//                   />
//                   <p className="text-xs text-slate-500">
//                     Describe what viewers will learn from this video
//                   </p>
//                 </div>

//                 <div className="space-y-2">
//                   <label className="block text-sm font-medium text-slate-900">
//                     Thumbnail (Optional)
//                   </label>
//                   <div className="flex items-center gap-4">
//                     <input
//                       type="file"
//                       ref={thumbnailInputRef}
//                       accept="image/*"
//                       onChange={handleThumbnailUpload}
//                       className="hidden"
//                     />
//                     <Button
//                       type="button"
//                       variant="outline"
//                       onClick={() => thumbnailInputRef.current?.click()}
//                       disabled={isUploadingThumbnail}
//                     >
//                       {isUploadingThumbnail ? (
//                         <>
//                           <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                           Uploading...
//                         </>
//                       ) : (
//                         <>
//                           <Upload className="w-4 h-4 mr-2" />
//                           Upload Thumbnail
//                         </>
//                       )}
//                     </Button>
//                     {thumbnailUrl && (
//                       <div className="flex items-center gap-2">
//                         <Check className="w-4 h-4 text-green-600" />
//                         <span className="text-sm text-green-600">Thumbnail uploaded</span>
//                       </div>
//                     )}
//                   </div>
//                   <p className="text-xs text-slate-500">
//                     Recommended size: 1280x720px (16:9 ratio)
//                   </p>
//                   {thumbnailUrl && (
//                     <div className="mt-2">
//                       <img 
//                         src={thumbnailUrl} 
//                         alt="Thumbnail preview" 
//                         className="w-32 h-32 object-cover rounded-lg border"
//                       />
//                     </div>
//                   )}
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Post Settings Card */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Post Settings</CardTitle>
//                 <CardDescription>Configure access and interaction settings</CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 {/* Paid Content Toggle */}
//                 <div className="flex items-center justify-between rounded-lg border p-4">
//                   <div className="space-y-0.5">
//                     <div className="flex items-center gap-2">
//                       <DollarSign className="h-4 w-4 text-slate-600" />
//                       <Label htmlFor="paid-content" className="font-semibold">
//                         Paid Content
//                       </Label>
//                     </div>
//                     <p className="text-sm text-slate-600">
//                       Charge subscribers to access this content
//                     </p>
//                   </div>
//                   <Switch
//                     id="paid-content"
//                     checked={isPaid}
//                     onCheckedChange={setIsPaid}
//                   />
//                 </div>

//                 {/* Tier Selection - Only show if isPaid is true */}
//                 {isPaid && (
//                   <div className="space-y-3 rounded-lg border p-4">
//                     <div className="space-y-1">
//                       <Label htmlFor="tier-select" className="font-semibold">
//                         Select Membership Tier
//                       </Label>
//                       <p className="text-sm text-slate-600">
//                         Choose which membership tier can access this content
//                       </p>
//                     </div>
                    
//                     {isLoadingTiers ? (
//                       <div className="flex items-center justify-center py-4">
//                         <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
//                       </div>
//                     ) : creatorTiers.length === 0 ? (
//                       <Alert>
//                         <AlertCircle className="h-4 w-4" />
//                         <AlertDescription>
//                           No membership tiers found. Please create a membership tier first.
//                         </AlertDescription>
//                       </Alert>
//                     ) : (
//                       <Select value={selectedTierId} onValueChange={setSelectedTierId}>
//                         <SelectTrigger className="w-full">
//                           <SelectValue placeholder="Select a membership tier" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           {creatorTiers.map((tier) => (
//                             <SelectItem key={tier._id} value={tier._id}>
//                               <div className="flex flex-col">
//                                 <span className="font-medium">{tier.tierName}</span>
//                                 <span className="text-xs text-slate-500">
//                                   ${tier.price}/month
//                                 </span>
//                               </div>
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     )}
//                   </div>
//                 )}

//                 {/* Comments Toggle */}
//                 <div className="flex items-center justify-between rounded-lg border p-4">
//                   <div className="space-y-0.5">
//                     <div className="flex items-center gap-2">
//                       <MessageSquare className="h-4 w-4 text-slate-600" />
//                       <Label htmlFor="comments-allowed" className="font-semibold">
//                         Allow Comments
//                       </Label>
//                     </div>
//                     <p className="text-sm text-slate-600">
//                       Let subscribers comment on this post
//                     </p>
//                   </div>
//                   <Switch
//                     id="comments-allowed"
//                     checked={commentsAllowed}
//                     onCheckedChange={setCommentsAllowed}
//                   />
//                 </div>

//                 {/* Preview Information */}
//                 <div className="rounded-lg bg-slate-50 p-4">
//                   <div className="flex items-start gap-3">
//                     <Lock className="h-5 w-5 text-slate-500 mt-0.5" />
//                     <div className="space-y-1">
//                       <p className="text-sm font-medium text-slate-900">Post Visibility</p>
//                       <p className="text-sm text-slate-600">
//                         {isPaid 
//                           ? `This video will be locked behind a paywall. Only subscribers of the selected tier can access it.`
//                           : `This video will be publicly accessible to all subscribers.`}
//                       </p>
//                       {isPaid && !selectedTierId && (
//                         <p className="text-sm text-amber-600 mt-2">
//                           ⚠️ Please select a membership tier before publishing
//                         </p>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Action Buttons */}
//                 <div className="flex gap-4 pt-4">
//                   <Button
//                     variant="outline"
//                     onClick={() => setCurrentStep('preview')}
//                     className="flex-1"
//                   >
//                     Back
//                   </Button>
//                   <Button
//                     onClick={handleCreatePost}
//                     disabled={isSubmitting || (isPaid && !selectedTierId) || !playbackId}
//                     className="flex-1 bg-blue-600 hover:bg-blue-700"
//                   >
//                     {isSubmitting ? (
//                       <>
//                         <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                         Publishing...
//                       </>
//                     ) : (
//                       <>
//                         <Play className="w-4 h-4 mr-2" />
//                         Publish Video Post
//                       </>
//                     )}
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         )}

//         {/* Step 5: Success */}
//         {currentStep === 'publishing' && (
//           <Card className="bg-green-50 border-green-200">
//             <CardContent className="pt-12 pb-12 text-center">
//               <div className="flex justify-center mb-4">
//                 <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
//                   <Check className="w-8 h-8 text-green-600" />
//                 </div>
//               </div>
//               <h2 className="text-2xl font-bold text-slate-900 mb-2">Video Post Published!</h2>
//               <p className="text-slate-600 mb-6">
//                 Your video post has been successfully created and published with secure signed playback.
//               </p>
//               <Button
//                 onClick={() => {
//                   setCurrentStep('upload');
//                   setUploadStatus('ready');
//                   setUploadProgress(0);
//                   setPlaybackId(null);
//                   setAssetId(null);
//                   setSignedUrl(null);
//                   setVideoDuration(0);
//                   setUploadId(null);
//                   fetchUploadUrl();
//                 }}
//                 className="bg-blue-600 hover:bg-blue-700"
//               >
//                 Create Another Post
//               </Button>
//             </CardContent>
//           </Card>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CreateVideoPost;
import React, { useState, useRef, useEffect } from 'react';
import { Upload, Video, Check, AlertCircle, Loader2, Edit2, DollarSign, MessageSquare, Lock, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useLocation, useNavigate } from 'react-router';
import MuxUploader from '@mux/mux-uploader-react';
import { uploadFiles } from '@/lib/uploadthing';

const CreateVideoPost = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState('upload');
  
  // Mux upload states
  const [uploadUrl, setUploadUrl] = useState("");
  const [uploadId, setUploadId] = useState(null);
  const [playbackId, setPlaybackId] = useState(null);
  const [assetId, setAssetId] = useState(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [signedUrl, setSignedUrl] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [postTitle, setPostTitle] = useState('');
  const [postDescription, setPostDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);

  const [isPaid, setIsPaid] = useState(false);
  const [commentsAllowed, setCommentsAllowed] = useState(true);
  const [selectedTierId, setSelectedTierId] = useState('');
  
  const [creatorTiers, setCreatorTiers] = useState([]);
  const [isLoadingTiers, setIsLoadingTiers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const thumbnailInputRef = useRef(null);
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
            await getSignedUrl(newPlaybackId);
            setUploadStatus('asset_ready');
            setCurrentStep('preview');
            toast.success('Video processed successfully!');
            if (statusCheckInterval.current) {
              clearInterval(statusCheckInterval.current);
            }
          } else if (status === 'errored') {
            setUploadStatus('error');
            setError('Video processing failed. Please try again.');
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
  }, [uploadId, playbackId]);

  const fetchUploadUrl = async () => {
    try {
      const res = await api.post("/creators/mux-upload-url");
      if (res.data.success) {
        setUploadUrl(res.data.data.url);
        setUploadId(res.data.data.uploadId);
        setUploadStatus('ready');
        console.log('Upload URL obtained:', res.data.data.url);
      } else {
        setError('Failed to get upload URL');
      }
    } catch (error) {
      setError('Error getting upload URL');
      console.error(error);
    }
  };

  const getSignedUrl = async (pbId) => {
    try {
      const res = await api.get(`/creators/mux-playback-url/${pbId}`);
      if (res.data.success) {
        setSignedUrl(res.data.data.signedUrl);
        console.log('Signed URL obtained:', res.data.data.signedUrl);
        return res.data.data.signedUrl;
      }
    } catch (error) {
      console.error('Error getting signed URL:', error);
      setError('Error getting playback URL');
      return null;
    }
  };

  useEffect(() => {
    const fetchCreatorTiers = async () => {
      setIsLoadingTiers(true);
      try {
        const response = await api.get("/creators/memberships/me");
        if (response.data.success) {
          const tiers = response.data.data.memberShips.map(membership => ({
            _id: membership._id,
            tierName: membership.tierName,
            price: membership.price,
            perks: membership.perks,
            description: membership.description,
            isActive: membership.isActive
          }));
          setCreatorTiers(tiers);
        }
      } catch (error) {
        console.error("Error fetching tiers:", error);
      } finally {
        setIsLoadingTiers(false);
      }
    };

    fetchCreatorTiers();
  }, []);

  const handleThumbnailUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingThumbnail(true);
    try {
      const uploadResult = await uploadFiles("imageUploader", {
        files: [file]
      });
      setThumbnailUrl(uploadResult[0].ufsUrl);
      toast.success("Thumbnail uploaded successfully!");
    } catch (err) {
      setError('Failed to upload thumbnail. Please try again.');
      console.error(err);
    } finally {
      setIsUploadingThumbnail(false);
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
    setError('Upload failed. Please try again.');
  };

  const handleUploadProgress = (event) => {
    if (event.detail && event.detail.percentUploaded) {
      setUploadProgress(event.detail.percentUploaded);
    }
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleCreatePost = async () => {
    console.log('Creating video post with data:', {
      postTitle,
      playbackId,
      assetId,
      signedUrl,
      isPaid,
      selectedTierId,
      commentsAllowed
    });
    
    if (!postTitle.trim()) {
      setError('Please enter a post title');
      return;
    }

    if (postTitle.length < 3 || postTitle.length > 30) {
      setError('Title must be between 3 and 30 characters');
      return;
    }

    if (!postDescription || postDescription.trim() === "") {
      setError('Description is required for video posts');
      return;
    }

    if (!playbackId) {
      setError('Video is still processing. Please wait.');
      return;
    }

    if (isPaid && !selectedTierId) {
      setError('Please select a membership tier for paid content');
      return;
    }

    setIsSubmitting(true);

    try {
      const slug = generateSlug(postTitle);
      
      const postData = {
        title: postTitle.trim(),
        type: "video",
        slug: slug,
        content: JSON.stringify({
          signedUrl: signedUrl,
          videoDuration: videoDuration
        }),
        description: postDescription.trim(),
        thumbnailUrl: thumbnailUrl || "",
        playbackId: playbackId,
        assetId: assetId,
        videoDuration: videoDuration,
        isPaid: isPaid,
        tierId: isPaid ? selectedTierId : undefined,
        commentsAllowed: commentsAllowed,
        isPublished: true
      };
      
      const response = await api.post('/creators/posts', postData);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create post');
      }
      
      const newPost = response.data.data;
      
      if (location.state?.collectionId) {
        try {
          await api.post(`/collections/${location.state.collectionId}/posts/${newPost._id}`);
          toast.success('Post created and added to collection!');
        } catch (err) {
          console.error('Failed to add to collection:', err);
          toast.success('Post created but failed to add to collection');
        }
      } else {
        toast.success('Video post created successfully!');
      }
      
      setCurrentStep('publishing');
      
      setTimeout(() => {
        setCurrentStep('upload');
        setUploadUrl("");
        setUploadId(null);
        setPlaybackId(null);
        setAssetId(null);
        setVideoDuration(0);
        setSignedUrl(null);
        setUploadStatus('idle');
        setUploadProgress(0);
        setPostTitle('');
        setPostDescription('');
        setThumbnailUrl('');
        setIsPaid(false);
        setCommentsAllowed(true);
        setSelectedTierId('');
        setError(null);
        
        fetchUploadUrl();
        
        if (location.state?.returnTo) {
          navigate(location.state.returnTo);
        }
      }, 2000);
      
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err.message || 'Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Video className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Create Video Post</h1>
          </div>
          <p className="text-muted-foreground">Upload, process, and publish your video content with secure signed playback</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {['upload', 'processing', 'preview', 'edit', 'publishing'].map((step, idx) => {
              const steps = ['upload', 'processing', 'preview', 'edit', 'publishing'];
              const stepIndex = steps.indexOf(currentStep);
              const isActive = stepIndex >= idx;
              const isCompleted = stepIndex > idx;

              if (step === 'processing' && currentStep !== 'processing' && uploadStatus === 'ready') {
                return null;
              }

              return (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                        isCompleted
                          ? 'bg-primary text-primary-foreground'
                          : isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isCompleted ? <Check className="w-5 h-5" /> : 
                       step === 'processing' && (currentStep === 'processing' || uploadStatus === 'processing') ? 
                       <Loader2 className="w-5 h-5 animate-spin" /> : idx + 1}
                    </div>
                    <span className="text-xs text-muted-foreground mt-2 capitalize">{step}</span>
                  </div>
                  {idx < 4 && step !== 'processing' && (
                    <div
                      className={`flex-1 h-px mx-2 ${
                        isCompleted ? 'bg-primary' : isActive ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Upload Video */}
        {currentStep === 'upload' && (
          <Card>
            <CardHeader>
              <CardTitle>Upload Your Video</CardTitle>
              <CardDescription>Select a video file to upload and process</CardDescription>
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
                  <Button onClick={fetchUploadUrl}>Try Again</Button>
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
                  <p className="text-xs text-muted-foreground text-center">
                    Supported formats: MP4, MOV, M4V (Max 10GB)
                    <br />
                    Videos will be processed with signed playback for security
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Processing */}
        {currentStep === 'processing' && (
          <Card>
            <CardHeader>
              <CardTitle>Processing Video</CardTitle>
              <CardDescription>Your video is being processed by Mux</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 animate-spin mb-4" />
              <p className="text-center">
                Processing your video for optimal playback...
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                This may take a few minutes depending on video length
              </p>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Preview Video */}
        {currentStep === 'preview' && signedUrl && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Video Preview</CardTitle>
                <CardDescription>Review your video before adding details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Video Player */}
                <div className="space-y-3">
                  <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                    <video
                      controls
                      className="w-full h-full"
                      src={signedUrl}
                      poster={thumbnailUrl}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Duration: {formatDuration(videoDuration)}</span>
                    <Badge variant="outline">
                      <Check className="w-3 h-3 mr-1" />
                      Processed
                    </Badge>
                  </div>
                </div>

                {/* Video Info */}
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
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentStep('upload');
                  setUploadStatus('ready');
                  setUploadProgress(0);
                  setPlaybackId(null);
                  setAssetId(null);
                  setSignedUrl(null);
                  setVideoDuration(0);
                  setUploadId(null);
                  fetchUploadUrl();
                }}
                className="flex-1"
              >
                Upload Different Video
              </Button>
              <Button
                onClick={() => setCurrentStep('edit')}
                className="flex-1"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Continue to Edit
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Edit Post Details */}
        {currentStep === 'edit' && (
          <div className="space-y-6">
            {/* Post Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Post Details</CardTitle>
                <CardDescription>Add title, description, and thumbnail for your video post</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Post Title * (3-30 characters)</Label>
                  <Input
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="Enter post title..."
                    maxLength={30}
                  />
                  <p className="text-xs text-muted-foreground">
                    {postTitle.length}/30 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Description * (Required for video posts)</Label>
                  <Textarea
                    value={postDescription}
                    onChange={(e) => setPostDescription(e.target.value)}
                    placeholder="Add a description for your video post..."
                    className="h-24"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Describe what viewers will learn from this video
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Thumbnail (Optional)</Label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      ref={thumbnailInputRef}
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => thumbnailInputRef.current?.click()}
                      disabled={isUploadingThumbnail}
                    >
                      {isUploadingThumbnail ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Thumbnail
                        </>
                      )}
                    </Button>
                    {thumbnailUrl && (
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600">Thumbnail uploaded</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Recommended size: 1280x720px (16:9 ratio)
                  </p>
                  {thumbnailUrl && (
                    <div className="mt-2">
                      <img 
                        src={thumbnailUrl} 
                        alt="Thumbnail preview" 
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Post Settings Card */}
            <Card>
              <CardHeader>
                <CardTitle>Post Settings</CardTitle>
                <CardDescription>Configure access and interaction settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Paid Content Toggle */}
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <Label className="font-semibold">
                        Paid Content
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Charge subscribers to access this content
                    </p>
                  </div>
                  <Switch
                    id="paid-content"
                    checked={isPaid}
                    onCheckedChange={setIsPaid}
                  />
                </div>

                {/* Tier Selection - Only show if isPaid is true */}
                {isPaid && (
                  <div className="space-y-3 rounded-lg border p-4">
                    <div className="space-y-1">
                      <Label className="font-semibold">
                        Select Membership Tier
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Choose which membership tier can access this content
                      </p>
                    </div>
                    
                    {isLoadingTiers ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : creatorTiers.length === 0 ? (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          No membership tiers found. Please create a membership tier first.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Select value={selectedTierId} onValueChange={setSelectedTierId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a membership tier" />
                        </SelectTrigger>
                        <SelectContent>
                          {creatorTiers.map((tier) => (
                            <SelectItem key={tier._id} value={tier._id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{tier.tierName}</span>
                                <span className="text-xs text-muted-foreground">
                                  ${tier.price}/month
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                )}

                {/* Comments Toggle */}
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <Label className="font-semibold">
                        Allow Comments
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Let subscribers comment on this post
                    </p>
                  </div>
                  <Switch
                    id="comments-allowed"
                    checked={commentsAllowed}
                    onCheckedChange={setCommentsAllowed}
                  />
                </div>

                {/* Preview Information */}
                <div className="rounded-lg bg-muted p-4">
                  <div className="flex items-start gap-3">
                    <Lock className="h-5 w-5 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Post Visibility</p>
                      <p className="text-sm text-muted-foreground">
                        {isPaid 
                          ? `This video will be locked behind a paywall. Only subscribers of the selected tier can access it.`
                          : `This video will be publicly accessible to all subscribers.`}
                      </p>
                      {isPaid && !selectedTierId && (
                        <p className="text-sm text-destructive mt-2">
                          ⚠️ Please select a membership tier before publishing
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep('preview')}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleCreatePost}
                    disabled={isSubmitting || (isPaid && !selectedTierId) || !playbackId}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Publish Video Post
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 5: Success */}
        {currentStep === 'publishing' && (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">Video Post Published!</h2>
              <p className="text-muted-foreground mb-6">
                Your video post has been successfully created and published with secure signed playback.
              </p>
              <Button
                onClick={() => {
                  setCurrentStep('upload');
                  setUploadStatus('ready');
                  setUploadProgress(0);
                  setPlaybackId(null);
                  setAssetId(null);
                  setSignedUrl(null);
                  setVideoDuration(0);
                  setUploadId(null);
                  fetchUploadUrl();
                }}
              >
                Create Another Post
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CreateVideoPost;