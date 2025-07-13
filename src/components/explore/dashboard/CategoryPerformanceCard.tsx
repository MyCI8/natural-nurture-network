import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartBar } from '@/components/ui/chart';

interface CategoryData {
  name: string;
  views: number;
  likes: number;
  engagement: number;
}

interface CategoryPerformanceCardProps {
  data: CategoryData[];
}

const CategoryPerformanceCard = ({ data }: CategoryPerformanceCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          Performance by Category
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ChartContainer config={{
            views: { color: "#8884d8" },
            likes: { color: "#82ca9d" },
            engagement: { color: "#ffc658" }
          }}>
            <ChartBar 
              data={{
                labels: data.map(d => d.name),
                datasets: [
                  {
                    label: 'Views',
                    data: data.map(d => d.views),
                    backgroundColor: '#8884d8',
                    borderRadius: 4,
                  },
                  {
                    label: 'Likes', 
                    data: data.map(d => d.likes),
                    backgroundColor: '#82ca9d',
                    borderRadius: 4,
                  },
                  {
                    label: 'Engagement Rate (%)',
                    data: data.map(d => d.engagement),
                    backgroundColor: '#ffc658',
                    borderRadius: 4,
                    yAxisID: 'y1',
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: { type: 'linear' as const, display: true, position: 'left' as const },
                  y1: { type: 'linear' as const, display: true, position: 'right' as const, grid: { drawOnChartArea: false } }
                },
                plugins: {
                  legend: { position: 'top' as const }
                }
              }}
            />
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryPerformanceCard;