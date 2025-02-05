import { Users, BookOpen, MessageSquare, Newspaper, Apple, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type DashboardStats = {
  users: number;
  remedies: number;
  ingredients: number;
  pendingComments: number;
  recentNews: any[];
  experts: number;
};

interface StatsGridProps {
  stats: DashboardStats | undefined;
  isLoading: boolean;
}

const StatsGrid = ({ stats, isLoading }: StatsGridProps) => {
  const navigate = useNavigate();

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
    {
      title: "Experts",
      value: stats?.experts || 0,
      icon: GraduationCap,
      description: "Medical experts",
      onClick: () => navigate("/admin/manage-experts"),
    },
  ];

  return (
    <>
      <h2 className="text-2xl font-bold mb-6">Stats Cards</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
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
              {isLoading ? (
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
    </>
  );
};

export default StatsGrid;