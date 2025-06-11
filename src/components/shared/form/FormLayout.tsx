
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { FormLayoutProps } from '@/types/form';

export const FormLayout = ({ 
  title, 
  onBack, 
  onSave, 
  isSaving = false, 
  showPublishOption = false,
  children 
}: FormLayoutProps) => {
  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center touch-manipulation"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <h1 className="text-2xl font-bold">{title}</h1>
          
          {onSave && (
            <div className="flex gap-2">
              {showPublishOption && (
                <Button 
                  variant="outline" 
                  onClick={() => onSave(false)}
                  disabled={isSaving}
                  className="touch-manipulation"
                >
                  Save Draft
                </Button>
              )}
              <Button 
                onClick={() => onSave(true)}
                disabled={isSaving}
                className="touch-manipulation"
              >
                {showPublishOption ? 'Publish' : 'Save'}
              </Button>
            </div>
          )}
        </div>

        {children}
      </div>
    </div>
  );
};
