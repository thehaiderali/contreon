
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Music, Check, AlertCircle, Loader2, Upload, Save, ArrowLeft, Globe, Lock, MessageSquare, DollarSign, Edit2 } from 'lucide-react';
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
import { uploadFiles } from '@/lib/uploadthing';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const EditAudioPost = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // This will get the post ID from URL: /creator/posts/audio/:id/edit
  
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
  
  // UI states
  const [creatorTiers, setCreatorTiers] = useState([]);
  const [isLoadingTiers, setIsLoadingTiers] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [showEditTranscription, setShowEditTranscription] = useState(false);
  
  const thumbnailInputRef = React.useRef(null);

  // Fetch post data
  useEffect(() => {
    const fetchPostData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch post details
        const postResponse = await api.get(`/creators/posts/${id}`);
        
        if (!postResponse.data.success) {
          throw new Error(postResponse.data.message || 'Failed to fetch post');
        }
        
        const post = postResponse.data.data;
        
        // Validate post type
        if (post.type !== 'audio') {
          toast.error('This is not an audio post');
          navigate('/creator/library');
          return;
        }
        
        // Parse content if it's a string
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
        
        // Fetch creator tiers for paid content
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
  
  const handleUpdatePost = async () => {
    // Validate all required fields
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
    
    // Validate tier selection for paid posts
    if (isPaid && !selectedTierId) {
      toast.error('Please select a membership tier for paid content');
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Prepare update data
      const updateData = {
        title: postTitle.trim(),
        description: postDescription.trim(),
        thumbnailUrl: thumbnailUrl || "",
        isPaid: isPaid,
        commentsAllowed: commentsAllowed,
        isPublished: isPublished,
        ...(isPaid && { tierId: selectedTierId }),
        // Only include content if transcription was edited
        ...(showEditTranscription && editedTranscription !== '' && {
          content: JSON.stringify({
            transcriptionText: editedTranscription,
            audioDuration: audioDuration
          })
        })
      };
      
      console.log("Updating audio post:", updateData);
      
      const response = await api.put(`/creators/posts/${id}`, updateData);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update post');
      }
      
      toast.success('Audio post updated successfully!');
      
      // Redirect to library after successful update
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading post data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Music className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-slate-900">Edit Audio Post</h1>
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
          <p className="text-slate-600">Edit your audio post details and settings</p>
        </div>
        
        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
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
              {/* Title */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-900">
                  Post Title * (3-30 characters)
                </label>
                <Input
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="Enter post title..."
                  className="text-base"
                  maxLength={30}
                />
                <p className="text-xs text-slate-500">
                  {postTitle.length}/30 characters
                </p>
              </div>
              
              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-900">
                  Description * (Required for audio posts)
                </label>
                <Textarea
                  value={postDescription}
                  onChange={(e) => setPostDescription(e.target.value)}
                  placeholder="Add a description for your audio post..."
                  className="h-24"
                  required
                />
                <p className="text-xs text-slate-500">
                  Describe what listeners will learn from this audio
                </p>
              </div>
              
              {/* Thumbnail */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-900">
                  Thumbnail (Optional)
                </label>
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
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-xs text-slate-500">
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
              
              {/* Audio Preview */}
              {audioUrl && (
                <div className="space-y-2 pt-4 border-t">
                  <label className="block text-sm font-medium text-slate-900">
                    Audio Preview
                  </label>
                  <audio src={audioUrl} controls className="w-full" />
                  <p className="text-xs text-slate-500">
                    Duration: {formatDuration(audioDuration)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Transcription Edit Card (Optional) */}
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
                  <label className="block text-sm font-medium text-slate-900">
                    Transcription Text
                  </label>
                  <Textarea
                    value={editedTranscription}
                    onChange={(e) => setEditedTranscription(e.target.value)}
                    className="font-mono text-sm min-h-[200px]"
                    placeholder="Your transcription will appear here..."
                  />
                  <p className="text-xs text-slate-600">
                    {editedTranscription?.split(/\s+/).length || 0} words
                  </p>
                  <p className="text-xs text-amber-600">
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
              {/* Published Status Toggle */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    {isPublished ? (
                      <Globe className="h-4 w-4 text-green-600" />
                    ) : (
                      <Lock className="h-4 w-4 text-slate-600" />
                    )}
                    <Label htmlFor="published-status" className="font-semibold">
                      Published Status
                    </Label>
                  </div>
                  <p className="text-sm text-slate-600">
                    {isPublished 
                      ? 'Post is visible to subscribers' 
                      : 'Post is hidden from subscribers'}
                  </p>
                </div>
                <Switch
                  id="published-status"
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                />
              </div>
              
              {/* Paid Content Toggle */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-slate-600" />
                    <Label htmlFor="paid-content" className="font-semibold">
                      Paid Content
                    </Label>
                  </div>
                  <p className="text-sm text-slate-600">
                    {isPaid 
                      ? 'Only paid subscribers can access this content' 
                      : 'All subscribers can access this content'}
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
                    <Label htmlFor="tier-select" className="font-semibold">
                      Select Membership Tier
                    </Label>
                    <p className="text-sm text-slate-600">
                      Choose which membership tier can access this content
                    </p>
                  </div>
                  
                  {isLoadingTiers ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
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
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a membership tier" />
                      </SelectTrigger>
                      <SelectContent>
                        {creatorTiers.map((tier) => (
                          <SelectItem key={tier._id} value={tier._id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{tier.tierName}</span>
                              <span className="text-xs text-slate-500">
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
                    <MessageSquare className="h-4 w-4 text-slate-600" />
                    <Label htmlFor="comments-allowed" className="font-semibold">
                      Allow Comments
                    </Label>
                  </div>
                  <p className="text-sm text-slate-600">
                    {commentsAllowed 
                      ? 'Subscribers can comment on this post' 
                      : 'Comments are disabled for this post'}
                  </p>
                </div>
                <Switch
                  id="comments-allowed"
                  checked={commentsAllowed}
                  onCheckedChange={setCommentsAllowed}
                />
              </div>
              
              {/* Preview Information */}
              <div className="rounded-lg bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  {isPublished ? (
                    <Globe className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <Lock className="h-5 w-5 text-slate-500 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-900">Post Summary</p>
                    <p className="text-sm text-slate-600">
                      • Status: {isPublished ? 'Published' : 'Draft'}
                      <br />
                      • Access: {isPaid ? 'Paid subscribers only' : 'All subscribers'}
                      <br />
                      • Comments: {commentsAllowed ? 'Enabled' : 'Disabled'}
                      {isPaid && selectedTierId && (
                       <>
                        <br /> • Tier :  {creatorTiers.find(t => t._id === selectedTierId)?.tierName || 'Selected'}
                       </>
                      )}
                    </p>
                    {isPaid && !selectedTierId && (
                      <p className="text-sm text-amber-600 mt-2">
                        ⚠️ Please select a membership tier before saving
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
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
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
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
    </div>
  );
};

export default EditAudioPost;