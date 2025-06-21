
import { useRemedies, updateRemedyClickCount } from "./remedies/useRemedies";
import RemedyCard from "./remedies/RemedyCard";
import { getSafeImageUrl, ensureRemedyImagesBucket } from "@/utils/imageValidation";
import { migrateRemedyImages, validateRemedyImages } from "@/utils/remedyImageMigration";
import { useEffect } from "react";

const RemediesSection = () => {
  const { data: remedies = [], isLoading, error } = useRemedies();

  // Run migration and validation on component mount
  useEffect(() => {
    const initializeRemedyImages = async () => {
      await ensureRemedyImagesBucket();
      await migrateRemedyImages();
      await validateRemedyImages();
    };
    
    initializeRemedyImages();
  }, []);

  // STANDARDIZED: Only use image_url field for all remedies
  console.log('RemediesSection remedies:', remedies?.length || 0);
  remedies?.forEach((remedy, index) => {
    const safeImageUrl = getSafeImageUrl(remedy.image_url);
    console.log(`Main RemediesSection - Remedy ${index + 1} (${remedy.name}):`, {
      id: remedy.id,
      image_url: remedy.image_url,
      safe_image_url: safeImageUrl,
      status: remedy.status,
      is_valid_http: remedy.image_url?.startsWith('http') || false
    });
  });

  const handleRemedyClick = async (remedyId: string) => {
    const remedy = remedies.find(r => r.id === remedyId);
    if (remedy) {
      await updateRemedyClickCount(remedyId, remedy.click_count || 0);
    }
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-white w-full">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <h2 className="text-3xl font-bold text-text mb-12 text-center">Natural Remedies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-muted animate-pulse rounded-lg h-64" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    console.error('RemediesSection: Query error:', error);
    return (
      <section className="py-16 bg-white w-full">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <h2 className="text-3xl font-bold text-text mb-12 text-center">Natural Remedies</h2>
          <div className="text-center py-8 text-muted-foreground">
            Error loading remedies. Please try again later.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white w-full">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <h2 className="text-3xl font-bold text-text mb-12 text-center">Natural Remedies</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {remedies.map((remedy) => {
            // STANDARDIZED: Only use image_url field
            const safeImageUrl = getSafeImageUrl(remedy.image_url);
            
            console.log(`RemediesSection rendering ${remedy.name} with image:`, {
              original: remedy.image_url,
              safe: safeImageUrl,
              is_placeholder: safeImageUrl === "/placeholder.svg"
            });
            
            return (
              <RemedyCard
                key={remedy.id}
                id={remedy.id}
                name={remedy.name}
                summary={remedy.summary}
                imageUrl={safeImageUrl}
                onClick={handleRemedyClick}
              />
            );
          })}
          {remedies.length === 0 && (
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
