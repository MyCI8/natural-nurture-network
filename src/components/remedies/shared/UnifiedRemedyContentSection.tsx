
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface UnifiedRemedyContentSectionProps {
  formData: {
    description: string;
    preparation_method?: string;
    dosage_instructions?: string;
  };
  onChange: (field: string, value: string) => void;
  showPreparationFields?: boolean;
}

export const UnifiedRemedyContentSection = ({ 
  formData, 
  onChange, 
  showPreparationFields = true 
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

      {showPreparationFields && (
        <>
          <div>
            <Label htmlFor="preparation" className="text-sm font-medium">
              Preparation Method
            </Label>
            <Textarea
              id="preparation"
              value={formData.preparation_method || ''}
              onChange={(e) => onChange('preparation_method', e.target.value)}
              placeholder="Step-by-step instructions on how to prepare this remedy..."
              className="mt-1 min-h-[100px] touch-manipulation bg-background"
              rows={5}
            />
          </div>

          <div>
            <Label htmlFor="dosage" className="text-sm font-medium">
              Dosage Instructions
            </Label>
            <Textarea
              id="dosage"
              value={formData.dosage_instructions || ''}
              onChange={(e) => onChange('dosage_instructions', e.target.value)}
              placeholder="How much and how often to use this remedy..."
              className="mt-1 min-h-[80px] touch-manipulation bg-background"
              rows={4}
            />
          </div>
        </>
      )}
    </div>
  );
};
