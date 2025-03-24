
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Newspaper, Video, Clock, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const RecentActivity = () => {
  const navigate = useNavigate();
  
  const { data: recentActivity = [], isLoading } = useQuery({
    queryKey: ["recent-news-activity"],
    queryFn: async () => {
      // Get recent articles
      const { data: articles, error: articlesError } = await supabase
        .from("news_articles")
        .select("id, title, created_at, status")
        .order("created_at", { ascending: false })
        .limit(3);
      
      // Get recent videos
      const { data: videos, error: videosError } = await supabase
        .from("videos")
        .select("id, title, created_at, status")
        .eq("video_type", "news")
        .order("created_at", { ascending: false })
        .limit(3);
      
      if (articlesError || videosError) {
        console.error("Error fetching recent activity", articlesError || videosError);
      }
      
      // Combine and sort by created_at
      const combinedActivity = [
        ...(articles || []).map(item => ({ ...item, type: 'article' })),
        ...(videos || []).map(item => ({ ...item, type: 'video' }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
      
      return combinedActivity;
    },
  });
  
  const handleActivityClick = (item: any) => {
    if (item.type === 'article') {
      navigate(`/admin/news/${item.id}`);
    } else {
      navigate(`/admin/videos/${item.id}`);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Latest content updates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">Loading activity...</div>
        ) : recentActivity.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">No recent activity</div>
        ) : (
          <>
            {recentActivity.map((item: any) => (
              <div 
                key={`${item.type}-${item.id}`} 
                className="flex items-center justify-between group cursor-pointer"
                onClick={() => handleActivityClick(item)}
              >
                <div className="flex items-center">
                  {item.type === 'article' ? (
                    <Newspaper className="h-8 w-8 p-1.5 rounded-full bg-muted text-primary mr-3" />
                  ) : (
                    <Video className="h-8 w-8 p-1.5 rounded-full bg-muted text-primary mr-3" />
                  )}
                  <div>
                    <p className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
                      {item.title}
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                      <span className="mx-1">•</span>
                      <span className={`capitalize ${
                        item.status === 'published' ? 'text-green-600' : 
                        item.status === 'draft' ? 'text-amber-600' : 
                        'text-muted-foreground'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
            
            <Button 
              variant="ghost" 
              className="w-full text-xs justify-center mt-2"
              onClick={() => navigate("/admin/news/activity")}
            >
              View all activity
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
