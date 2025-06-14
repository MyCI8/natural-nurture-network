
import React, { useState } from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Archive, Trash2 } from 'lucide-react';
import { usePostManagement } from '@/hooks/usePostManagement';

interface PostContextMenuProps {
  postId: string;
  postTitle: string;
  children: React.ReactNode;
  isOwner: boolean;
}

export function PostContextMenu({ postId, postTitle, children, isOwner }: PostContextMenuProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { archivePost, deletePost, isArchiving, isDeleting } = usePostManagement();

  if (!isOwner) {
    return <>{children}</>;
  }

  const handleArchive = () => {
    archivePost(postId);
  };

  const handleDelete = () => {
    deletePost(postId);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger className="touch-manipulation">
          {children}
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          <ContextMenuItem
            onClick={handleArchive}
            disabled={isArchiving}
            className="cursor-pointer touch-manipulation"
          >
            <Archive className="w-4 h-4 mr-2" />
            {isArchiving ? 'Archiving...' : 'Archive Post'}
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => setShowDeleteDialog(true)}
            disabled={isDeleting}
            className="cursor-pointer text-destructive focus:text-destructive touch-manipulation"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Post
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{postTitle}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
