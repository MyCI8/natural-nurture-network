
import { useNavigate } from "react-router-dom";
import { Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface RemedyGridProps {
  remedies: any[];
  isLoading: boolean;
  onDelete: (remedy: any) => void;
}

const RemedyGrid = ({ remedies, isLoading, onDelete }: RemedyGridProps) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse space-y-4">
                <div className="aspect-video bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {remedies.map((remedy) => (
        <Card key={remedy.id} className="group">
          <CardContent className="p-4">
            <div className="aspect-video mb-4 relative group-hover:opacity-75 transition-opacity">
              <img
                src={remedy.image_url}
                alt={remedy.name}
                className="w-full h-full object-cover rounded"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/admin/remedies/edit/${remedy.id}`)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(remedy)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <h3 className="font-semibold mb-2">{remedy.name}</h3>
            <p className="text-sm text-muted-foreground mb-2">
              {remedy.summary}
            </p>
            <div className="flex flex-wrap gap-2">
              {remedy.symptoms?.map((symptom: string, index: number) => (
                <span
                  key={index}
                  className="text-xs bg-secondary px-2 py-1 rounded-full"
                >
                  {symptom}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RemedyGrid;
