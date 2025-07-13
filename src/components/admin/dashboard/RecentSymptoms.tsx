
import { useNavigate } from "react-router-dom";
import { Stethoscope, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
// Note: This component is deprecated - symptoms replaced with health concerns system

interface RecentSymptomsProps {
  symptoms: { concern_name: string; click_count: number }[];
  isLoading: boolean;
}

const RecentSymptoms = ({ symptoms, isLoading }: RecentSymptomsProps) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Top Health Concerns</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/admin/health-concerns")}
        >
          View All
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {symptoms?.map((item, index) => (
              <div
                key={item.concern_name || index}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                onClick={() => navigate(`/admin/health-concerns`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigate(`/admin/health-concerns`);
                  }
                }}
              >
                <div className="space-y-1">
                  <p className="font-medium flex items-center">
                    <Stethoscope className="h-4 w-4 mr-2" />
                    {item.concern_name || 'Unknown'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {item.click_count} clicks
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentSymptoms;
