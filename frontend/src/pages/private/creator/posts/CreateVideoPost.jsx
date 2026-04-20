import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { useLocation, useNavigate } from 'react-router';
import { api } from '@/lib/api';

import AccessTypeStep from './AccessTypeStep';
import FreeVideoUploadStep from './FreeVideoUploadStep';
import PaidVideoUploadStep from './PaidVideoUploadStep';
import PreviewStep from './PreviewStep';
import EditDetailsStep from './EditDetailsStep';

const CreateVideoPost = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMountedRef = useRef(true);

  // Step management
  const [currentStep, setCurrentStep] = useState('access-type');

  // Access type
  const [accessType, setAccessType] = useState(null);

  // Video data
  const [videoData, setVideoData] = useState({
    url: '',
    playbackId: '',
    assetId: '',
    duration: 0,
    signedUrl: ''
  });

  const [thumbnailUrl, setThumbnailUrl] = useState('');

  // Post details
  const [postTitle, setPostTitle] = useState('');
  const [postDescription, setPostDescription] = useState('');
  const [commentsAllowed, setCommentsAllowed] = useState(true);
  const [selectedTierId, setSelectedTierId] = useState('');

  // UI state
  const [error, setError] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleAccessTypeSelect = () => {
    setError(null);
    setCurrentStep('upload');
  };

  const handleFreeVideoUpload = (url) => {
    setVideoData(prev => ({ ...prev, url }));
    setCurrentStep('preview');
  };

  const handlePaidVideoUpload = (data) => {
    setVideoData(prev => ({
      ...prev,
      playbackId: data.playbackId,
      assetId: data.assetId,
      duration: data.duration,
      signedUrl: data.signedUrl
    }));
    setCurrentStep('preview');
  };

  const handleGoToEdit = () => {
    setCurrentStep('edit');
  };

  const handleBackToUpload = () => {
    setVideoData({ url: '', playbackId: '', assetId: '', duration: 0, signedUrl: '' });
    setCurrentStep('upload');
  };

  const handlePublish = async () => {
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

    if (accessType === 'free' && !videoData.url) {
      setError('Video upload is incomplete');
      return;
    }

    if (accessType === 'paid' && !videoData.playbackId) {
      setError('Video processing incomplete');
      return;
    }

    if (accessType === 'paid' && !selectedTierId) {
      setError('Please select a membership tier for paid content');
      return;
    }

    setIsPublishing(true);

    try {
      const slug = generateSlug(postTitle);

      const postData = {
        title: postTitle.trim(),
        type: 'video',
        slug: slug,
        description: postDescription.trim(),
        thumbnailUrl: thumbnailUrl || '',
        isPaid: accessType === 'paid',
        commentsAllowed: commentsAllowed,
        isPublished: true
      };

      if (accessType === 'free') {
        postData.videoUrl = videoData.url;
      } else {
        postData.playbackId = videoData.playbackId;
        postData.assetId = videoData.assetId;
        postData.videoDuration = videoData.duration;
        postData.tierId = selectedTierId;
        postData.content = JSON.stringify({
          signedUrl: videoData.signedUrl,
          videoDuration: videoData.duration
        });
      }

      const response = await api.post('/creators/posts', postData);

      if (!isMountedRef.current) return;

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create post');
      }

      const newPost = response.data.data;

      if (location.state?.collectionId) {
        try {
          await api.post(
            `/collections/${location.state.collectionId}/posts/${newPost._id}`
          );
          toast.success('Post created and added to collection!');
        } catch (err) {
          console.error('Failed to add to collection:', err);
          toast.success('Post created but failed to add to collection');
        }
      } else {
        toast.success('Video post created successfully!');
      }

      navigate("/creator/library");
    } catch (err) {
      if (!isMountedRef.current) return;
      console.error('Error creating post:', err);
      setError(err.message || 'Failed to create post. Please try again.');
      setIsPublishing(false);
    }
  };

  if (currentStep === 'access-type') {
    return (
      <AccessTypeStep
        accessType={accessType}
        setAccessType={setAccessType}
        onContinue={handleAccessTypeSelect}
        error={error}
        setError={setError}
      />
    );
  }

  if (currentStep === 'upload') {
    if (accessType === 'free') {
      return (
        <FreeVideoUploadStep
          onUploadSuccess={handleFreeVideoUpload}
          onBack={() => {
            setCurrentStep('access-type');
            setAccessType(null);
          }}
          isMountedRef={isMountedRef}
        />
      );
    }

    if (accessType === 'paid') {
      return (
        <PaidVideoUploadStep
          onUploadSuccess={handlePaidVideoUpload}
          onBack={() => {
            setCurrentStep('access-type');
            setAccessType(null);
          }}
          isMountedRef={isMountedRef}
        />
      );
    }
  }

  if (currentStep === 'preview') {
    return (
      <PreviewStep
        videoUrl={videoData.url || videoData.signedUrl}
        thumbnailUrl={thumbnailUrl}
        accessType={accessType}
        playbackId={videoData.playbackId}
        assetId={videoData.assetId}
        videoDuration={videoData.duration}
        onEdit={handleGoToEdit}
        onUploadDifferent={handleBackToUpload}
      />
    );
  }

  if (currentStep === 'edit') {
    return (
      <EditDetailsStep
        postTitle={postTitle}
        setPostTitle={setPostTitle}
        postDescription={postDescription}
        setPostDescription={setPostDescription}
        thumbnailUrl={thumbnailUrl}
        setThumbnailUrl={setThumbnailUrl}
        accessType={accessType}
        isPaid={accessType === 'paid'}
        commentsAllowed={commentsAllowed}
        setCommentsAllowed={setCommentsAllowed}
        selectedTierId={selectedTierId}
        setSelectedTierId={setSelectedTierId}
        onPublish={handlePublish}
        onBack={() => setCurrentStep('preview')}
        isMountedRef={isMountedRef}
      />
    );
  }

  return null;
};

export default CreateVideoPost;