
import React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e5e5"
                vertical={false}
              />
              <Tooltip />
              {data[0]?.views !== undefined && (
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#8884d8"
                  fillOpacity={1}
                  fill="url(#colorViews)"
                />
              )}
              {data[0]?.likes !== undefined && (
                <Area
                  type="monotone"
                  dataKey="likes"
                  stroke="#82ca9d"
                  fillOpacity={1}
                  fill="url(#colorLikes)"
                />
              )}
              {data[0]?.comments !== undefined && (
                <Area
                  type="monotone"
                  dataKey="comments"
                  stroke="#ffc658"
                  fill="#ffc658"
                  fillOpacity={0.3}
                />
              )}
              {data[0]?.shares !== undefined && (
                <Area
                  type="monotone"
                  dataKey="shares"
                  stroke="#ff7300"
                  fill="#ff7300"
                  fillOpacity={0.3}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoMetricsChart;
