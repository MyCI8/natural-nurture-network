import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import RemedyImageCard from './RemedyImageCard';
import { getSafeImageUrl, ensureRemedyImagesBucket } from '@/utils/imageValidation';
import { migrateRemedyImages } from '@/utils/remedyImageMigration';
import { log } from '@/utils/logger';
import ErrorBoundary from '@/components/ErrorBoundary';

interface RemediesSectionProps {
  inNewsSection?: boolean;
}

const RemediesSection: React.FC<RemediesSectionProps> = ({ inNewsSection = false }) => {
  // Check storage bucket and run migration on component mount
  useEffect(() => {
    const initializeImages = async () => {
      await ensureRemedyImagesBucket();
      await migrateRemedyImages();
    };
    initializeImages();
  }, []);

  const { data: remedies, isLoading, error } = useQuery({
    queryKey: ['latest-remedies'],
    queryFn: async () => {
      log.debug('Fetching latest remedies');
      const { data, error } = await supabase
        .from('remedies')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(4);
      
      if (error) {
        log.error('Error fetching remedies', error);
        throw error;
      }
      
      log.info('Remedies fetched successfully', { count: data?.length || 0 });
      
      // Log image validation results for debugging
      data?.forEach((remedy, index) => {
        const safeImageUrl = getSafeImageUrl(remedy.image_url);
        
        log.debug(`Remedy image validation`, {
          remedyId: remedy.id,
          remedyName: remedy.name,
          hasValidImage: !!safeImageUrl,
          isStorageUrl: remedy.image_url?.includes('supabase.co') && remedy.image_url?.includes('/storage/v1/object/public/') || false
        });
      });
      
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className={inNewsSection ? 'pt-6 sm:pt-8' : 'py-6 sm:py-8 lg:py-12'}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="rounded-2xl bg-muted aspect-[16/9] w-full h-[170px] animate-pulse flex items-center justify-center" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    log.error('Query error in RemediesSection', error);
    return (
      <div className={`${inNewsSection ? 'pt-6 sm:pt-8' : 'py-6 sm:py-8 lg:py-12'}`}>
        <div className="text-center py-8 text-muted-foreground">
          Error loading remedies. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary level="section">
      <section className={inNewsSection ? 'pt-6 sm:pt-8' : 'py-6 sm:py-8 lg:py-12'}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold mb-6 text-primary text-center md:text-left">
            Natural Remedies
          </h2>
          <div
            className={`
              remedies-grid
              grid grid-cols-1 
              sm:grid-cols-2 
              md:grid-cols-3 
              lg:grid-cols-4 
              gap-x-6 gap-y-9 
              w-full
            `}
          >
            {remedies?.map((remedy) => (
              <RemedyImageCard
                key={remedy.id}
                imageUrl={remedy.image_url || "/placeholder.svg"}
                name={remedy.name}
                summary={remedy.summary || remedy.description}
                onClick={() => window.location.assign(`/remedies/${remedy.id}`)}
              />
            ))}
            {(!remedies || remedies.length === 0) && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No remedies available
              </div>
            )}
          </div>
        </div>
      </section>
    </ErrorBoundary>
  );
};

export default RemediesSection;
