import React, { useRef, useState, useEffect } from 'react';
import { Upload, Loader2, AlertCircle, Play, Check, MessageSquare, Lock, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { toast } from 'sonner';
import { uploadFiles } from '@/lib/uploadthing';
import { api } from '@/lib/api';

const EditDetailsStep = ({
  postTitle,
  setPostTitle,
  postDescription,
  setPostDescription,
  thumbnailUrl,
  setThumbnailUrl,
  accessType,
  isPaid,
  commentsAllowed,
  setCommentsAllowed,
  selectedTierId,
  setSelectedTierId,
  onPublish,
  onBack,
  isMountedRef
}) => {
  const thumbnailInputRef = useRef(null);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [creatorTiers, setCreatorTiers] = useState([]);
  const [isLoadingTiers, setIsLoadingTiers] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isPaid) {
      fetchTiers();
    }
  }, [isPaid]);

  const fetchTiers = async () => {
    setIsLoadingTiers(true);
    try {
      const response = await api.get('/creators/memberships/me');
      if (!isMountedRef.current) return;

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
      if (!isMountedRef.current) return;
      console.error('Error fetching tiers:', error);
    } finally {
      if (isMountedRef.current) {
        setIsLoadingTiers(false);
      }
    }
  };

  const handleThumbnailUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingThumbnail(true);
    try {
      const uploadResult = await uploadFiles('imageUploader', {
        files: [file]
      });

      if (!isMountedRef.current) return;

      setThumbnailUrl(uploadResult[0].ufsUrl);
      toast.success('Thumbnail uploaded successfully!');
    } catch (err) {
      if (!isMountedRef.current) return;
      setError('Failed to upload thumbnail. Please try again.');
      console.error(err);
    } finally {
      if (isMountedRef.current) {
        setIsUploadingThumbnail(false);
      }
    }
  };

  const handleSubmit = () => {
    if (!postTitle.trim()) {
      setError('Please enter a post title');
      return;
    }

    if (postTitle.length < 3 || postTitle.length > 30) {
      setError('Title must be between 3 and 30 characters');
      return;
    }

    if (!postDescription || postDescription.trim() === '') {
      setError('Description is required for video posts');
      return;
    }

    if (isPaid && !selectedTierId) {
      setError('Please select a membership tier for paid content');
      return;
    }

    setError(null);
    onPublish();
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mx-auto max-w-2xl space-y-6">
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

        <Card>
          <CardHeader>
            <CardTitle>Post Settings</CardTitle>
            <CardDescription>Configure access and interaction settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center gap-2 mb-2">
                {accessType === 'free' ? (
                  <Globe className="h-5 w-5" />
                ) : (
                  <Lock className="h-5 w-5" />
                )}
                <span className="font-semibold">
                  {accessType === 'free' ? 'Free Video' : 'Paid/Exclusive Video'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {accessType === 'free'
                  ? 'This video will be publicly accessible to everyone.'
                  : 'This video will be locked behind a paywall. Only subscribers can access it.'}
              </p>
            </div>

            {isPaid && (
              <div className="space-y-3 rounded-lg border p-4">
                <div className="space-y-1">
                  <Label className="font-semibold">Select Membership Tier</Label>
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
                  <Label className="font-semibold">Allow Comments</Label>
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

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                onClick={onBack}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1"
              >
                <Play className="w-4 h-4 mr-2" />
                Publish Video Post
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditDetailsStep;