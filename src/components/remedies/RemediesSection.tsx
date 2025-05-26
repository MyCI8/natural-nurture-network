
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import MediaContainer from '@/components/ui/media-container';

interface RemediesSectionProps {
  inNewsSection?: boolean;
}

const RemediesSection: React.FC<RemediesSectionProps> = ({ inNewsSection = false }) => {
  const { data: remedies, isLoading } = useQuery({
    queryKey: ['latest-remedies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('remedies')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(4);
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className={`${inNewsSection ? 'pt-6 sm:pt-8' : 'py-6 sm:py-8 lg:py-12'}`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-0">
                <Skeleton className="w-full aspect-square" />
                <div className="p-3">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${inNewsSection ? 'pt-6 sm:pt-8' : 'py-6 sm:py-8 lg:py-12'}`}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl font-semibold mb-6 text-primary">
          Natural Remedies
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {remedies?.map((remedy, index) => (
            <Link to={`/remedies/${remedy.id}`} key={remedy.id}>
              <Card 
                className="x-media-card group h-full touch-manipulation active-scale"
              >
                <CardContent className="p-0 h-full">
                  <MediaContainer 
                    aspectRatio="1:1"
                    imageUrl={remedy.image_url || "/placeholder.svg"}
                    imageAlt={remedy.name}
                    className="bg-muted"
                  >
                    <img 
                      src={remedy.image_url || "/placeholder.svg"} 
                      alt={remedy.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      loading="lazy" 
                    />
                  </MediaContainer>
                  <div className="p-4">
                    <h3 className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">
                      {remedy.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {remedy.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {remedies?.length === 0 && (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No remedies available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RemediesSection;
