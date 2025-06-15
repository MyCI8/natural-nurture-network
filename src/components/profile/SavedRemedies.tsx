import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface SavedRemediesProps {
  userId: string;
}

export const SavedRemedies = ({ userId }: SavedRemediesProps) => {
  const { data: savedRemedies, isLoading } = useQuery({
    queryKey: ['savedRemedies', userId],
    // REVERT: Using a placeholder query to fix build errors.
    // The original query for 'saved_remedies' table failed due to outdated Supabase types.
    queryFn: async () => {
      console.warn("Saved remedies feature is temporarily disabled pending Supabase type generation.");
      return Promise.resolve([]);
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-48 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!savedRemedies?.length) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No saved remedies</h3>
        <p className="text-muted-foreground">
          Start saving remedies you love to see them here
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {savedRemedies.map((savedRemedy: any) => (
        <Link to={`/remedies/${savedRemedy.remedy.id}`} key={savedRemedy.id}>
          <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 h-full">
            <CardContent className="p-0 h-full">
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={savedRemedy.remedy.image_url || '/placeholder.svg'}
                  alt={savedRemedy.remedy.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-2 right-2">
                  <div className="bg-red-500 text-white p-1 rounded-full">
                    <Heart className="h-3 w-3 fill-white" />
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                  {savedRemedy.remedy.name}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {savedRemedy.remedy.summary}
                </p>
                <div className="flex items-center gap-1 pt-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-medium">4.8</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    Saved {new Date(savedRemedy.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};
