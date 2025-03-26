
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CommentWithProfile } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const RightSidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*, profile:profiles(id, full_name)')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as CommentWithProfile[];
    }
  });

  return (
    <div className="fixed right-0 h-screen w-[350px] border-l p-4">
      <h2 className="text-xl font-semibold mb-4">Recent Comments</h2>
      
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <p>Loading comments...</p>
          </div>
        ) : comments?.length ? (
          comments.map((comment) => (
            <div key={comment.id} className="border rounded-lg p-3 shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <Avatar className="h-8 w-8">
                  {comment.profile?.full_name ? (
                    <AvatarFallback>{comment.profile.full_name[0]}</AvatarFallback>
                  ) : (
                    <AvatarFallback>?</AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{comment.profile?.full_name || 'Anonymous'}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <p className="text-sm">{comment.content}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-muted-foreground">No comments yet</p>
        )}
      </div>
    </div>
  );
};

export default RightSidebar;
