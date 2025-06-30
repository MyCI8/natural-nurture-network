
import { useOptimizedRemedies } from "@/hooks/useOptimizedRemedies";
import OptimizedRemedyCard from "./remedies/OptimizedRemedyCard";
import { updateRemedyClickCount } from "./remedies/useRemedies";

const RemediesSection = () => {
  const { 
    remedies, 
    isLoading, 
    error 
  } = useOptimizedRemedies();

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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-muted animate-pulse rounded-lg aspect-[4/3] w-full h-[170px] flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-border/50" />
              </div>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {remedies.map((remedy) => (
            <OptimizedRemedyCard
              key={remedy.id}
              id={remedy.id}
              name={remedy.name}
              summary={remedy.summary}
              imageUrl={remedy.image_url || "/placeholder.svg"}
              onClick={handleRemedyClick}
            />
          ))}
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
