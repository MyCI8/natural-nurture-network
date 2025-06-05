
import React, { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCw, Volume2, VolumeX, Scissors } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface VideoEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoSrc: string;
  onSave: (editedVideoUrl: string) => void;
}

export const VideoEditModal = ({ isOpen, onClose, videoSrc, onSave }: VideoEditModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const videoDuration = videoRef.current.duration;
      setDuration(videoDuration);
      setEndTime(videoDuration);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const vol = newVolume[0];
    setVolume(vol);
    if (videoRef.current) {
      videoRef.current.volume = vol;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const setCurrentTimeAsStart = () => {
    setStartTime(currentTime);
  };

  const setCurrentTimeAsEnd = () => {
    setEndTime(currentTime);
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSave = async () => {
    setIsProcessing(true);
    
    try {
      // In a real implementation, you would:
      // 1. Use FFmpeg.js or similar to actually trim the video
      // 2. Apply volume/mute settings
      // 3. Process the video on the client or send to a server
      
      // For now, we'll simulate processing and return the original URL
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In practice, this would be the URL of the processed video
      onSave(videoSrc);
    } catch (error) {
      console.error('Error processing video:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Video</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Video Player */}
          <div className="relative">
            <video
              ref={videoRef}
              src={videoSrc}
              className="w-full max-h-80 bg-black rounded-lg"
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            
            {/* Video Controls Overlay */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/70 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlayPause}
                  className="text-white hover:bg-white/20 touch-manipulation"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                
                <span className="text-white text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
                
                <div className="flex-1">
                  <Progress 
                    value={(currentTime / duration) * 100} 
                    className="h-2 cursor-pointer"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const newTime = (clickX / rect.width) * duration;
                      handleSeek(newTime);
                    }}
                  />
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20 touch-manipulation"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Editing Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Trim Controls */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Trim Video</Label>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="w-20">Start:</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={setCurrentTimeAsStart}
                    className="touch-manipulation"
                  >
                    <Scissors className="h-4 w-4 mr-1" />
                    Set
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {formatTime(startTime)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Label className="w-20">End:</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={setCurrentTimeAsEnd}
                    className="touch-manipulation"
                  >
                    <Scissors className="h-4 w-4 mr-1" />
                    Set
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {formatTime(endTime)}
                  </span>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Duration: {formatTime(endTime - startTime)}
                </div>
              </div>
            </div>

            {/* Audio Controls */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Audio Settings</Label>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Volume: {Math.round(volume * 100)}%</Label>
                  <Slider
                    value={[volume]}
                    onValueChange={handleVolumeChange}
                    max={1}
                    min={0}
                    step={0.1}
                    className="touch-manipulation"
                  />
                </div>
                
                <Button
                  variant="outline"
                  onClick={toggleMute}
                  className="w-full touch-manipulation"
                >
                  {isMuted ? <VolumeX className="h-4 w-4 mr-1" /> : <Volume2 className="h-4 w-4 mr-1" />}
                  {isMuted ? 'Unmute' : 'Mute'} Video
                </Button>
              </div>
            </div>
          </div>

          {/* Timeline Scrubber */}
          <div className="space-y-2">
            <Label>Seek to position</Label>
            <Slider
              value={[currentTime]}
              onValueChange={(value) => handleSeek(value[0])}
              max={duration}
              min={0}
              step={0.1}
              className="touch-manipulation"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isProcessing}
            className="touch-manipulation"
          >
            {isProcessing ? (
              <>
                <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
