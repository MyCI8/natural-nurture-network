
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface UnifiedRemedyDetailsSectionProps {
  formData: {
    name: string;
    summary: string;
    video_url?: string;
  };
  onChange: (field: string, value: string) => void;
  showVideoUrl?: boolean;
}

export const UnifiedRemedyDetailsSection = ({ 
  formData, 
  onChange, 
  showVideoUrl = false 
}: UnifiedRemedyDetailsSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Remedy Details</h3>
      
      <div>
        <Label htmlFor="name" className="text-sm font-medium">
          Remedy Name *
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="e.g., Honey and Ginger Tea for Sore Throat"
          className="mt-1 touch-manipulation bg-background"
          required
        />
      </div>

      <div>
        <Label htmlFor="summary" className="text-sm font-medium">
          Short Description *
        </Label>
        <Textarea
          id="summary"
          value={formData.summary}
          onChange={(e) => onChange('summary', e.target.value)}
          placeholder="Brief description of what this remedy helps with..."
          className="mt-1 min-h-[80px] touch-manipulation bg-background"
          required
        />
      </div>

      {showVideoUrl && (
        <div>
          <Label htmlFor="video_url" className="text-sm font-medium">
            Video URL
          </Label>
          <Input
            id="video_url"
            value={formData.video_url || ''}
            onChange={(e) => onChange('video_url', e.target.value)}
            placeholder="YouTube or MP4 link"
            className="mt-1 touch-manipulation bg-background"
          />
        </div>
      )}
    </div>
  );
};
