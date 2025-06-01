
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Star, Heart, Leaf } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface UserRemediesProps {
  userId: string;
}

export const UserRemedies = ({ userId }: UserRemediesProps) => {
  const { data: userRemedies, isLoading } = useQuery({
    queryKey: ['userRemedies', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('remedies')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
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

  if (!userRemedies?.length) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Leaf className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No remedies yet</h3>
        <p className="text-muted-foreground">
          Share your first natural remedy with the community
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {userRemedies.map((remedy) => (
        <Link to={`/remedies/${remedy.id}`} key={remedy.id}>
          <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 h-full">
            <CardContent className="p-0 h-full">
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={remedy.image_url || '/placeholder.svg'}
                  alt={remedy.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-2 right-2">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    remedy.status === 'published' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-yellow-500 text-white'
                  }`}>
                    {remedy.status}
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                  {remedy.name}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {remedy.summary}
                </p>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-medium">4.8</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3 text-red-500" />
                    <span className="text-xs text-muted-foreground">2.3k</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};
