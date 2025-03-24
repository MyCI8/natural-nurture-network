
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 5,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }} 
                tickFormatter={(value) => {
                  // Format date based on period
                  if (period === "7days") {
                    return new Date(value).toLocaleDateString(undefined, { weekday: 'short' });
                  }
                  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                }}
                interval={period === "7days" ? 0 : period === "30days" ? 6 : 14}
              />
              <YAxis 
                tick={{ fontSize: 12 }} 
                tickFormatter={(value) => value.toFixed(0)}
              />
              <Tooltip 
                formatter={(value, name) => [value, name]}
                labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              />
              <Bar dataKey="Articles" stackId="a" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Videos" stackId="a" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default ContentOverview;
