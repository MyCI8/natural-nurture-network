import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const RemediesSection = () => {
  const { data: remedies = [] } = useQuery({
    queryKey: ['remedies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('remedies')
        .select('*')
        .order('click_count', { ascending: false });
      
      if (error) {
        console.error('Error fetching remedies:', error);
        throw error;
      }
      
      return data;
    }
  });

  const handleRemedyClick = async (remedyId: string) => {
    try {
      const { error } = await supabase
        .from('remedies')
        .update({ click_count: remedies.find(r => r.id === remedyId)?.click_count + 1 || 1 })
        .eq('id', remedyId);

      if (error) {
        console.error('Error updating remedy click count:', error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-text mb-12 text-center">Natural Remedies</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {remedies.map((remedy) => (
            <Card 
              key={remedy.id} 
              className="overflow-hidden hover:shadow-lg transition-shadow duration-300 animate-fadeIn cursor-pointer"
              onClick={() => handleRemedyClick(remedy.id)}
            >
              <CardContent className="p-0">
                <div className="h-48">
                  <img
                    src={remedy.image_url}
                    alt={remedy.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-text mb-2">
                    {remedy.name}
                  </h3>
                  <p className="text-text-light text-sm">
                    {remedy.summary}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RemediesSection;