
import { useRemedies, updateRemedyClickCount } from "./useRemedies";
import RemedyCard from "./RemedyCard";

interface RemediesSectionProps {
  inNewsSection?: boolean;
}

const RemediesSection = ({ inNewsSection = false }: RemediesSectionProps) => {
  const { data: remedies = [] } = useRemedies();

  const handleRemedyClick = async (remedyId: string) => {
    const remedy = remedies.find(r => r.id === remedyId);
    if (remedy) {
      await updateRemedyClickCount(remedyId, remedy.click_count || 0);
    }
  };

  // When embedded in NewsSection, use a more compact layout
  if (inNewsSection) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-left mb-6">Natural Remedies</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
          {remedies.slice(0, 4).map((remedy) => (
            <RemedyCard
              key={remedy.id}
              id={remedy.id}
              name={remedy.name}
              summary={remedy.summary}
              imageUrl={remedy.image_url}
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
    );
  }

  // Original standalone section
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-text mb-12 text-center">Natural Remedies</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {remedies.map((remedy) => (
            <RemedyCard
              key={remedy.id}
              id={remedy.id}
              name={remedy.name}
              summary={remedy.summary}
              imageUrl={remedy.image_url}
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
