
import { useRemedies, updateRemedyClickCount } from "./remedies/useRemedies";
import RemedyCard from "./remedies/RemedyCard";

const RemediesSection = () => {
  const { data: remedies = [] } = useRemedies();

  // Add debugging for remedy data
  console.log('RemediesSection remedies:', remedies);
  remedies.forEach((remedy, index) => {
    console.log(`Main RemediesSection - Remedy ${index + 1} (${remedy.name}):`, {
      id: remedy.id,
      image_url: remedy.image_url,
      main_image_url: remedy.main_image_url,
      status: remedy.status
    });
  });

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
              imageUrl={remedy.image_url || remedy.main_image_url || "/placeholder.svg"}
              onClick={handleRemedyClick}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RemediesSection;
