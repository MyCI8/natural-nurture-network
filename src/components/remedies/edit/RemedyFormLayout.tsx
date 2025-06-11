
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { FormActions } from '@/components/shared/form/FormActions';

interface RemedyFormLayoutProps {
  onBack: () => void;
  onSave: (shouldPublish?: boolean) => void;
  isSaving: boolean;
  children: React.ReactNode;
}

export const RemedyFormLayout = ({ 
  onBack, 
  onSave, 
  isSaving, 
  children 
}: RemedyFormLayoutProps) => {
  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto p-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 flex items-center touch-manipulation"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Remedies
        </Button>

        <div className="grid gap-6 md:grid-cols-[2fr,1.5fr,1fr]">
          {children}
          
          {/* Save Actions Column */}
          <div className="space-y-6">
            <FormActions
              onSave={onSave}
              isSaving={isSaving}
              showPublishOption={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
