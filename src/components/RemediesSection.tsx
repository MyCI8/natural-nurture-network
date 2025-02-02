import { useRemedies, updateRemedyClickCount } from "./remedies/useRemedies";
import RemedyCard from "./remedies/RemedyCard";

const RemediesSection = () => {
  const { data: remedies = [] } = useRemedies();

  const handleRemedyClick = async (remedyId: string) => {
    const remedy = remedies.find(r => r.id === remedyId);
    if (remedy) {
      await updateRemedyClickCount(remedyId, remedy.click_count || 0);
    }
  };

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
        </div>
      </div>
    </section>
  );
};

export default RemediesSection;