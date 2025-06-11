
import React from 'react';
import { UnifiedRemedyDetailsSection } from '@/components/remedies/shared/UnifiedRemedyDetailsSection';
import { UnifiedRemedyContentSection } from '@/components/remedies/shared/UnifiedRemedyContentSection';
import { RemedyIngredientsSection } from '@/components/admin/remedies/form/RemedyIngredientsSection';
import { RemedyExpertsSection } from '@/components/admin/remedies/RemedyExpertsSection';
import { RemedyHealthConcernsSection } from '@/components/admin/remedies/form/RemedyHealthConcernsSection';
import { MultipleImageUpload } from '@/components/remedies/shared/MultipleImageUpload';
import { SmartLinkInput } from '@/components/remedies/shared/SmartLinkInput';
import { FormActions } from '@/components/shared/form/FormActions';

interface ImageData {
  file?: File;
  url: string;
  description?: string;
}

interface LinkData {
  url: string;
  title?: string;
  description?: string;
  type: 'link' | 'video';
}

interface CreateRemedyFormColumnsProps {
  formData: {
    name: string;
    summary: string;
    description: string;
    preparation_method: string;
    dosage_instructions: string;
    precautions_side_effects: string;
    ingredients: string[];
    health_concerns: string[];
    experts: string[];
  };
  images: ImageData[];
  links: LinkData[];
  onInputChange: (field: string, value: any) => void;
  onImagesChange: (images: ImageData[]) => void;
  onLinksChange: (links: LinkData[]) => void;
  onSubmit: () => void;
  isSaving: boolean;
  onCancel: () => void;
}

export const CreateRemedyFormColumns = ({
  formData,
  images,
  links,
  onInputChange,
  onImagesChange,
  onLinksChange,
  onSubmit,
  isSaving,
  onCancel
}: CreateRemedyFormColumnsProps) => {
  const videoLinks = links.filter(link => link.type === 'video');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2fr,1.5fr,1fr] gap-4 lg:gap-6">
      {/* Left Column - Main Content */}
      <div className="space-y-6">
        <UnifiedRemedyDetailsSection
          formData={formData}
          onChange={onInputChange}
        />

        <UnifiedRemedyContentSection
          formData={formData}
          onChange={onInputChange}
        />

        <RemedyIngredientsSection
          ingredients={formData.ingredients}
          onIngredientsChange={(ingredients) => onInputChange('ingredients', ingredients)}
        />
      </div>

      {/* Middle Column - Images, Experts, Links */}
      <div className="space-y-6">
        <MultipleImageUpload
          images={images}
          onImagesChange={onImagesChange}
        />

        <RemedyExpertsSection
          selectedExperts={formData.experts}
          setSelectedExperts={(experts) => onInputChange('experts', experts)}
        />

        <SmartLinkInput
          links={links}
          onLinksChange={onLinksChange}
        />
      </div>

      {/* Right Column - Health Concerns and Actions */}
      <div className="space-y-6">
        <RemedyHealthConcernsSection
          selectedConcerns={formData.health_concerns}
          onConcernsChange={(concerns) => onInputChange('health_concerns', concerns)}
        />

        {/* Videos Section */}
        {videoLinks.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Videos</h3>
            <div className="space-y-2">
              {videoLinks.map((video, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <p className="text-sm font-medium truncate">
                    {video.title || new URL(video.url).hostname}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {video.url}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons - Desktop */}
        <div className="hidden lg:block">
          <FormActions
            onSave={onSubmit}
            isSaving={isSaving}
            saveLabel="Create Remedy"
          />
          <button 
            type="button"
            onClick={onCancel}
            className="w-full mt-2 px-4 py-2 text-sm border rounded-md hover:bg-accent touch-manipulation"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
