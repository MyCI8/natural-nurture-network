
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Outlet, useLocation } from "react-router-dom";
import StatsGrid from "@/components/admin/dashboard/StatsGrid";
import RecentNews from "@/components/admin/dashboard/RecentNews";
import RecentActivity from "@/components/admin/dashboard/RecentActivity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminUsers from "@/components/admin/dashboard/AdminUsers";
import AdminVideos from "@/components/admin/dashboard/AdminVideos";
import type { CommentWithProfile } from "@/types";

const Admin = () => {
  const location = useLocation();
  const isRootAdminPath = location.pathname === '/admin';

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => {
      const [
        usersCount, 
        remediesCount, 
        pendingCommentsCount, 
        newsArticles, 
        ingredientsCount, 
        expertsCount, 
        symptomsCount,
        videosCount
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact" }),
        supabase.from("remedies").select("id", { count: "exact" }),
        supabase.from("comments").select("id", { count: "exact" }).eq("status", "pending"),
        supabase.from("news_articles").select("*").order("created_at", { ascending: false }).limit(5),
        supabase.from("ingredients").select("id", { count: "exact" }),
        supabase.from("experts").select("id", { count: "exact" }),
        supabase.from("symptom_details").select("id", { count: "exact" }),
        supabase.from("videos").select("id", { count: "exact" })
      ]);

      return {
        users: usersCount.count || 0,
        remedies: remediesCount.count || 0,
        pendingComments: pendingCommentsCount.count || 0,
        recentNews: newsArticles.data || [],
        ingredients: ingredientsCount.count || 0,
        experts: expertsCount.count || 0,
        symptoms: symptomsCount.count || 0,
        videos: videosCount.count || 0
      };
    },
  });

  const { data: experts, isLoading: isLoadingExperts } = useQuery({
    queryKey: ["dashboardExperts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  const { data: recentActivity, isLoading: isLoadingActivity } = useQuery({
    queryKey: ["recentActivity"],
    queryFn: async () => {
      const { data: comments, error } = await supabase
        .from("comments")
        .select("id, content, status, created_at, user_id")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      if (comments && comments.length > 0) {
        const userIds = comments.map(comment => comment.user_id).filter(Boolean);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", userIds);

        return comments.map(comment => ({
          ...comment,
          profile: profiles?.find(profile => profile.id === comment.user_id),
        })) as CommentWithProfile[];
      }

      return [];
    },
  });

  if (!isRootAdminPath) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>

        <StatsGrid stats={stats} isLoading={isLoadingStats} />

        <Tabs defaultValue="news" className="w-full mb-6">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="news">Recent News</TabsTrigger>
            <TabsTrigger value="users">Users Management</TabsTrigger>
            <TabsTrigger value="videos">News Videos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="news">
            <div className="grid gap-6 md:grid-cols-2">
              <RecentNews news={stats?.recentNews || []} isLoading={isLoadingStats} />
              <RecentActivity activity={recentActivity} isLoading={isLoadingActivity} />
            </div>
          </TabsContent>
          
          <TabsContent value="users">
            <AdminUsers />
          </TabsContent>
          
          <TabsContent value="videos">
            <AdminVideos />
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>Recent Experts</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingExperts ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[150px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {experts?.map((expert) => (
                  <div key={expert.id} className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <div className="bg-primary/10 w-full h-full flex items-center justify-center text-primary font-semibold">
                        {expert.full_name.charAt(0)}
                      </div>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{expert.full_name}</h4>
                      <p className="text-sm text-muted-foreground">{expert.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
