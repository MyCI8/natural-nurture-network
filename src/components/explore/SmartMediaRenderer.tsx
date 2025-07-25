
import React from 'react';
import { isImagePost } from '@/components/video/utils/videoPlayerUtils';

interface SmartMediaRendererProps {
  src: string;
  className?: string;
  [key: string]: any;
}

export const SmartMediaRenderer = ({ src, className = '', ...props }: SmartMediaRendererProps) => {
  const isImage = isImagePost(src);

  return isImage ? (
    <img
      src={src}
      className={`w-full h-full object-contain ${className}`}
      alt="Post image"
      {...props}
    />
  ) : (
    <video
      src={src}
      className={`w-full h-full object-contain ${className}`}
      {...props}
    />
  );
};

export default SmartMediaRenderer;
