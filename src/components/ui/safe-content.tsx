
import React from 'react';
import { sanitizeHtml } from '@/utils/sanitizer';

interface SafeContentProps {
  content: string;
  className?: string;
  allowHtml?: boolean;
}

/**
 * Safe content component that prevents XSS attacks
 * by sanitizing HTML content before rendering
 */
export const SafeContent: React.FC<SafeContentProps> = ({ 
  content, 
  className,
  allowHtml = true 
}) => {
  if (!allowHtml) {
    // For plain text, just render as text
    return <div className={className}>{content}</div>;
  }

  // For HTML content, sanitize before rendering
  const sanitizedContent = sanitizeHtml(content);
  
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};

export default SafeContent;
