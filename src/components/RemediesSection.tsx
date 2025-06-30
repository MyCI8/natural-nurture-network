
import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { OptimizedImage } from '@/components/ui/optimized-image';

interface RemediesSectionProps {
  inNewsSection?: boolean;
}

const RemediesSection: React.FC<RemediesSectionProps> = ({ inNewsSection = false }) => {
  const { data: remedies, isLoading, error } = useQuery({
    queryKey: ['latest-remedies-optimized'],
    queryFn: async () => {
      console.log('RemediesSection: Fetching latest remedies...');
      const { data, error } = await supabase
        .from('remedies')
        .select('id, name, summary, image_url, status, created_at')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(4);
      
      if (error) {
        console.error('RemediesSection: Error fetching remedies:', error);
        throw error;
      }
      
      console.log('RemediesSection: Remedies fetched:', data?.length || 0);
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  if (isLoading) {
    return (
      <div className={inNewsSection ? 'pt-6 sm:pt-8' : 'py-6 sm:py-8 lg:py-12'}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold mb-6 text-primary text-center md:text-left">
            Natural Remedies
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-9">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-3">
                <div className="aspect-[16/9] bg-muted animate-pulse rounded-2xl" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded" />
                  <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('RemediesSection: Query error:', error);
    return (
      <div className={`${inNewsSection ? 'pt-6 sm:pt-8' : 'py-6 sm:py-8 lg:py-12'}`}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-8 text-muted-foreground">
            Error loading remedies. Please try again later.
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className={inNewsSection ? 'pt-6 sm:pt-8' : 'py-6 sm:py-8 lg:py-12'}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl font-semibold mb-6 text-primary text-center md:text-left">
          Natural Remedies
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-9 w-full">
          {remedies?.map((remedy) => (
            <div 
              key={remedy.id}
              className="cursor-pointer group"
              onClick={() => window.location.assign(`/remedies/${remedy.id}`)}
            >
              <div className="space-y-3">
                <div className="aspect-[16/9] overflow-hidden rounded-2xl bg-muted">
                  <OptimizedImage
                    src={remedy.image_url || "/placeholder.svg"}
                    alt={remedy.name}
                    width={400}
                    height={225}
                    className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium text-sm line-clamp-2 leading-tight">
                    {remedy.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {remedy.summary}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {(!remedies || remedies.length === 0) && (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No remedies available
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default RemediesSection;
