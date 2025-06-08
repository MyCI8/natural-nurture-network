
import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const defaultHealthConcerns = [
  'Sore Throat', 'Depression', 'Joint Pain', 'Anxiety', 'Fatigue', 
  'Cold', 'High Blood Pressure', 'Headache', 'Allergies', 'Stress',
  'Eye Strain', 'Back Pain', 'Cough', 'Cancer', 'Weak Immunity',
  'Skin Irritation', 'Poor Circulation', 'Digestive Issues', 'Insomnia', 'Hair Loss'
];

const HealthConcernsMarquee = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: topHealthConcerns = defaultHealthConcerns } = useQuery({
    queryKey: ['topHealthConcerns'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc('get_top_health_concerns', { limit_count: 20 });
        if (error) {
          console.error('Error fetching top health concerns:', error);
          return defaultHealthConcerns;
        }
        return data.length > 0 ? data.map(item => item.health_concern_name) : defaultHealthConcerns;
      } catch (error) {
        console.error('Error in health concern query:', error);
        return defaultHealthConcerns;
      }
    },
    initialData: defaultHealthConcerns,
    retry: 1
  });

  const handleHealthConcernClick = async (concernName: string) => {
    try {
      // Log the click
      const { error } = await supabase
        .from('health_concern_clicks')
        .insert([{ health_concern_name: concernName, user_id: (await supabase.auth.getUser()).data.user?.id }]);
      
      if (error) {
        console.error('Error logging health concern click:', error);
      }
      
      // Find the health concern ID or navigate by name
      const { data: healthConcernData, error: lookupError } = await supabase
        .from('health_concerns')
        .select('id')
        .eq('name', concernName)
        .maybeSingle();
      
      if (lookupError) {
        console.error('Error looking up health concern:', lookupError);
      }
      
      if (healthConcernData?.id) {
        navigate(`/health-concerns/${healthConcernData.id}`);
      } else {
        navigate(`/health-concerns/${encodeURIComponent(concernName)}`);
        toast({
          description: `Navigating to ${concernName}`,
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <section className="py-8 bg-accent dark:bg-dm-mist overflow-hidden z-0 relative health-concerns-marquee">
      <div className="w-full mx-auto">
        <div className="group relative">
          <Carousel
            opts={{
              align: "start",
              loop: true,
              dragFree: true,
              containScroll: false,
            }}
            className="w-full"
          >
            <CarouselContent className={cn(
              "group-hover:[animation-play-state:paused]",
              isMobile ? "animate-marquee-fast" : "animate-marquee"
            )}>
              {[...topHealthConcerns, ...topHealthConcerns].map((concern, index) => (
                <CarouselItem
                  key={`${concern}-${index}`}
                  className="basis-auto pl-8 cursor-pointer touch-manipulation active-scale"
                  onClick={() => handleHealthConcernClick(concern)}
                >
                  <div
                    className={cn(
                      "text-lg font-medium text-primary dark:text-primary hover:text-primary-dark dark:hover:text-dm-contrast",
                      "transition-colors duration-200"
                    )}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleHealthConcernClick(concern);
                      }
                    }}
                  >
                    {concern}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default HealthConcernsMarquee;
