import React from 'react';
import { SafeHtml } from '@/utils/sanitizer';
import ErrorBoundary from '@/components/ErrorBoundary';

interface IngredientDescriptionProps {
  fullDescription: string | null;
  imageUrl: string | null;
  name: string;
}

export const IngredientDescription = ({ 
  fullDescription, 
  imageUrl, 
  name 
}: IngredientDescriptionProps) => {
  return (
    <div className="space-y-6">
      {imageUrl && (
        <div className="w-full">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-64 object-cover rounded-lg"
          />
        </div>
      )}

      {fullDescription && (
        <ErrorBoundary level="component">
          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <SafeHtml html={fullDescription} />
          </div>
        </ErrorBoundary>
      )}
    </div>
  );
};

export default IngredientDescription;