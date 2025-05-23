
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface RemedyGridProps {
  remedies: any[];
  isLoading: boolean;
  onDelete: (remedy: any) => void;
  onToggleStatus?: (remedy: any) => void;
}

const RemedyGrid = ({ remedies, isLoading, onDelete, onToggleStatus }: RemedyGridProps) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-0">
              <Skeleton className="w-full h-48" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (remedies.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No remedies found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {remedies.map((remedy) => (
        <Card key={remedy.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            <div className="relative h-48 bg-muted">
              <img
                src={remedy.image_url || "/placeholder.svg"}
                alt={remedy.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <Badge
                  variant={remedy.status === "published" ? "default" : "secondary"}
                  className="capitalize"
                >
                  {remedy.status}
                </Badge>
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-lg line-clamp-1">{remedy.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {remedy.summary}
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  {remedy.click_count || 0} clicks
                </div>
                
                <div className="flex gap-2">
                  {onToggleStatus && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onToggleStatus(remedy)}
                      title={remedy.status === "published" ? "Unpublish" : "Publish"}
                    >
                      {remedy.status === "published" ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/admin/remedies/edit/${remedy.id}`)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(remedy)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RemedyGrid;
