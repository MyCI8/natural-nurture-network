
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";

interface NewsStatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: string;
  statusColor?: string;
  onClick?: () => void;
  className?: string;
}

const NewsStatsCard = ({
  title,
  value,
  description,
  icon,
  trend,
  statusColor = "text-green-600",
  onClick,
  className
}: NewsStatsCardProps) => {
  const showTrend = trend !== undefined;
  const isPositive = !trend?.startsWith('-');
  
  return (
    <Card 
      className={`overflow-hidden transition-all hover:shadow-md ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center justify-between">
          <CardDescription>{description}</CardDescription>
          {showTrend && (
            <p className={`text-xs flex items-center ${statusColor}`}>
              {isPositive ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
              {trend}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsStatsCard;
