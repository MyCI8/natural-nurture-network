
import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { X, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface VideoFlagFormProps {
  videoId: string;
  isOpen: boolean;
  onClose: () => void;
}

// Predefined flag reasons
const flagReasons = [
  { id: 'inappropriate', label: 'Inappropriate content' },
  { id: 'harmful', label: 'Harmful or dangerous content' },
  { id: 'misinformation', label: 'Misinformation or false claims' },
  { id: 'spam', label: 'Spam or misleading content' },
  { id: 'copyright', label: 'Copyright violation' },
  { id: 'other', label: 'Other' }
];

const VideoFlagForm = ({ videoId, isOpen, onClose }: VideoFlagFormProps) => {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [otherReason, setOtherReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const handleReasonToggle = (reasonId: string) => {
    setSelectedReasons(prev => 
      prev.includes(reasonId)
        ? prev.filter(id => id !== reasonId)
        : [...prev, reasonId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedReasons.length === 0) {
      toast.error('Please select at least one reason for flagging this video');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in to flag content');
        return;
      }

      // In a real implementation, you would add the flag to a video_flags table
      // For now, let's just simulate success
      console.log('Flagging video', videoId, 'for reasons:', selectedReasons);
      console.log('Additional context:', otherReason);
      
      // Simulate successful flag submission
      setTimeout(() => {
        toast.success('Video has been flagged for review');
        onClose();
        // This would refresh the video data to show it's been flagged by the user
        queryClient.invalidateQueries({ queryKey: ['explore-videos'] });
      }, 1000);
    } catch (error) {
      console.error('Error flagging video:', error);
      toast.error('Failed to flag video. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-destructive" />
            Report Video
          </DialogTitle>
          <DialogDescription>
            Let us know why you think this video should be reviewed by our moderation team.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Why are you reporting this content?</Label>
              <div className="space-y-2 mt-1">
                {flagReasons.map(reason => (
                  <div key={reason.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`reason-${reason.id}`} 
                      checked={selectedReasons.includes(reason.id)}
                      onCheckedChange={() => handleReasonToggle(reason.id)}
                    />
                    <Label 
                      htmlFor={`reason-${reason.id}`}
                      className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {reason.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            {selectedReasons.includes('other') && (
              <div className="space-y-2">
                <Label htmlFor="other-reason">Please specify</Label>
                <Textarea
                  id="other-reason"
                  placeholder="Tell us more about the issue..."
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  className="resize-none"
                  rows={3}
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VideoFlagForm;
