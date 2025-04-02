
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AspectRatio } from '@/components/ui/aspect-ratio';

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
        <h2 className="text-sm font-bold mb-3 sm:mb-4 text-left text-primary">
          Natural Remedies
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {remedies?.map((remedy, index) => (
            <Link to={`/remedies/${remedy.id}`} key={remedy.id}>
              <Card 
                className={`overflow-hidden border-0 ${
                  index !== remedies.length - 1 ? 'border-b border-border dark:border-dm-mist/50' : ''
                } animate-fadeIn hover:shadow-none transition-shadow duration-200`}
              >
                <CardContent className="p-0">
                  <AspectRatio ratio={1} className="bg-gray-100">
                    <img 
                      src={remedy.image_url || "/placeholder.svg"} 
                      alt={remedy.name} 
                      className="w-full h-full object-cover" 
                      loading="lazy" 
                    />
                  </AspectRatio>
                  <div className="p-3">
                    <h3 className="text-xs sm:text-sm font-semibold text-primary dark:text-primary line-clamp-2">
                      {remedy.name}
                    </h3>
                    <p className="text-xs text-primary dark:text-primary line-clamp-2">
                      {remedy.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        {remedies?.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No remedies available
          </div>
        )}
      </div>
    </div>
  );
};

export default RemediesSection;
