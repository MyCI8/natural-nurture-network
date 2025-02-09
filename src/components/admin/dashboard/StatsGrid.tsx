
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Leaf, UserCog, MessageSquare } from "lucide-react";

interface StatsGridProps {
  stats: {
    users: number;
    remedies: number;
    experts: number;
    comments: number;
  } | undefined;
  isLoading: boolean;
}

const StatsGrid = ({ stats, isLoading }: StatsGridProps) => {
  const statsCards = [
    { title: "Total Users", value: stats?.users || 0, icon: Users },
    { title: "Total Remedies", value: stats?.remedies || 0, icon: Leaf },
    { title: "Total Experts", value: stats?.experts || 0, icon: UserCog },
    { title: "Total Comments", value: stats?.comments || 0, icon: MessageSquare },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stat.value}</div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsGrid;
