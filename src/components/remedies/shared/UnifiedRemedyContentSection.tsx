
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface UnifiedRemedyContentSectionProps {
  formData: {
    description: string;
    precautions_side_effects?: string;
  };
  onChange: (field: string, value: string) => void;
}

export const UnifiedRemedyContentSection = ({ 
  formData, 
  onChange 
}: UnifiedRemedyContentSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Content</h3>
      
      <div>
        <Label htmlFor="description" className="text-sm font-medium">
          Detailed Description
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder="Explain the benefits and how this remedy works..."
          className="mt-1 min-h-[120px] touch-manipulation bg-background"
          rows={6}
        />
      </div>

      <div>
        <Label htmlFor="precautions" className="text-sm font-medium">
          Precautions & Side Effects
        </Label>
        <Textarea
          id="precautions"
          value={formData.precautions_side_effects || ''}
          onChange={(e) => onChange('precautions_side_effects', e.target.value)}
          placeholder="Important safety information, contraindications, and potential side effects..."
          className="mt-1 min-h-[100px] touch-manipulation bg-background"
          rows={5}
        />
      </div>
    </div>
  );
};
