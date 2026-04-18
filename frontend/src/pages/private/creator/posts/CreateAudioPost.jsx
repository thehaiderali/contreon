import React, { useState, useRef, useEffect } from 'react';
import { Upload, Music, Check, AlertCircle, Loader2, Edit2, Save, DollarSign, MessageSquare, Lock, User, Pencil, X, Plus } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { uploadFiles } from '@/lib/uploadthing';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useLocation, useNavigate } from 'react-router';

const CreateAudioPost = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState('upload');
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [transcriptionData, setTranscriptionData] = useState(null);
  const [editedTranscription, setEditedTranscription] = useState(null);
  const [transcriptUrl, setTranscriptUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [audioFileName, setAudioFileName] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  
  // Post fields
  const [postTitle, setPostTitle] = useState('');
  const [postDescription, setPostDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  
  // Post settings
  const [isPaid, setIsPaid] = useState(false);
  const [commentsAllowed, setCommentsAllowed] = useState(true);
  const [selectedTierId, setSelectedTierId] = useState('');
  
  // Speaker management
  const [speakerOverrides, setSpeakerOverrides] = useState({});
  const [customSpeakers, setCustomSpeakers] = useState([]);
  const [isEditingSpeakers, setIsEditingSpeakers] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState(null);
  const [newSpeakerName, setNewSpeakerName] = useState('');
  const [newSpeakerColor, setNewSpeakerColor] = useState('#3b82f6');
  
  const [creatorTiers, setCreatorTiers] = useState([]);
  const [isLoadingTiers, setIsLoadingTiers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const audioRef = useRef(null);
  const thumbnailInputRef = useRef(null);

  useEffect(() => {
    console.log('State updated - audioUrl:', audioUrl);
    console.log('State updated - transcriptUrl:', transcriptUrl);
    console.log('State updated - currentStep:', currentStep);
  }, [audioUrl, transcriptUrl, currentStep]);

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

  const handleAudioUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAudioFile(file);
    setAudioFileName(file.name);
    setError(null);

    try {
      setIsLoading(true);
      console.log('Uploading audio file...');
      const uploadResult = await uploadFiles("audioUploader", {
        files: [file]
      });
      const uploadedAudioUrl = uploadResult[0].ufsUrl;
      console.log('Audio uploaded successfully:', uploadedAudioUrl);
      setAudioUrl(uploadedAudioUrl);

      await handleTranscription(uploadedAudioUrl);
    } catch (err) {
      setError('Failed to upload audio. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
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
      setError('Failed to upload thumbnail. Please try again.');
      console.error(err);
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  const handleTranscription = async (audioUrl) => {
    try {
      setCurrentStep('transcribing');
      setIsLoading(true);

      console.log('Requesting transcription for:', audioUrl);
      const response = await api.post("/creators/transcribe", {
        audioUrl
      });

      if (!response.data.success)
        throw new Error('Transcription failed');

      const data = response.data.data.transcript;
      console.log('Transcription received:', data.id);
      setTranscriptionData(data);
      setEditedTranscription(data.text);
      
      // Initialize speaker overrides from detected speakers
      if (data.utterances) {
        const detectedSpeakers = [...new Set(data.utterances.map(u => u.speaker))];
        const overrides = {};
        detectedSpeakers.forEach(speaker => {
          if (speaker) {
            overrides[speaker] = {
              displayName: `Speaker ${speaker}`,
              originalId: speaker,
              color: getSpeakerColor(speaker)
            };
          }
        });
        setSpeakerOverrides(overrides);
      }
      
      setCurrentStep('preview');
    } catch (err) {
      setError('Failed to transcribe audio. Please try again.');
      setCurrentStep('upload');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getSpeakerColor = (speakerId) => {
    const colors = {
      'A': '#3b82f6',
      'B': '#10b981',
      'C': '#f59e0b',
      'D': '#ef4444',
      'E': '#8b5cf6',
      'F': '#ec4899'
    };
    return colors[speakerId] || '#6b7280';
  };

  const handleSaveTranscript = async () => {
    try {
      setIsLoading(true);
      
      // Update transcription with speaker overrides
      const updatedUtterances = transcriptionData.utterances?.map(utterance => ({
        ...utterance,
        speaker: speakerOverrides[utterance.speaker]?.displayName || utterance.speaker,
        speakerOriginalId: utterance.speaker
      }));
      
      const updatedTranscription = {
        ...transcriptionData,
        text: editedTranscription,
        utterances: updatedUtterances,
        speakerOverrides: speakerOverrides,
        customSpeakers: customSpeakers
      };
      
      const transcriptJSON = JSON.stringify(updatedTranscription, null, 2);
      const blob = new Blob([transcriptJSON], { type: 'application/json' });
      const transcriptFile = new File(
        [blob], 
        `${audioFileName.replace(/\.[^/.]+$/, '')}_transcript.json`, 
        { type: 'application/json' }
      );
      
      const uploadResult = await uploadFiles("transcriptionUploader", {
        files: [transcriptFile]
      });
      
      const uploadedTranscriptUrl = uploadResult[0].ufsUrl;
      console.log('Transcription uploaded successfully:', uploadedTranscriptUrl);
      setTranscriptUrl(uploadedTranscriptUrl);
      
      setCurrentStep('edit');
      setError(null);
      toast.success('Transcription saved successfully!');
    } catch (err) {
      setError('Failed to save transcription. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSpeakerName = (speakerId, newName, color) => {
    setSpeakerOverrides(prev => ({
      ...prev,
      [speakerId]: {
        ...prev[speakerId],
        displayName: newName,
        color: color
      }
    }));
    setEditingSpeaker(null);
    setNewSpeakerName('');
  };

  const handleAddCustomSpeaker = () => {
    if (newSpeakerName.trim()) {
      const newSpeaker = {
        id: `custom_${Date.now()}`,
        name: newSpeakerName.trim(),
        color: newSpeakerColor
      };
      setCustomSpeakers(prev => [...prev, newSpeaker]);
      setNewSpeakerName('');
      toast.success(`Speaker "${newSpeakerName}" added successfully!`);
    }
  };

  const handleRemoveCustomSpeaker = (speakerId) => {
    setCustomSpeakers(prev => prev.filter(s => s.id !== speakerId));
  };

  const getUtterancesByTime = () => {
    if (!transcriptionData?.utterances) return [];
    return transcriptionData.utterances.filter((u) => {
      const start = (u.start || 0) / 1000;
      const end = (u.end || 0) / 1000;
      return start <= currentTime && currentTime <= end;
    });
  };

  const getSpeakerDisplay = (speakerId) => {
    if (speakerOverrides[speakerId]) {
      return {
        name: speakerOverrides[speakerId].displayName,
        color: speakerOverrides[speakerId].color,
        isOverridden: true
      };
    }
    return {
      name: `Speaker ${speakerId}`,
      color: getSpeakerColor(speakerId),
      isOverridden: false
    };
  };

  const getSpeakerLabel = (speaker) => {
    const display = getSpeakerDisplay(speaker);
    return {
      bg: `bg-[${display.color}]/10`,
      text: `text-[${display.color}]`,
      label: display.name,
      color: display.color
    };
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleCreatePost = async () => {
    console.log('Creating post with data:', {
      postTitle,
      audioUrl,
      transcriptUrl,
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
      setError('Description is required for audio posts');
      return;
    }

    if (!audioUrl) {
      setError('Audio URL is missing. Please upload audio again.');
      return;
    }

    if (!transcriptUrl) {
      setError('Transcription URL is missing. Please save the transcription first.');
      return;
    }

    if (isPaid && !selectedTierId) {
      setError('Please select a membership tier for paid content');
      return;
    }

    setIsSubmitting(true);

    try {
      const slug = generateSlug(postTitle);
      
      // Extract speakers from transcription with overrides
      const speakers = [];
      if (transcriptionData?.utterances) {
        const uniqueSpeakers = [...new Set(transcriptionData.utterances.map(u => u.speaker))];
        uniqueSpeakers.forEach((speaker, index) => {
          const display = getSpeakerDisplay(speaker);
          speakers.push({
            name: display.name,
            order: index,
            originalId: speaker,
            color: display.color
          });
        });
      }
      
      const postData = {
        title: postTitle.trim(),
        type: "audio",
        slug: slug,
        content: JSON.stringify({
          transcriptionText: editedTranscription,
          audioDuration: transcriptionData?.audio_duration || 0,
          speakerOverrides: speakerOverrides,
          customSpeakers: customSpeakers,
          speakers: speakers
        }),
        description: postDescription.trim(),
        thumbnailUrl: thumbnailUrl || "",
        audioUrl: audioUrl,
        transcriptionUrl: transcriptUrl,
        isPaid: isPaid,
        tierId: isPaid ? selectedTierId : undefined,
        commentsAllowed: commentsAllowed,
        isPublished: true,
        speakers: speakers // Add speakers array to the post
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
        toast.success('Audio post created successfully!');
      }
      
      setCurrentStep('publishing');
      
      setTimeout(() => {
        setCurrentStep('upload');
        setAudioFile(null);
        setAudioUrl(null);
        setTranscriptionData(null);
        setEditedTranscription(null);
        setTranscriptUrl(null);
        setPostTitle('');
        setPostDescription('');
        setThumbnailUrl('');
        setIsPaid(false);
        setCommentsAllowed(true);
        setSelectedTierId('');
        setSpeakerOverrides({});
        setCustomSpeakers([]);
        setError(null);
        
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

  return (
    <div className="container mx-auto py-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Music className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Create Audio Post</h1>
          </div>
          <p className="text-muted-foreground">Upload, transcribe, and edit your audio content</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {['upload', 'transcribing', 'preview', 'edit', 'publishing'].map((step, idx) => {
              const steps = ['upload', 'transcribing', 'preview', 'edit', 'publishing'];
              const isActive = steps.indexOf(currentStep) >= idx;
              const isCompleted = steps.indexOf(currentStep) > idx;

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
                      {isCompleted ? <Check className="w-5 h-5" /> : idx + 1}
                    </div>
                    <span className="text-xs text-muted-foreground mt-2 capitalize">{step}</span>
                  </div>
                  {idx < 4 && (
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

        {/* Step 1: Upload */}
        {currentStep === 'upload' && (
          <Card>
            <CardHeader>
              <CardTitle>Upload Your Audio</CardTitle>
              <CardDescription>Select an audio file to transcribe</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed rounded-lg p-12 text-center">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Upload Audio File</h3>
                <p className="text-muted-foreground mb-6">Drag and drop or click to select</p>
                <input
                  type="file"
                  id="audio-upload"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  className="hidden"
                  disabled={isLoading}
                />
                <label htmlFor="audio-upload">
                  <Button
                    asChild
                    disabled={isLoading}
                  >
                    <span>
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Choose Audio File
                        </>
                      )}
                    </span>
                  </Button>
                </label>
                <p className="text-xs text-muted-foreground mt-4">MP3, WAV, M4A, OGG (Max 2GB)</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Transcribing */}
        {currentStep === 'transcribing' && (
          <Card>
            <CardHeader>
              <CardTitle>Transcribing Audio</CardTitle>
              <CardDescription>{audioFileName}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 animate-spin mb-4" />
              <p className="text-center">
                Processing your audio with Assembly AI...
              </p>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Preview with Sync */}
        {currentStep === 'preview' && transcriptionData && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Audio Preview & Transcription</CardTitle>
                    <CardDescription>Listen and review the transcription</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingSpeakers(!isEditingSpeakers)}
                  >
                    <User className="w-4 h-4 mr-2" />
                    {isEditingSpeakers ? "View Transcription" : "Manage Speakers"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Audio Player */}
                <div className="space-y-3">
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    controls
                    className="w-full"
                    onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatTime(currentTime)}</span>
                    <span>
                      {formatTime(
                        audioRef.current?.duration || transcriptionData.audio_duration || 0
                      )}
                    </span>
                  </div>
                </div>

                {isEditingSpeakers ? (
                  /* Speaker Management Interface */
                  <div className="space-y-6">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-3">Detected Speakers</h3>
                      <div className="space-y-3">
                        {Object.entries(speakerOverrides).map(([speakerId, speaker]) => (
                          <div key={speakerId} className="flex items-center justify-between p-3 bg-background rounded-lg border">
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
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingSpeaker(speakerId);
                                setNewSpeakerName(speaker.displayName);
                              }}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-3">Custom Speakers</h3>
                      <div className="space-y-3">
                        {customSpeakers.map((speaker) => (
                          <div key={speaker.id} className="flex items-center justify-between p-3 bg-background rounded-lg border">
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
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        
                        <div className="flex gap-2 mt-4">
                          <Input
                            placeholder="Speaker name"
                            value={newSpeakerName}
                            onChange={(e) => setNewSpeakerName(e.target.value)}
                            className="flex-1"
                          />
                          <input
                            type="color"
                            value={newSpeakerColor}
                            onChange={(e) => setNewSpeakerColor(e.target.value)}
                            className="w-12 h-10 rounded border"
                          />
                          <Button onClick={handleAddCustomSpeaker} size="sm">
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Tabs for Different Views */
                  <Tabs defaultValue="speakers" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="speakers">By Speaker</TabsTrigger>
                      <TabsTrigger value="continuous">Full Text</TabsTrigger>
                      <TabsTrigger value="highlights">Key Points</TabsTrigger>
                    </TabsList>

                    {/* By Speaker View */}
                    <TabsContent value="speakers" className="space-y-4 mt-6 max-h-96 overflow-y-auto">
                      {transcriptionData.utterances?.map((utterance, idx) => {
                        const display = getSpeakerDisplay(utterance.speaker);
                        return (
                          <div
                            key={idx}
                            className={`p-4 rounded-lg border-l-4 cursor-pointer hover:bg-muted transition-colors`}
                            style={{ borderLeftColor: display.color }}
                            onClick={() => {
                              if (audioRef.current) {
                                audioRef.current.currentTime = (utterance.start || 0) / 1000;
                                audioRef.current.play();
                              }
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <Badge 
                                variant="secondary"
                                style={{ 
                                  backgroundColor: `${display.color}20`,
                                  color: display.color,
                                  borderColor: display.color
                                }}
                              >
                                {display.name}
                              </Badge>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-muted-foreground">
                                  {formatTime((utterance.start || 0) / 1000)}
                                </p>
                                <p className="mt-1">{utterance.text}</p>
                                <p className="text-xs text-muted-foreground mt-2">
                                  Confidence: {(utterance.confidence * 100).toFixed(1)}%
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </TabsContent>

                    {/* Full Text View */}
                    <TabsContent value="continuous" className="mt-6">
                      <div className="bg-muted p-6 rounded-lg border max-h-96 overflow-y-auto">
                        <p className="leading-relaxed">
                          {transcriptionData.text}
                        </p>
                      </div>
                    </TabsContent>

                    {/* Key Points View */}
                    <TabsContent value="highlights" className="mt-6 space-y-3 max-h-96 overflow-y-auto">
                      {transcriptionData.auto_highlights_result?.results?.length > 0 ? (
                        transcriptionData.auto_highlights_result.results.slice(0, 10).map((highlight, idx) => (
                          <div
                            key={idx}
                            className="p-4 bg-muted rounded-lg border"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <p className="font-semibold">{highlight.text}</p>
                              <Badge variant="outline" className="ml-2">
                                {highlight.count}x
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Relevance: {(highlight.rank * 100).toFixed(1)}%
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground">No key highlights found</p>
                      )}
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setCurrentStep('upload')}
                className="flex-1"
              >
                Back
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

        {/* Speaker Edit Dialog */}
        <Dialog open={!!editingSpeaker} onOpenChange={() => setEditingSpeaker(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Speaker Name</DialogTitle>
              <DialogDescription>
                Change the display name for this speaker
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Speaker Name</Label>
                <Input
                  value={newSpeakerName}
                  onChange={(e) => setNewSpeakerName(e.target.value)}
                  placeholder="Enter speaker name..."
                />
              </div>
              <div className="space-y-2">
                <Label>Speaker Color</Label>
                <input
                  type="color"
                  value={newSpeakerColor}
                  onChange={(e) => setNewSpeakerColor(e.target.value)}
                  className="w-full h-10 rounded border"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingSpeaker(null)}>
                Cancel
              </Button>
              <Button onClick={() => handleUpdateSpeakerName(editingSpeaker, newSpeakerName, newSpeakerColor)}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Step 4: Edit Transcription & Post Details */}
        {currentStep === 'edit' && (
          <div className="space-y-6">
            {/* Edit Transcription Card */}
            <Card>
              <CardHeader>
                <CardTitle>Edit Transcription</CardTitle>
                <CardDescription>
                  Make corrections to the transcribed text before publishing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Transcription Text</Label>
                  <Textarea
                    value={editedTranscription || ''}
                    onChange={(e) => setEditedTranscription(e.target.value)}
                    className="font-mono text-sm h-64"
                    placeholder="Your transcription will appear here..."
                  />
                  <p className="text-xs text-muted-foreground">
                    {editedTranscription?.split(/\s+/).length || 0} words
                  </p>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-2xl font-bold text-primary">
                        {Object.keys(speakerOverrides).length}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Speakers</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-2xl font-bold text-primary">
                        {(transcriptionData?.language_confidence * 100).toFixed(0)}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Confidence</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-2xl font-bold text-primary">
                        {Math.floor((transcriptionData?.audio_duration || 0) / 60)}m
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Duration</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Save Transcription Button */}
                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveTranscript}
                    disabled={isLoading || !editedTranscription}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Edited Transcription
                      </>
                    )}
                  </Button>
                </div>

                {/* Show message if transcription is saved */}
                {transcriptUrl && (
                  <Alert>
                    <Check className="h-4 w-4" />
                    <AlertDescription>
                      Transcription saved successfully! You can now proceed to add post details.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Post Details - Only show if transcript is saved */}
            {transcriptUrl && (
              <>
                {/* Basic Post Info Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Post Details</CardTitle>
                    <CardDescription>Add title, description, and thumbnail for your post</CardDescription>
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
                        required
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
                              ? `This post will be locked behind a paywall. Only subscribers of the selected tier can access it.`
                              : `This post will be publicly accessible to all subscribers.`}
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
                        disabled={isSubmitting || (isPaid && !selectedTierId)}
                        className="flex-1"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Publishing...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Publish Post
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
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
              <h2 className="text-2xl font-bold mb-2">Post Published!</h2>
              <p className="text-muted-foreground mb-6">
                Your audio post has been successfully created and published.
              </p>
              <Button
                onClick={() => setCurrentStep('upload')}
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

export default CreateAudioPost;