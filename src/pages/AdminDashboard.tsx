
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Leaf,
  Newspaper,
  UserCog,
  Apple,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import StatsGrid from "@/components/admin/dashboard/StatsGrid";
import RecentEntries from "@/components/admin/dashboard/RecentEntries";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => {
      const [
        usersCount,
        remediesCount,
        expertsCount,
        commentsCount,
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact" }),
        supabase.from("remedies").select("*", { count: "exact" }),
        supabase.from("experts").select("*", { count: "exact" }),
        supabase.from("comments").select("*", { count: "exact" }),
      ]);

      return {
        users: usersCount.count || 0,
        remedies: remediesCount.count || 0,
        experts: expertsCount.count || 0,
        comments: commentsCount.count || 0,
      };
    },
  });

  const quickLinks = [
    {
      title: "Manage Users",
      description: "Manage user roles and permissions",
      icon: Users,
      path: "/admin/users",
    },
    {
      title: "Manage Experts",
      description: "Add, edit, or remove expert profiles",
      icon: UserCog,
      path: "/admin/manage-experts",
    },
    {
      title: "Manage Remedies",
      description: "Create and update natural remedies",
      icon: Leaf,
      path: "/admin/remedies",
    },
    {
      title: "Manage News",
      description: "Publish and edit news articles",
      icon: Newspaper,
      path: "/admin/news",
    },
    {
      title: "Manage Ingredients",
      description: "Add and update remedy ingredients",
      icon: Apple,
      path: "/admin/ingredients",
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <StatsGrid stats={stats} isLoading={isLoading} />

        {/* Quick Links */}
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {quickLinks.map((link) => (
            <Card
              key={link.title}
              className="hover:bg-accent transition-colors cursor-pointer"
              onClick={() => navigate(link.path)}
            >
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center space-x-4">
                  <link.icon className="h-6 w-6" />
                  <div>
                    <CardTitle className="text-lg">{link.title}</CardTitle>
                    <CardDescription>{link.description}</CardDescription>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Recent Entries Section */}
        <RecentEntries />
      </div>
    </div>
  );
};

export default AdminDashboard;
