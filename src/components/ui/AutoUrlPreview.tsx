
import React from 'react';
import { SimpleUrlPreview } from './SimpleUrlPreview';
import { detectUrls } from '@/utils/urlDetection';

interface AutoUrlPreviewProps {
  text: string;
  className?: string;
  maxPreviews?: number;
}

export const AutoUrlPreview: React.FC<AutoUrlPreviewProps> = ({ 
  text, 
  className = "",
  maxPreviews = 3
}) => {
  const urls = detectUrls(text).slice(0, maxPreviews);

  if (urls.length === 0) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      {urls.map((url, index) => (
        <SimpleUrlPreview 
          key={index} 
          url={url} 
          showUrl={false}
        />
      ))}
    </div>
  );
};
