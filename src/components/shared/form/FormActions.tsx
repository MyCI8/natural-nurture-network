
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, Loader2 } from 'lucide-react';
import { FormActionsProps } from '@/types/form';

export const FormActions = ({ 
  onSave, 
  isSaving, 
  showPublishOption = false,
  saveLabel = 'Save',
  publishLabel = 'Publish'
}: FormActionsProps) => {
  return (
    <div className="space-y-2">
      {showPublishOption && (
        <Button 
          variant="outline" 
          onClick={() => onSave(false)}
          className="w-full touch-manipulation"
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save as Draft
        </Button>
      )}
      <Button 
        onClick={() => onSave(true)}
        className="w-full touch-manipulation"
        disabled={isSaving}
      >
        {isSaving ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Save className="h-4 w-4 mr-2" />
        )}
        {showPublishOption ? publishLabel : saveLabel}
      </Button>
    </div>
  );
};
