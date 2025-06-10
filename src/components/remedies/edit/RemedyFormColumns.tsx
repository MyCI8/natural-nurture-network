
import React from 'react';
import { UnifiedRemedyDetailsSection } from '@/components/remedies/shared/UnifiedRemedyDetailsSection';
import { UnifiedRemedyContentSection } from '@/components/remedies/shared/UnifiedRemedyContentSection';
import { RemedyIngredientsSection } from '@/components/admin/remedies/form/RemedyIngredientsSection';
import { RemedyExpertsSection } from '@/components/admin/remedies/RemedyExpertsSection';
import { RemedyHealthConcernsSection } from '@/components/admin/remedies/form/RemedyHealthConcernsSection';
import { RemedyStatusSection } from '@/components/admin/remedies/form/RemedyStatusSection';
import { MultipleImageUpload } from '@/components/remedies/shared/MultipleImageUpload';
import { SmartLinkInput } from '@/components/remedies/shared/SmartLinkInput';

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

interface RemedyFormColumnsProps {
  formData: {
    name: string;
    summary: string;
    description: string;
    preparation_method: string;
    dosage_instructions: string;
    precautions_side_effects: string;
    ingredients: string[];
    health_concerns: string[];
    status: "draft" | "published";
  };
  images: ImageData[];
  links: LinkData[];
  selectedExperts: string[];
  onInputChange: (field: string, value: any) => void;
  onImagesChange: (images: ImageData[]) => void;
  onLinksChange: (links: LinkData[]) => void;
  onExpertsChange: (experts: string[]) => void;
}

export const RemedyFormColumns = ({
  formData,
  images,
  links,
  selectedExperts,
  onInputChange,
  onImagesChange,
  onLinksChange,
  onExpertsChange
}: RemedyFormColumnsProps) => {
  return (
    <>
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
          selectedExperts={selectedExperts}
          setSelectedExperts={onExpertsChange}
        />

        <SmartLinkInput
          links={links}
          onLinksChange={onLinksChange}
        />
      </div>

      {/* Right Column - Admin Fields */}
      <div className="space-y-6">
        <RemedyHealthConcernsSection
          selectedConcerns={formData.health_concerns}
          onConcernsChange={(concerns) => onInputChange('health_concerns', concerns)}
        />

        <RemedyStatusSection
          status={formData.status}
          onStatusChange={(status) => onInputChange('status', status)}
        />
      </div>
    </>
  );
};
