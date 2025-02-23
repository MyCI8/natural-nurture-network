
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const RightSidebar = () => {
  const navigate = useNavigate();

  const { data: trendingTopics } = useQuery({
    queryKey: ['trendingTopics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trending_topics')
        .select('*')
        .limit(5);
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: suggestedExperts } = useQuery({
    queryKey: ['suggestedExperts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'expert')
        .limit(3);
      
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="fixed right-0 h-screen w-[350px] border-l p-4 space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search"
          className="pl-9 rounded-full bg-accent"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Trending
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {trendingTopics?.map((topic: any) => (
            <div
              key={topic.id}
              className="cursor-pointer hover:bg-accent rounded-lg p-3"
              onClick={() => navigate(`/topic/${topic.id}`)}
            >
              <p className="font-semibold">{topic.title}</p>
              <p className="text-sm text-muted-foreground">{topic.posts_count} posts</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Who to follow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {suggestedExperts?.map((expert) => (
            <div
              key={expert.id}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <Avatar>
                  {expert.avatar_url ? (
                    <AvatarImage src={expert.avatar_url} alt={expert.full_name || ''} />
                  ) : (
                    <AvatarFallback>{expert.full_name?.[0] || '?'}</AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <p className="font-semibold">{expert.full_name}</p>
                  <p className="text-sm text-muted-foreground">@{expert.username}</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => navigate(`/experts/${expert.id}`)}
              >
                Follow
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default RightSidebar;
