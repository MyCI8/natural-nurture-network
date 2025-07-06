
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function usePostManagement() {
  const queryClient = useQueryClient();

  const archivePost = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from('videos')
        .update({ status: 'archived' })
        .eq('id', postId);
      
      if (error) {throw error;}
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userVideos'] });
      toast.success('Post archived successfully');
    },
    onError: (error) => {
      toast.error(`Failed to archive post: ${error.message}`);
    }
  });

  const deletePost = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', postId);
      
      if (error) {throw error;}
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userVideos'] });
      toast.success('Post deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete post: ${error.message}`);
    }
  });

  return {
    archivePost: archivePost.mutate,
    deletePost: deletePost.mutate,
    isArchiving: archivePost.isPending,
    isDeleting: deletePost.isPending
  };
}
