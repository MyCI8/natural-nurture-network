
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Comments from '@/components/video/Comments';

interface CommentSectionProps {
  showComments: boolean;
  setShowComments: (show: boolean) => void;
  videoId: string;
  currentUser: any;
  commentsRef: React.RefObject<HTMLDivElement>;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  showComments,
  setShowComments,
  videoId,
  currentUser,
  commentsRef
}) => {
  return (
    <div 
      ref={commentsRef} 
      className={`w-full bg-background dark:bg-dm-background px-4 ${showComments ? 'absolute inset-0 z-30' : 'hidden'} pt-4`}
    >
      <div className="max-w-3xl mx-auto relative">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setShowComments(false)} 
          className="absolute top-0 right-0 z-10 touch-manipulation"
        >
          <X className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold mb-4 dark:text-dm-text">Comments</h2>
        <Comments videoId={videoId} currentUser={currentUser} />
      </div>
    </div>
  );
};

export default CommentSection;
