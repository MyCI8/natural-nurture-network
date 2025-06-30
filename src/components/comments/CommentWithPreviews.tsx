
import React from 'react';
import { AutoUrlPreview } from '@/components/ui/AutoUrlPreview';

interface CommentWithPreviewsProps {
  content: string;
  userName: string;
  createdAt: string;
  className?: string;
}

export const CommentWithPreviews: React.FC<CommentWithPreviewsProps> = ({ 
  content, 
  userName, 
  createdAt, 
  className = "" 
}) => {
  return (
    <div className={`bg-secondary/50 rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="font-medium text-sm">{userName}</span>
        <span className="text-xs text-muted-foreground">{createdAt}</span>
      </div>
      
      <p className="text-sm mb-3 whitespace-pre-wrap">{content}</p>
      
      <AutoUrlPreview text={content} maxPreviews={2} />
    </div>
  );
};
