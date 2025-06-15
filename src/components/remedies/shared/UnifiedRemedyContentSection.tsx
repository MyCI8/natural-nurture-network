
import React from 'react';
import { Label } from '@/components/ui/label';
import TextEditor from '@/components/ui/text-editor';

interface UnifiedRemedyContentSectionProps {
  formData: {
    description: string;
    precautions_side_effects?: string;
    preparation_method?: string;
    dosage_instructions?: string;
  };
  onChange: (field: string, value: string) => void;
}

export const UnifiedRemedyContentSection = ({ 
  formData, 
  onChange 
}: UnifiedRemedyContentSectionProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Content</h3>
      
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          Detailed Description
        </Label>
        <TextEditor
          content={formData.description}
          onChange={(content) => onChange('description', content)}
          maxHeight="200px"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="preparation" className="text-sm font-medium">
          Preparation Method
        </Label>
        <TextEditor
          content={formData.preparation_method || ''}
          onChange={(content) => onChange('preparation_method', content)}
          maxHeight="150px"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dosage" className="text-sm font-medium">
          Dosage Instructions
        </Label>
        <TextEditor
          content={formData.dosage_instructions || ''}
          onChange={(content) => onChange('dosage_instructions', content)}
          maxHeight="120px"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="precautions" className="text-sm font-medium">
          Precautions & Side Effects
        </Label>
        <TextEditor
          content={formData.precautions_side_effects || ''}
          onChange={(content) => onChange('precautions_side_effects', content)}
          maxHeight="150px"
        />
      </div>
    </div>
  );
};
