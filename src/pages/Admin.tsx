import { useQuery } from "@tanstack/react-query";
import { Users, BookOpen, MessageSquare, Newspaper, Apple } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type CommentWithProfile = Tables<"comments"> & {
  profile?: Pick<Tables<"profiles">, "id" | "full_name">;
};

const Admin = () => {
  const navigate = useNavigate();
  
  // Fetch dashboard statistics
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => {
      const [usersCount, remediesCount, pendingCommentsCount, newsArticles, ingredientsCount] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact" }),
        supabase.from("remedies").select("id", { count: "exact" }),
        supabase.from("comments").select("id", { count: "exact" }).eq("status", "pending"),
        supabase.from("news_articles").select("*").order("created_at", { ascending: false }).limit(5),
        supabase.from("ingredients").select("id", { count: "exact" }),
      ]);

      return {
        users: usersCount.count || 0,
        remedies: remediesCount.count || 0,
        pendingComments: pendingCommentsCount.count || 0,
        recentNews: newsArticles.data || [],
        ingredients: ingredientsCount.count || 0,
      };
    },
  });

  // Fetch recent activity
  const { data: recentActivity, isLoading: isLoadingActivity } = useQuery({
    queryKey: ["recentActivity"],
    queryFn: async () => {
      // First get comments with user_ids
      const { data: comments, error } = await supabase
        .from("comments")
        .select("id, content, status, created_at, user_id")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      // Then fetch the corresponding profiles
      if (comments && comments.length > 0) {
        const userIds = comments.map(comment => comment.user_id).filter(Boolean);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", userIds);

        // Merge the profile data with comments
        return comments.map(comment => ({
          ...comment,
          profile: profiles?.find(profile => profile.id === comment.user_id),
        })) as CommentWithProfile[];
      }

      return (comments || []) as CommentWithProfile[];
    },
  });

  const statCards = [
    {
      title: "Total Users",
      value: stats?.users || 0,
      icon: Users,
      description: "Registered users",
      onClick: undefined,
    },
    {
      title: "Published Remedies",
      value: stats?.remedies || 0,
      icon: BookOpen,
      description: "Active remedies",
      onClick: () => navigate("/admin/remedies"),
    },
    {
      title: "Ingredients",
      value: stats?.ingredients || 0,
      icon: Apple,
      description: "Available ingredients",
      onClick: () => navigate("/admin/ingredients"),
    },
    {
      title: "Pending Comments",
      value: stats?.pendingComments || 0,
      icon: MessageSquare,
      description: "Awaiting moderation",
      onClick: undefined,
    },
    {
      title: "Recent News",
      value: stats?.recentNews?.length || 0,
      icon: Newspaper,
      description: "Articles published",
      onClick: undefined,
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5 mb-8">
          {statCards.map((stat) => (
            <Card 
              key={stat.title}
              className={stat.onClick ? "cursor-pointer hover:bg-accent transition-colors" : ""}
              onClick={stat.onClick}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoadingStats ? (
                  <Skeleton className="h-7 w-[100px]" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent News */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Recent News Articles</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {stats?.recentNews.map((article) => (
                    <div key={article.id} className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">{article.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(article.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingActivity ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentActivity?.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>{activity.profile?.full_name || "Anonymous"}</TableCell>
                        <TableCell>Added a comment</TableCell>
                        <TableCell>
                          {new Date(activity.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;