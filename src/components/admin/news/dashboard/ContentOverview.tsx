import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartBar } from '@/components/ui/chart';

interface ContentOverviewProps {
  className?: string;
}

const ContentOverview = ({ className }: ContentOverviewProps) => {
  const [period, setPeriod] = React.useState<"7days" | "30days" | "90days">("30days");
  
  const { data, isLoading } = useQuery({
    queryKey: ["content-overview", period],
    queryFn: async () => {
      // In a real application, you'd fetch actual data from your backend
      // For now, we'll generate mock data
      
      let days;
      switch (period) {
        case "7days":
          days = 7;
          break;
        case "90days":
          days = 90;
          break;
        default:
          days = 30;
      }
      
      // Generate mock data points
      return Array.from({ length: days }).map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (days - i - 1));
        
        // Random values between ranges
        const articles = Math.floor(Math.random() * 5) + 1;
        const videos = Math.floor(Math.random() * 3);
        
        return {
          date: date.toISOString().split('T')[0],
          Articles: articles,
          Videos: videos,
          Total: articles + videos
        };
      });
    }
  });
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Content Overview</CardTitle>
            <CardDescription>
              Publication frequency over time
            </CardDescription>
          </div>
          <Tabs value={period} onValueChange={(v) => setPeriod(v as any)}>
            <TabsList className="grid grid-cols-3 h-8">
              <TabsTrigger value="7days" className="text-xs">7d</TabsTrigger>
              <TabsTrigger value="30days" className="text-xs">30d</TabsTrigger>
              <TabsTrigger value="90days" className="text-xs">90d</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-muted-foreground">Loading chart data...</p>
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ChartContainer config={{
              Articles: { color: "#4f46e5" },
              Videos: { color: "#0ea5e9" }
            }}>
              <ChartBar 
                data={{
                  labels: data?.map(d => new Date(d.date).toLocaleDateString(undefined, 
                    period === "7days" ? { weekday: 'short' } : { month: 'short', day: 'numeric' })) || [],
                  datasets: [
                    {
                      label: 'Articles',
                      data: data?.map(d => d.Articles) || [],
                      backgroundColor: '#4f46e5',
                      borderRadius: 4,
                    },
                    {
                      label: 'Videos',
                      data: data?.map(d => d.Videos) || [],
                      backgroundColor: '#0ea5e9',
                      borderRadius: 4,
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: { stacked: true },
                    y: { stacked: true, ticks: { stepSize: 1 } }
                  },
                  plugins: {
                    legend: { position: 'top' as const }
                  }
                }}
              />
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContentOverview;