
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Legend, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from "recharts";

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
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                yAxisId="left"
                orientation="left"
                stroke="#8884d8"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#82ca9d"
                tick={{ fontSize: 12 }}
              />
              <Tooltip />
              <Legend />
              <Bar 
                yAxisId="left"
                dataKey="views" 
                fill="#8884d8" 
                name="Views"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                yAxisId="left"
                dataKey="likes" 
                fill="#82ca9d" 
                name="Likes"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                yAxisId="right"
                dataKey="engagement" 
                fill="#ffc658" 
                name="Engagement Rate (%)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryPerformanceCard;
