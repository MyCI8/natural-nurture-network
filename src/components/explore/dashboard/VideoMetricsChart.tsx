import React from "react";
import { ChartContainer, ChartLine } from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartData {
  name: string;
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
}

interface VideoMetricsChartProps {
  title: string;
  data: ChartData[];
  description?: string;
}

const VideoMetricsChart = ({ title, data, description }: VideoMetricsChartProps) => {
  return (
    <Card className="w-full">
      <CardHeader className="pb-0">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[200px] w-full">
          <ChartContainer config={{
            views: { color: "#8884d8" },
            likes: { color: "#82ca9d" },
            comments: { color: "#ffc658" },
            shares: { color: "#ff7300" }
          }}>
            <ChartLine 
              data={{
                labels: data.map(d => d.name),
                datasets: (() => {
                  const datasets = [];
                  if (data[0]?.views !== undefined) {
                    datasets.push({
                      label: 'Views',
                      data: data.map(d => d.views || 0),
                      borderColor: '#8884d8',
                      backgroundColor: 'rgba(136, 132, 216, 0.2)',
                      fill: true,
                    });
                  }
                  if (data[0]?.likes !== undefined) {
                    datasets.push({
                      label: 'Likes',
                      data: data.map(d => d.likes || 0),
                      borderColor: '#82ca9d',
                      backgroundColor: 'rgba(130, 202, 157, 0.2)',
                      fill: true,
                    });
                  }
                  if (data[0]?.comments !== undefined) {
                    datasets.push({
                      label: 'Comments',
                      data: data.map(d => d.comments || 0),
                      borderColor: '#ffc658',
                      backgroundColor: 'rgba(255, 198, 88, 0.3)',
                      fill: true,
                    });
                  }
                  if (data[0]?.shares !== undefined) {
                    datasets.push({
                      label: 'Shares',
                      data: data.map(d => d.shares || 0),
                      borderColor: '#ff7300',
                      backgroundColor: 'rgba(255, 115, 0, 0.3)',
                      fill: true,
                    });
                  }
                  return datasets;
                })()
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                elements: {
                  point: { radius: 3 }
                },
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  x: { display: false },
                  y: { display: false }
                }
              }}
            />
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoMetricsChart;