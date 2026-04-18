
// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { Music, Check, AlertCircle, Loader2, Upload, Save, ArrowLeft, Globe, Lock, MessageSquare, DollarSign, Edit2 } from 'lucide-react';
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
// import { Switch } from '@/components/ui/switch';
// import { Label } from '@/components/ui/label';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { Badge } from '@/components/ui/badge';
// import { uploadFiles } from '@/lib/uploadthing';
// import { api } from '@/lib/api';
// import { toast } from 'sonner';

// const EditAudioPost = () => {
//   const navigate = useNavigate();
//   const { id } = useParams(); // This will get the post ID from URL: /creator/posts/audio/:id/edit
  
//   const [isLoading, setIsLoading] = useState(true);
//   const [isSaving, setIsSaving] = useState(false);
//   const [error, setError] = useState(null);
  
//   // Post fields
//   const [postTitle, setPostTitle] = useState('');
//   const [postDescription, setPostDescription] = useState('');
//   const [thumbnailUrl, setThumbnailUrl] = useState('');
//   const [audioUrl, setAudioUrl] = useState('');
//   const [transcriptionUrl, setTranscriptionUrl] = useState('');
//   const [editedTranscription, setEditedTranscription] = useState('');
//   const [audioDuration, setAudioDuration] = useState(0);
  
//   // Post settings
//   const [isPaid, setIsPaid] = useState(false);
//   const [commentsAllowed, setCommentsAllowed] = useState(true);
//   const [isPublished, setIsPublished] = useState(true);
//   const [selectedTierId, setSelectedTierId] = useState('');
  
//   // UI states
//   const [creatorTiers, setCreatorTiers] = useState([]);
//   const [isLoadingTiers, setIsLoadingTiers] = useState(false);
//   const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
//   const [showEditTranscription, setShowEditTranscription] = useState(false);
  
//   const thumbnailInputRef = React.useRef(null);

//   // Fetch post data
//   useEffect(() => {
//     const fetchPostData = async () => {
//       setIsLoading(true);
//       setError(null);
      
//       try {
//         // Fetch post details
//         const postResponse = await api.get(`/creators/posts/${id}`);
        
//         if (!postResponse.data.success) {
//           throw new Error(postResponse.data.message || 'Failed to fetch post');
//         }
        
//         const post = postResponse.data.data;
        
//         // Validate post type
//         if (post.type !== 'audio') {
//           toast.error('This is not an audio post');
//           navigate('/creator/library');
//           return;
//         }
        
//         // Parse content if it's a string
//         let content = {};
//         if (typeof post.content === 'string') {
//           try {
//             content = JSON.parse(post.content);
//           } catch (e) {
//             console.error('Error parsing content:', e);
//           }
//         } else {
//           content = post.content || {};
//         }
        
//         // Set form values
//         setPostTitle(post.title || '');
//         setPostDescription(post.description || '');
//         setThumbnailUrl(post.thumbnailUrl || '');
//         setAudioUrl(post.audioUrl || '');
//         setTranscriptionUrl(post.transcriptionUrl || '');
//         setEditedTranscription(content.transcriptionText || '');
//         setAudioDuration(content.audioDuration || 0);
//         setIsPaid(post.isPaid || false);
//         setCommentsAllowed(post.commentsAllowed !== undefined ? post.commentsAllowed : true);
//         setIsPublished(post.isPublished !== undefined ? post.isPublished : true);
//         setSelectedTierId(post.tierId || '');
        
//         // Fetch creator tiers for paid content
//         await fetchCreatorTiers();
        
//       } catch (err) {
//         console.error('Error fetching post:', err);
//         setError(err.message || 'Failed to load post data');
//         toast.error('Failed to load post data');
//       } finally {
//         setIsLoading(false);
//       }
//     };
    
//     if (id) {
//       fetchPostData();
//     }
//   }, [id, navigate]);
  
//   // Fetch creator tiers
//   const fetchCreatorTiers = async () => {
//     setIsLoadingTiers(true);
//     try {
//       const response = await api.get("/creators/memberships/me");
//       if (response.data.success) {
//         const tiers = response.data.data.memberShips.map(membership => ({
//           _id: membership._id,
//           tierName: membership.tierName,
//           price: membership.price,
//           perks: membership.perks,
//           description: membership.description,
//           isActive: membership.isActive
//         }));
//         setCreatorTiers(tiers);
//       }
//     } catch (error) {
//       console.error("Error fetching tiers:", error);
//     } finally {
//       setIsLoadingTiers(false);
//     }
//   };
  
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
//       toast.error('Failed to upload thumbnail. Please try again.');
//       console.error(err);
//     } finally {
//       setIsUploadingThumbnail(false);
//     }
//   };
  
//   const handleUpdatePost = async () => {
//     // Validate all required fields
//     if (!postTitle.trim()) {
//       toast.error('Please enter a post title');
//       return;
//     }
    
//     if (postTitle.length < 3 || postTitle.length > 30) {
//       toast.error('Title must be between 3 and 30 characters');
//       return;
//     }
    
//     if (!postDescription || postDescription.trim() === "") {
//       toast.error('Description is required for audio posts');
//       return;
//     }
    
//     // Validate tier selection for paid posts
//     if (isPaid && !selectedTierId) {
//       toast.error('Please select a membership tier for paid content');
//       return;
//     }
    
//     setIsSaving(true);
//     setError(null);
    
//     try {
//       // Prepare update data
//       const updateData = {
//         title: postTitle.trim(),
//         description: postDescription.trim(),
//         thumbnailUrl: thumbnailUrl || "",
//         isPaid: isPaid,
//         commentsAllowed: commentsAllowed,
//         isPublished: isPublished,
//         ...(isPaid && { tierId: selectedTierId }),
//         // Only include content if transcription was edited
//         ...(showEditTranscription && editedTranscription !== '' && {
//           content: JSON.stringify({
//             transcriptionText: editedTranscription,
//             audioDuration: audioDuration
//           })
//         })
//       };
      
//       console.log("Updating audio post:", updateData);
      
//       const response = await api.put(`/creators/posts/${id}`, updateData);
      
//       if (!response.data.success) {
//         throw new Error(response.data.message || 'Failed to update post');
//       }
      
//       toast.success('Audio post updated successfully!');
      
//       // Redirect to library after successful update
//       setTimeout(() => {
//         navigate('/creator/library');
//       }, 1500);
      
//     } catch (err) {
//       console.error('Error updating post:', err);
//       setError(err.message || 'Failed to update post. Please try again.');
//       toast.error(err.message || 'Failed to update post');
//     } finally {
//       setIsSaving(false);
//     }
//   };
  
//   const formatDuration = (seconds) => {
//     if (!seconds) return '0:00';
//     const mins = Math.floor(seconds / 60);
//     const secs = Math.floor(seconds % 60);
//     return `${mins}:${secs.toString().padStart(2, '0')}`;
//   };
  
//   if (isLoading) {
//     return (
//       <div className="min-h-screen from-slate-50 to-slate-100 flex items-center justify-center">
//         <div className="text-center">
//           <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
//           <p className="text-slate-600">Loading post data...</p>
//         </div>
//       </div>
//     );
//   }
  
//   return (
//     <div className="min-h-screen  from-slate-50 to-slate-100 p-6">
//       <div className="mx-auto max-w-4xl">
//         {/* Header */}
//         <div className="mb-8">
//           <div className="flex items-center justify-between mb-2">
//             <div className="flex items-center gap-3">
//               <Music className="w-8 h-8 text-blue-600" />
//               <h1 className="text-3xl font-bold text-slate-900">Edit Audio Post</h1>
//               <Badge variant="secondary" className="ml-2">
//                 Audio
//               </Badge>
//             </div>
//             <Button
//               variant="outline"
//               onClick={() => navigate('/creator/library')}
//               className="gap-2"
//             >
//               <ArrowLeft className="w-4 h-4" />
//               Back to Library
//             </Button>
//           </div>
//           <p className="text-slate-600">Edit your audio post details and settings</p>
//         </div>
        
//         {/* Error Alert */}
//         {error && (
//           <Alert className="mb-6 border-red-200 bg-red-50">
//             <AlertCircle className="h-4 w-4 text-red-600" />
//             <AlertDescription className="text-red-800">{error}</AlertDescription>
//           </Alert>
//         )}
        
//         <div className="space-y-6">
//           {/* Basic Info Card */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Basic Information</CardTitle>
//               <CardDescription>Edit the title, description, and thumbnail for your audio post</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               {/* Title */}
//               <div className="space-y-2">
//                 <label className="block text-sm font-medium text-slate-900">
//                   Post Title * (3-30 characters)
//                 </label>
//                 <Input
//                   value={postTitle}
//                   onChange={(e) => setPostTitle(e.target.value)}
//                   placeholder="Enter post title..."
//                   className="text-base"
//                   maxLength={30}
//                 />
//                 <p className="text-xs text-slate-500">
//                   {postTitle.length}/30 characters
//                 </p>
//               </div>
              
//               {/* Description */}
//               <div className="space-y-2">
//                 <label className="block text-sm font-medium text-slate-900">
//                   Description * (Required for audio posts)
//                 </label>
//                 <Textarea
//                   value={postDescription}
//                   onChange={(e) => setPostDescription(e.target.value)}
//                   placeholder="Add a description for your audio post..."
//                   className="h-24"
//                   required
//                 />
//                 <p className="text-xs text-slate-500">
//                   Describe what listeners will learn from this audio
//                 </p>
//               </div>
              
//               {/* Thumbnail */}
//               <div className="space-y-2">
//                 <label className="block text-sm font-medium text-slate-900">
//                   Thumbnail (Optional)
//                 </label>
//                 <div className="flex items-center gap-4">
//                   <input
//                     type="file"
//                     ref={thumbnailInputRef}
//                     accept="image/*"
//                     onChange={handleThumbnailUpload}
//                     className="hidden"
//                   />
//                   <Button
//                     type="button"
//                     variant="outline"
//                     onClick={() => thumbnailInputRef.current?.click()}
//                     disabled={isUploadingThumbnail}
//                   >
//                     {isUploadingThumbnail ? (
//                       <>
//                         <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                         Uploading...
//                       </>
//                     ) : (
//                       <>
//                         <Upload className="w-4 h-4 mr-2" />
//                         {thumbnailUrl ? 'Change Thumbnail' : 'Upload Thumbnail'}
//                       </>
//                     )}
//                   </Button>
//                   {thumbnailUrl && (
//                     <Button
//                       type="button"
//                       variant="ghost"
//                       size="sm"
//                       onClick={() => setThumbnailUrl('')}
//                       className="text-red-600 hover:text-red-700"
//                     >
//                       Remove
//                     </Button>
//                   )}
//                 </div>
//                 <p className="text-xs text-slate-500">
//                   Recommended size: 1280x720px (16:9 ratio)
//                 </p>
//                 {thumbnailUrl && (
//                   <div className="mt-2">
//                     <img 
//                       src={thumbnailUrl} 
//                       alt="Thumbnail preview" 
//                       className="w-32 h-32 object-cover rounded-lg border"
//                     />
//                   </div>
//                 )}
//               </div>
              
//               {/* Audio Preview */}
//               {audioUrl && (
//                 <div className="space-y-2 pt-4 border-t">
//                   <label className="block text-sm font-medium text-slate-900">
//                     Audio Preview
//                   </label>
//                   <audio src={audioUrl} controls className="w-full" />
//                   <p className="text-xs text-slate-500">
//                     Duration: {formatDuration(audioDuration)}
//                   </p>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
          
//           {/* Transcription Edit Card (Optional) */}
//           <Card>
//             <CardHeader>
//               <div className="flex items-center justify-between">
//                 <div>
//                   <CardTitle>Transcription</CardTitle>
//                   <CardDescription>View and edit the transcribed text</CardDescription>
//                 </div>
//                 <Button
//                   variant="outline"
//                   onClick={() => setShowEditTranscription(!showEditTranscription)}
//                 >
//                   <Edit2 className="w-4 h-4 mr-2" />
//                   {showEditTranscription ? 'Hide Editor' : 'Edit Transcription'}
//                 </Button>
//               </div>
//             </CardHeader>
//             {showEditTranscription && (
//               <CardContent className="space-y-4">
//                 <div className="space-y-2">
//                   <label className="block text-sm font-medium text-slate-900">
//                     Transcription Text
//                   </label>
//                   <Textarea
//                     value={editedTranscription}
//                     onChange={(e) => setEditedTranscription(e.target.value)}
//                     className="font-mono text-sm min-h-52"
//                     placeholder="Your transcription will appear here..."
//                   />
//                   <p className="text-xs text-slate-600">
//                     {editedTranscription?.split(/\s+/).length || 0} words
//                   </p>
//                   <p className="text-xs text-amber-600">
//                     Note: Editing the transcription will update the post content
//                   </p>
//                 </div>
//               </CardContent>
//             )}
//           </Card>
          
//           {/* Post Settings Card */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Post Settings</CardTitle>
//               <CardDescription>Configure access, visibility, and interaction settings</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               {/* Published Status Toggle */}
//               <div className="flex items-center justify-between rounded-lg border p-4">
//                 <div className="space-y-0.5">
//                   <div className="flex items-center gap-2">
//                     {isPublished ? (
//                       <Globe className="h-4 w-4 text-green-600" />
//                     ) : (
//                       <Lock className="h-4 w-4 text-slate-600" />
//                     )}
//                     <Label htmlFor="published-status" className="font-semibold">
//                       Published Status
//                     </Label>
//                   </div>
//                   <p className="text-sm text-slate-600">
//                     {isPublished 
//                       ? 'Post is visible to subscribers' 
//                       : 'Post is hidden from subscribers'}
//                   </p>
//                 </div>
//                 <Switch
//                   id="published-status"
//                   checked={isPublished}
//                   onCheckedChange={setIsPublished}
//                 />
//               </div>
              
//               {/* Paid Content Toggle */}
//               <div className="flex items-center justify-between rounded-lg border p-4">
//                 <div className="space-y-0.5">
//                   <div className="flex items-center gap-2">
//                     <DollarSign className="h-4 w-4 text-slate-600" />
//                     <Label htmlFor="paid-content" className="font-semibold">
//                       Paid Content
//                     </Label>
//                   </div>
//                   <p className="text-sm text-slate-600">
//                     {isPaid 
//                       ? 'Only paid subscribers can access this content' 
//                       : 'All subscribers can access this content'}
//                   </p>
//                 </div>
//                 <Switch
//                   id="paid-content"
//                   checked={isPaid}
//                   onCheckedChange={setIsPaid}
//                 />
//               </div>
              
//               {/* Tier Selection - Only show if isPaid is true */}
//               {isPaid && (
//                 <div className="space-y-3 rounded-lg border p-4">
//                   <div className="space-y-1">
//                     <Label htmlFor="tier-select" className="font-semibold">
//                       Select Membership Tier
//                     </Label>
//                     <p className="text-sm text-slate-600">
//                       Choose which membership tier can access this content
//                     </p>
//                   </div>
                  
//                   {isLoadingTiers ? (
//                     <div className="flex items-center justify-center py-4">
//                       <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
//                     </div>
//                   ) : creatorTiers.length === 0 ? (
//                     <Alert>
//                       <AlertCircle className="h-4 w-4" />
//                       <AlertDescription>
//                         No membership tiers found. Please create a membership tier first.
//                       </AlertDescription>
//                     </Alert>
//                   ) : (
//                     <Select value={selectedTierId} onValueChange={setSelectedTierId}>
//                       <SelectTrigger className="w-full">
//                         <SelectValue placeholder="Select a membership tier" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {creatorTiers.map((tier) => (
//                           <SelectItem key={tier._id} value={tier._id}>
//                             <div className="flex flex-col">
//                               <span className="font-medium">{tier.tierName}</span>
//                               <span className="text-xs text-slate-500">
//                                 ${tier.price}/month
//                               </span>
//                             </div>
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   )}
//                 </div>
//               )}
              
//               {/* Comments Toggle */}
//               <div className="flex items-center justify-between rounded-lg border p-4">
//                 <div className="space-y-0.5">
//                   <div className="flex items-center gap-2">
//                     <MessageSquare className="h-4 w-4 text-slate-600" />
//                     <Label htmlFor="comments-allowed" className="font-semibold">
//                       Allow Comments
//                     </Label>
//                   </div>
//                   <p className="text-sm text-slate-600">
//                     {commentsAllowed 
//                       ? 'Subscribers can comment on this post' 
//                       : 'Comments are disabled for this post'}
//                   </p>
//                 </div>
//                 <Switch
//                   id="comments-allowed"
//                   checked={commentsAllowed}
//                   onCheckedChange={setCommentsAllowed}
//                 />
//               </div>
              
//               {/* Preview Information */}
//               <div className="rounded-lg bg-slate-50 p-4">
//                 <div className="flex items-start gap-3">
//                   {isPublished ? (
//                     <Globe className="h-5 w-5 text-green-600 mt-0.5" />
//                   ) : (
//                     <Lock className="h-5 w-5 text-slate-500 mt-0.5" />
//                   )}
//                   <div className="space-y-1">
//                     <p className="text-sm font-medium text-slate-900">Post Summary</p>
//                     <p className="text-sm text-slate-600">
//                       • Status: {isPublished ? 'Published' : 'Draft'}
//                       <br />
//                       • Access: {isPaid ? 'Paid subscribers only' : 'All subscribers'}
//                       <br />
//                       • Comments: {commentsAllowed ? 'Enabled' : 'Disabled'}
//                       {isPaid && selectedTierId && (
//                        <>
//                         <br /> • Tier :  {creatorTiers.find(t => t._id === selectedTierId)?.tierName || 'Selected'}
//                        </>
//                       )}
//                     </p>
//                     {isPaid && !selectedTierId && (
//                       <p className="text-sm text-amber-600 mt-2">
//                         ⚠️ Please select a membership tier before saving
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               </div>
              
//               {/* Action Buttons */}
//               <div className="flex gap-4 pt-4">
//                 <Button
//                   variant="outline"
//                   onClick={() => navigate('/creator/library')}
//                   className="flex-1"
//                 >
//                   Cancel
//                 </Button>
//                 <Button
//                   onClick={handleUpdatePost}
//                   disabled={isSaving || (isPaid && !selectedTierId)}
//                   className="flex-1 bg-blue-600 hover:bg-blue-700"
//                 >
//                   {isSaving ? (
//                     <>
//                       <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                       Saving Changes...
//                     </>
//                   ) : (
//                     <>
//                       <Save className="w-4 h-4 mr-2" />
//                       Save Changes
//                     </>
//                   )}
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EditAudioPost;
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Music, Check, AlertCircle, Loader2, Upload, Save, ArrowLeft, Globe, Lock, MessageSquare, DollarSign, Edit2, User, Plus, X, Pencil } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { uploadFiles } from '@/lib/uploadthing';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const EditAudioPost = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  
  // Post fields
  const [postTitle, setPostTitle] = useState('');
  const [postDescription, setPostDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [transcriptionUrl, setTranscriptionUrl] = useState('');
  const [editedTranscription, setEditedTranscription] = useState('');
  const [audioDuration, setAudioDuration] = useState(0);
  
  // Post settings
  const [isPaid, setIsPaid] = useState(false);
  const [commentsAllowed, setCommentsAllowed] = useState(true);
  const [isPublished, setIsPublished] = useState(true);
  const [selectedTierId, setSelectedTierId] = useState('');
  
  // Speaker management
  const [speakerOverrides, setSpeakerOverrides] = useState({});
  const [customSpeakers, setCustomSpeakers] = useState([]);
  const [originalSpeakers, setOriginalSpeakers] = useState([]);
  const [isEditingSpeaker, setIsEditingSpeaker] = useState(false);
  const [editingSpeakerId, setEditingSpeakerId] = useState(null);
  const [editingSpeakerName, setEditingSpeakerName] = useState('');
  const [editingSpeakerColor, setEditingSpeakerColor] = useState('#3b82f6');
  const [newCustomSpeakerName, setNewCustomSpeakerName] = useState('');
  const [newCustomSpeakerColor, setNewCustomSpeakerColor] = useState('#3b82f6');
  
  // UI states
  const [creatorTiers, setCreatorTiers] = useState([]);
  const [isLoadingTiers, setIsLoadingTiers] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [showEditTranscription, setShowEditTranscription] = useState(false);
  const [showSpeakerManager, setShowSpeakerManager] = useState(false);
  
  const thumbnailInputRef = React.useRef(null);

  // Fetch post data
  useEffect(() => {
    const fetchPostData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const postResponse = await api.get(`/creators/posts/${id}`);
        
        if (!postResponse.data.success) {
          throw new Error(postResponse.data.message || 'Failed to fetch post');
        }
        
        const post = postResponse.data.data;
        
        if (post.type !== 'audio') {
          toast.error('This is not an audio post');
          navigate('/creator/library');
          return;
        }
        
        // Parse content
        let content = {};
        if (typeof post.content === 'string') {
          try {
            content = JSON.parse(post.content);
          } catch (e) {
            console.error('Error parsing content:', e);
          }
        } else {
          content = post.content || {};
        }
        
        // Set form values
        setPostTitle(post.title || '');
        setPostDescription(post.description || '');
        setThumbnailUrl(post.thumbnailUrl || '');
        setAudioUrl(post.audioUrl || '');
        setTranscriptionUrl(post.transcriptionUrl || '');
        setEditedTranscription(content.transcriptionText || '');
        setAudioDuration(content.audioDuration || 0);
        setIsPaid(post.isPaid || false);
        setCommentsAllowed(post.commentsAllowed !== undefined ? post.commentsAllowed : true);
        setIsPublished(post.isPublished !== undefined ? post.isPublished : true);
        setSelectedTierId(post.tierId || '');
        
        // Load speaker data
        if (content.speakerOverrides) {
          setSpeakerOverrides(content.speakerOverrides);
        }
        if (content.customSpeakers) {
          setCustomSpeakers(content.customSpeakers);
        }
        if (post.speakers) {
          setOriginalSpeakers(post.speakers);
        }
        
        // Fetch transcription to get original speaker data if needed
        if (post.transcriptionUrl && !content.speakerOverrides) {
          await fetchTranscriptionData(post.transcriptionUrl);
        }
        
        await fetchCreatorTiers();
        
      } catch (err) {
        console.error('Error fetching post:', err);
        setError(err.message || 'Failed to load post data');
        toast.error('Failed to load post data');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchPostData();
    }
  }, [id, navigate]);
  
  // Fetch transcription data to extract speakers
  const fetchTranscriptionData = async (url) => {
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.utterances) {
        const speakers = [...new Set(data.utterances.map(u => u.speaker))];
        const overrides = {};
        speakers.forEach(speaker => {
          overrides[speaker] = {
            displayName: `Speaker ${speaker}`,
            originalId: speaker,
            color: '#3b82f6'
          };
        });
        setSpeakerOverrides(overrides);
      }
    } catch (err) {
      console.error('Error fetching transcription:', err);
    }
  };
  
  // Fetch creator tiers
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
      toast.error('Failed to upload thumbnail. Please try again.');
      console.error(err);
    } finally {
      setIsUploadingThumbnail(false);
    }
  };
  
  // Speaker management functions
  const handleEditSpeaker = (speakerId, currentName, currentColor) => {
    setEditingSpeakerId(speakerId);
    setEditingSpeakerName(currentName);
    setEditingSpeakerColor(currentColor);
    setIsEditingSpeaker(true);
  };
  
  const handleSaveSpeakerOverride = () => {
    setSpeakerOverrides(prev => ({
      ...prev,
      [editingSpeakerId]: {
        ...prev[editingSpeakerId],
        displayName: editingSpeakerName,
        color: editingSpeakerColor
      }
    }));
    setIsEditingSpeaker(false);
    setEditingSpeakerId(null);
    toast.success('Speaker name updated successfully');
  };
  
  const handleAddCustomSpeaker = () => {
    if (!newCustomSpeakerName.trim()) {
      toast.error('Please enter a speaker name');
      return;
    }
    
    const newSpeaker = {
      id: `custom_${Date.now()}`,
      name: newCustomSpeakerName.trim(),
      color: newCustomSpeakerColor,
      order: customSpeakers.length
    };
    
    setCustomSpeakers(prev => [...prev, newSpeaker]);
    setNewCustomSpeakerName('');
    setNewCustomSpeakerColor('#3b82f6');
    toast.success(`Speaker "${newCustomSpeakerName}" added successfully`);
  };
  
  const handleRemoveCustomSpeaker = (speakerId) => {
    setCustomSpeakers(prev => prev.filter(s => s.id !== speakerId));
    toast.success('Speaker removed');
  };
  
  const handleRemoveSpeakerOverride = (speakerId) => {
    const newOverrides = { ...speakerOverrides };
    delete newOverrides[speakerId];
    setSpeakerOverrides(newOverrides);
    toast.success('Speaker override removed');
  };
  
  const handleUpdatePost = async () => {
    if (!postTitle.trim()) {
      toast.error('Please enter a post title');
      return;
    }
    
    if (postTitle.length < 3 || postTitle.length > 30) {
      toast.error('Title must be between 3 and 30 characters');
      return;
    }
    
    if (!postDescription || postDescription.trim() === "") {
      toast.error('Description is required for audio posts');
      return;
    }
    
    if (isPaid && !selectedTierId) {
      toast.error('Please select a membership tier for paid content');
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Prepare speakers array from overrides and custom speakers
      const speakers = [];
      
      // Add overridden speakers
      Object.entries(speakerOverrides).forEach(([originalId, override], index) => {
        speakers.push({
          name: override.displayName,
          order: index,
          originalId: originalId,
          color: override.color
        });
      });
      
      // Add custom speakers
      customSpeakers.forEach((speaker, index) => {
        speakers.push({
          name: speaker.name,
          order: speakers.length + index,
          id: speaker.id,
          color: speaker.color,
          isCustom: true
        });
      });
      
      const updateData = {
        title: postTitle.trim(),
        description: postDescription.trim(),
        thumbnailUrl: thumbnailUrl || "",
        isPaid: isPaid,
        commentsAllowed: commentsAllowed,
        isPublished: isPublished,
        ...(isPaid && { tierId: selectedTierId }),
        speakers: speakers,
        content: JSON.stringify({
          transcriptionText: editedTranscription,
          audioDuration: audioDuration,
          speakerOverrides: speakerOverrides,
          customSpeakers: customSpeakers
        })
      };
      
      const response = await api.put(`/creators/posts/${id}`, updateData);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update post');
      }
      
      toast.success('Audio post updated successfully!');
      
      setTimeout(() => {
        navigate('/creator/library');
      }, 1500);
      
    } catch (err) {
      console.error('Error updating post:', err);
      setError(err.message || 'Failed to update post. Please try again.');
      toast.error(err.message || 'Failed to update post');
    } finally {
      setIsSaving(false);
    }
  };
  
  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading post data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Music className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Edit Audio Post</h1>
              <Badge variant="secondary" className="ml-2">
                Audio
              </Badge>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/creator/library')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Library
            </Button>
          </div>
          <p className="text-muted-foreground">Edit your audio post details and settings</p>
        </div>
        
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-6">
          {/* Basic Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Edit the title, description, and thumbnail for your audio post</CardDescription>
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
                <Label>Description * (Required for audio posts)</Label>
                <Textarea
                  value={postDescription}
                  onChange={(e) => setPostDescription(e.target.value)}
                  placeholder="Add a description for your audio post..."
                  className="h-24"
                />
                <p className="text-xs text-muted-foreground">
                  Describe what listeners will learn from this audio
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
                        {thumbnailUrl ? 'Change Thumbnail' : 'Upload Thumbnail'}
                      </>
                    )}
                  </Button>
                  {thumbnailUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setThumbnailUrl('')}
                      className="text-destructive hover:text-destructive"
                    >
                      Remove
                    </Button>
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
              
              {audioUrl && (
                <div className="space-y-2 pt-4 border-t">
                  <Label>Audio Preview</Label>
                  <audio src={audioUrl} controls className="w-full" />
                  <p className="text-xs text-muted-foreground">
                    Duration: {formatDuration(audioDuration)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Speaker Management Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Speaker Management</CardTitle>
                  <CardDescription>Customize speaker names and colors</CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowSpeakerManager(!showSpeakerManager)}
                >
                  <User className="w-4 h-4 mr-2" />
                  {showSpeakerManager ? 'Hide Speakers' : 'Manage Speakers'}
                </Button>
              </div>
            </CardHeader>
            {showSpeakerManager && (
              <CardContent className="space-y-6">
                {/* Detected Speakers Section */}
                {Object.keys(speakerOverrides).length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm">Detected Speakers</h3>
                    <div className="space-y-2">
                      {Object.entries(speakerOverrides).map(([speakerId, speaker]) => (
                        <div key={speakerId} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: speaker.color }}
                            />
                            <div>
                              <p className="font-medium">{speaker.displayName}</p>
                              <p className="text-xs text-muted-foreground">Original: Speaker {speaker.originalId}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditSpeaker(speakerId, speaker.displayName, speaker.color)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveSpeakerOverride(speakerId)}
                              className="text-destructive hover:text-destructive"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Custom Speakers Section */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Custom Speakers</h3>
                  <div className="space-y-2">
                    {customSpeakers.map((speaker) => (
                      <div key={speaker.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: speaker.color }}
                          />
                          <span className="font-medium">{speaker.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveCustomSpeaker(speaker.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    
                    <div className="flex gap-2 mt-4">
                      <Input
                        placeholder="Speaker name"
                        value={newCustomSpeakerName}
                        onChange={(e) => setNewCustomSpeakerName(e.target.value)}
                        className="flex-1"
                      />
                      <input
                        type="color"
                        value={newCustomSpeakerColor}
                        onChange={(e) => setNewCustomSpeakerColor(e.target.value)}
                        className="w-12 h-10 rounded border"
                      />
                      <Button onClick={handleAddCustomSpeaker} size="sm">
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
          
          {/* Transcription Edit Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Transcription</CardTitle>
                  <CardDescription>View and edit the transcribed text</CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowEditTranscription(!showEditTranscription)}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  {showEditTranscription ? 'Hide Editor' : 'Edit Transcription'}
                </Button>
              </div>
            </CardHeader>
            {showEditTranscription && (
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Transcription Text</Label>
                  <Textarea
                    value={editedTranscription}
                    onChange={(e) => setEditedTranscription(e.target.value)}
                    className="font-mono text-sm min-h-52"
                    placeholder="Your transcription will appear here..."
                  />
                  <p className="text-xs text-muted-foreground">
                    {editedTranscription?.split(/\s+/).length || 0} words
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Note: Editing the transcription will update the post content
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
          
          {/* Post Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle>Post Settings</CardTitle>
              <CardDescription>Configure access, visibility, and interaction settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    {isPublished ? (
                      <Globe className="h-4 w-4" />
                    ) : (
                      <Lock className="h-4 w-4" />
                    )}
                    <Label className="font-semibold">
                      Published Status
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isPublished 
                      ? 'Post is visible to subscribers' 
                      : 'Post is hidden from subscribers'}
                  </p>
                </div>
                <Switch
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                />
              </div>
              
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <Label className="font-semibold">
                      Paid Content
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isPaid 
                      ? 'Only paid subscribers can access this content' 
                      : 'All subscribers can access this content'}
                  </p>
                </div>
                <Switch
                  checked={isPaid}
                  onCheckedChange={setIsPaid}
                />
              </div>
              
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
              
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <Label className="font-semibold">
                      Allow Comments
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {commentsAllowed 
                      ? 'Subscribers can comment on this post' 
                      : 'Comments are disabled for this post'}
                  </p>
                </div>
                <Switch
                  checked={commentsAllowed}
                  onCheckedChange={setCommentsAllowed}
                />
              </div>
              
              <div className="rounded-lg bg-muted p-4">
                <div className="flex items-start gap-3">
                  {isPublished ? (
                    <Globe className="h-5 w-5 mt-0.5" />
                  ) : (
                    <Lock className="h-5 w-5 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Post Summary</p>
                    <p className="text-sm text-muted-foreground">
                      • Status: {isPublished ? 'Published' : 'Draft'}
                      <br />
                      • Access: {isPaid ? 'Paid subscribers only' : 'All subscribers'}
                      <br />
                      • Comments: {commentsAllowed ? 'Enabled' : 'Disabled'}
                      {isPaid && selectedTierId && (
                        <>
                          <br /> • Tier: {creatorTiers.find(t => t._id === selectedTierId)?.tierName || 'Selected'}
                        </>
                      )}
                      <br /> • Speakers: {Object.keys(speakerOverrides).length + customSpeakers.length} configured
                    </p>
                    {isPaid && !selectedTierId && (
                      <p className="text-sm text-destructive mt-2">
                        ⚠️ Please select a membership tier before saving
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => navigate('/creator/library')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdatePost}
                  disabled={isSaving || (isPaid && !selectedTierId)}
                  className="flex-1"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Edit Speaker Dialog */}
      <Dialog open={isEditingSpeaker} onOpenChange={setIsEditingSpeaker}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Speaker Name</DialogTitle>
            <DialogDescription>
              Change the display name and color for this speaker
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Speaker Name</Label>
              <Input
                value={editingSpeakerName}
                onChange={(e) => setEditingSpeakerName(e.target.value)}
                placeholder="Enter speaker name..."
              />
            </div>
            <div className="space-y-2">
              <Label>Speaker Color</Label>
              <input
                type="color"
                value={editingSpeakerColor}
                onChange={(e) => setEditingSpeakerColor(e.target.value)}
                className="w-full h-10 rounded border"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingSpeaker(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSpeakerOverride}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditAudioPost;