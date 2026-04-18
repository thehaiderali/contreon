
import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Play, Pause, Volume2, VolumeX, ScrollText, User, SkipBack, SkipForward, ChevronUp, ChevronDown, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';


const AudioPost = ({ post }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [transcription, setTranscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [speakerSegments, setSpeakerSegments] = useState([]);
  const [activeSegmentId, setActiveSegmentId] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [highlightedWordIds, setHighlightedWordIds] = useState(new Set());
  const [speakerOverrides, setSpeakerOverrides] = useState({});
  const [customSpeakers, setCustomSpeakers] = useState([]);
  const [showSpeakerInfo, setShowSpeakerInfo] = useState(false);

  // Refs
  const audioRef = useRef(null);
  const scrollAreaRef = useRef(null);
  const segmentRefs = useRef({});
  const wordRefs = useRef({});

  // Format time for display (mm:ss)
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get speaker display name from overrides
  const getSpeakerDisplayName = (speakerId) => {
    if (speakerOverrides[speakerId]) {
      return speakerOverrides[speakerId].displayName;
    }
    
    // Check if it's a custom speaker
    const customSpeaker = customSpeakers.find(s => s.id === speakerId || s.name === speakerId);
    if (customSpeaker) {
      return customSpeaker.name;
    }
    
    return speakerId === 'Unknown' ? 'Unknown Speaker' : `Speaker ${speakerId}`;
  };

  // Get speaker color from overrides
  const getSpeakerColorClass = (speakerId) => {
    if (speakerOverrides[speakerId] && speakerOverrides[speakerId].color) {
      const color = speakerOverrides[speakerId].color;
      return {
        bg: `bg-[${color}]/10`,
        text: `text-[${color}]`,
        border: `border-[${color}]/30`,
        baseBg: `bg-[${color}]`
      };
    }
    
    const customSpeaker = customSpeakers.find(s => s.id === speakerId || s.name === speakerId);
    if (customSpeaker && customSpeaker.color) {
      return {
        bg: `bg-[${customSpeaker.color}]/10`,
        text: `text-[${customSpeaker.color}]`,
        border: `border-[${customSpeaker.color}]/30`,
        baseBg: `bg-[${customSpeaker.color}]`
      };
    }
    
    const defaultColors = {
      'A': { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-200', border: 'border-green-200 dark:border-green-800', baseBg: 'bg-green-500' },
      'B': { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-200', border: 'border-blue-200 dark:border-blue-800', baseBg: 'bg-blue-500' },
      'C': { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-800 dark:text-purple-200', border: 'border-purple-200 dark:border-purple-800', baseBg: 'bg-purple-500' },
      'D': { bg: 'bg-orange-100 dark:bg-orange-900', text: 'text-orange-800 dark:text-orange-200', border: 'border-orange-200 dark:border-orange-800', baseBg: 'bg-orange-500' },
      'E': { bg: 'bg-pink-100 dark:bg-pink-900', text: 'text-pink-800 dark:text-pink-200', border: 'border-pink-200 dark:border-pink-800', baseBg: 'bg-pink-500' },
      'F': { bg: 'bg-indigo-100 dark:bg-indigo-900', text: 'text-indigo-800 dark:text-indigo-200', border: 'border-indigo-200 dark:border-indigo-800', baseBg: 'bg-indigo-500' },
      'Unknown': { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-800 dark:text-gray-200', border: 'border-gray-200 dark:border-gray-700', baseBg: 'bg-gray-500' }
    };
    
    return defaultColors[speakerId] || defaultColors['Unknown'];
  };

  // Process transcription into speaker segments with word-level granularity
  const processSpeakerSegments = useCallback((words, overrides, customs) => {
    if (!words || words.length === 0) return [];

    const segments = [];
    let currentSegment = null;

    words.forEach((word, wordIndex) => {
      // Get the original speaker ID or name
      let speaker = word.speaker || word.speakerOriginalId || 'Unknown';
      
      // Apply override if available
      if (overrides[speaker]) {
        speaker = overrides[speaker].displayName;
      } else if (customs.find(c => c.id === speaker || c.name === speaker)) {
        const custom = customs.find(c => c.id === speaker || c.name === speaker);
        speaker = custom.name;
      }
      
      const wordWithId = {
        ...word,
        wordId: `word-${wordIndex}`,
        originalSpeaker: word.speaker || word.speakerOriginalId || 'Unknown',
        displaySpeaker: speaker,
        text: word.text + ' ' // Add space after each word
      };

      if (!currentSegment || currentSegment.speaker !== speaker) {
        if (currentSegment) {
          segments.push(currentSegment);
        }
        currentSegment = {
          id: `segment-${segments.length}`,
          speaker: speaker,
          originalSpeaker: wordWithId.originalSpeaker,
          text: word.text,
          words: [wordWithId],
          start: word.start,
          end: word.end
        };
      } else {
        currentSegment.text += ' ' + word.text;
        currentSegment.words.push(wordWithId);
        currentSegment.end = word.end;
      }
    });

    if (currentSegment) {
      segments.push(currentSegment);
    }

    return segments;
  }, []);

  // Fetch transcription
  useEffect(() => {
    const fetchTranscription = async () => {
      if (!post.transcriptionUrl) {
        setError('No transcription available');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(post.transcriptionUrl);
        const data = response.data;
        setTranscription(data);
        
        // Extract speaker overrides and custom speakers from transcription data
        if (data.speakerOverrides) {
          setSpeakerOverrides(data.speakerOverrides);
        }
        if (data.customSpeakers) {
          setCustomSpeakers(data.customSpeakers);
        }
        
        // Also check if speakers are stored in the post content
        if (post.content) {
          try {
            const contentData = typeof post.content === 'string' ? JSON.parse(post.content) : post.content;
            if (contentData.speakerOverrides) {
              setSpeakerOverrides(prev => ({ ...prev, ...contentData.speakerOverrides }));
            }
            if (contentData.customSpeakers) {
              setCustomSpeakers(prev => [...prev, ...contentData.customSpeakers]);
            }
          } catch (e) {
            console.error('Error parsing post content:', e);
          }
        }
        
        if (data.words && data.words.length > 0) {
          const segments = processSpeakerSegments(data.words, speakerOverrides, customSpeakers);
          setSpeakerSegments(segments);
        } else if (data.utterances && data.utterances.length > 0) {
          // Handle utterances format
          const words = [];
          data.utterances.forEach(utterance => {
            if (utterance.words) {
              words.push(...utterance.words);
            }
          });
          if (words.length > 0) {
            const segments = processSpeakerSegments(words, speakerOverrides, customSpeakers);
            setSpeakerSegments(segments);
          }
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching transcription:', err);
        setError('Failed to load transcription');
      } finally {
        setLoading(false);
      }
    };

    fetchTranscription();
  }, [post.transcriptionUrl, post.content]);

  // Update segments when speaker overrides or custom speakers change
  useEffect(() => {
    if (transcription?.words && transcription.words.length > 0) {
      const segments = processSpeakerSegments(transcription.words, speakerOverrides, customSpeakers);
      setSpeakerSegments(segments);
    }
  }, [speakerOverrides, customSpeakers, transcription, processSpeakerSegments]);

  // Audio event handlers
  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const time = audioRef.current.currentTime;
      setCurrentTime(time);
      const currentTimeMs = time * 1000;
      
      // Find highlighted words (current word and all previous words)
      const highlighted = new Set();
      speakerSegments.forEach(segment => {
        segment.words.forEach(word => {
          // Highlight all words up to and including current word
          if (currentTimeMs >= word.start) {
            highlighted.add(word.wordId);
          }
        });
      });
      setHighlightedWordIds(highlighted);

      // Find active segment based on current time
      if (speakerSegments.length > 0) {
        const activeSegment = speakerSegments.find(
          segment => currentTimeMs >= segment.start && currentTimeMs <= segment.end
        );
        
        const newActiveId = activeSegment ? activeSegment.id : null;
        
        if (newActiveId !== activeSegmentId) {
          setActiveSegmentId(newActiveId);
          
          // Auto scroll to active segment
          if (autoScroll && newActiveId && segmentRefs.current[newActiveId]) {
            segmentRefs.current[newActiveId].scrollIntoView({
              behavior: 'smooth',
              block: 'nearest'
            });
          }
        }
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (value) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const handleMuteToggle = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume || 1;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const handleSkip = (seconds) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        Math.max(audioRef.current.currentTime + seconds, 0),
        duration
      );
    }
  };

  // Render individual word with Spotify-style highlighting (previous + current)
  const renderWord = (word, segmentId) => {
    const isHighlighted = highlightedWordIds.has(word.wordId);
    
    return (
      <span
        key={word.wordId}
        ref={(el) => (wordRefs.current[word.wordId] = el)}
        className={`transition-colors duration-75 cursor-pointer ${
          isHighlighted
            ? 'text-black dark:text-white font-semibold'
            : 'text-gray-500 dark:text-gray-400'
        }`}
        onClick={() => {
          if (audioRef.current && word.start !== undefined) {
            audioRef.current.currentTime = word.start / 1000;
          }
        }}
      >
        {word.text}
      </span>
    );
  };

  // Get unique speakers for info display
  const getUniqueSpeakers = () => {
    const speakers = new Map();
    speakerSegments.forEach(segment => {
      if (!speakers.has(segment.speaker)) {
        speakers.set(segment.speaker, {
          name: segment.speaker,
          originalName: segment.originalSpeaker,
          count: 0
        });
      }
      speakers.get(segment.speaker).count++;
    });
    return Array.from(speakers.values());
  };

  // Render loading skeleton
  if (loading) {
    return (
      <Card className="w-full max-w-5xl mx-auto">
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-20 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render error state
  if (error) {
    return (
      <Card className="w-full max-w-5xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const uniqueSpeakers = getUniqueSpeakers();

  return (
    <Card className="w-full max-w-8xl mx-auto shadow-lg">
      <CardContent className="p-8 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">{post.title}</h2>
          {post.description && (
            <p className="text-muted-foreground text-base">{post.description}</p>
          )}
        </div>

        {/* Audio Player Controls */}
        <div className="space-y-4">
          {/* Audio element */}
          <audio
            ref={audioRef}
            src={post.audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
          />

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              className="cursor-pointer"
            />
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleSkip(-10)}
                className="rounded-full"
              >
                <SkipBack className="h-5 w-5" />
                <span className="sr-only">Skip back 10 seconds</span>
              </Button>
              
              <Button
                variant="default"
                size="icon"
                onClick={handlePlayPause}
                className="rounded-full h-14 w-14"
              >
                {isPlaying ? (
                  <Pause className="h-7 w-7" />
                ) : (
                  <Play className="h-7 w-7 ml-0.5" />
                )}
                <span className="sr-only">{isPlaying ? 'Pause' : 'Play'}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleSkip(10)}
                className="rounded-full"
              >
                <SkipForward className="h-5 w-5" />
                <span className="sr-only">Skip forward 10 seconds</span>
              </Button>
            </div>

            <div className="flex items-center gap-4">
              {/* Volume control */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleMuteToggle}
                  className="rounded-full"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  className="w-24"
                />
              </div>

              {/* Speaker Info Toggle */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSpeakerInfo(!showSpeakerInfo)}
                      className="gap-1"
                    >
                      <Users className="h-4 w-4" />
                      <span className="text-sm hidden sm:inline">
                        {showSpeakerInfo ? 'Hide Speakers' : 'Show Speakers'}
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View speaker information</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Auto-scroll toggle */}
              <div className="flex items-center gap-2">
                <Switch
                  id="auto-scroll"
                  checked={autoScroll}
                  onCheckedChange={setAutoScroll}
                />
                <Label htmlFor="auto-scroll" className="text-sm cursor-pointer flex items-center gap-1">
                  <ScrollText className="h-3 w-3" />
                  <span className="hidden sm:inline">Auto-scroll</span>
                </Label>
              </div>

              {/* Expand/collapse transcription */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="gap-1"
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                <span className="text-sm hidden sm:inline">Transcript</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Speaker Information Panel */}
        {showSpeakerInfo && uniqueSpeakers.length > 0 && (
          <div className="rounded-lg border p-4 space-y-3 bg-muted/30">
            <h3 className="font-semibold flex items-center gap-2">
              <Users className="h-4 w-4" />
              Speakers in this Episode
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {uniqueSpeakers.map((speaker, idx) => {
                const colors = getSpeakerColorClass(speaker.originalName || speaker.name);
                return (
                  <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-background">
                    <div className={`w-3 h-3 rounded-full ${colors.baseBg}`} />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{speaker.name}</p>
                      {speaker.originalName && speaker.originalName !== speaker.name && (
                        <p className="text-xs text-muted-foreground">
                          Originally: Speaker {speaker.originalName}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Appears {speaker.count} time{speaker.count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Transcription Display - Spotify Style Highlighting */}
        {isExpanded && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-xl font-semibold">Transcription</h3>
              <Badge variant="outline" className="text-xs">
                {speakerSegments.length} segments • {uniqueSpeakers.length} speakers
              </Badge>
            </div>

            <ScrollArea 
              ref={scrollAreaRef}
              className="h-[500px] rounded-md border p-6"
            >
              <div className="space-y-6">
                {speakerSegments.map((segment) => {
                  const isActive = activeSegmentId === segment.id;
                  const colors = getSpeakerColorClass(segment.originalSpeaker || segment.speaker);
                  
                  return (
                    <div
                      key={segment.id}
                      ref={(el) => (segmentRefs.current[segment.id] = el)}
                      className={`space-y-3 p-4 rounded-xl transition-all duration-300 ${
                        isActive ? `ring-2 ring-primary/30 shadow-md ${colors.border}` : ''
                      }`}
                    >
                      {/* Speaker badge */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text}`}>
                            <User className="h-3.5 w-3.5" />
                            {segment.speaker}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {formatTime(segment.start / 1000)} - {formatTime(segment.end / 1000)}
                          </span>
                        </div>
                        {segment.originalSpeaker && segment.originalSpeaker !== segment.speaker && (
                          <Badge variant="secondary" className="text-xs">
                            Originally: Speaker {segment.originalSpeaker}
                          </Badge>
                        )}
                      </div>

                      {/* Text content - Fixed spacing issue */}
                      <div className="leading-relaxed text-lg">
                        <div className="flex flex-wrap gap-x-1">
                          {segment.words.map((word) => renderWord(word, segment.id))}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* No segments fallback */}
                {speakerSegments.length === 0 && transcription?.text && (
                  <div className="text-muted-foreground p-4 text-lg leading-relaxed">
                    <p>{transcription.text}</p>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Transcription info */}
            {transcription && (
              <div className="text-xs text-muted-foreground flex justify-between items-center flex-wrap gap-2">
                <span>Language: {transcription.language_code?.toUpperCase() || 'EN'}</span>
                {transcription.speakers_expected && (
                  <span>Expected speakers: {transcription.speakers_expected}</span>
                )}
                {transcription.language_confidence && (
                  <span>Confidence: {(transcription.language_confidence * 100).toFixed(1)}%</span>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AudioPost;