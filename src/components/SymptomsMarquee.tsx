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
import { Database } from "@/integrations/supabase/types";

type SymptomType = Database['public']['Enums']['symptom_type'];

const defaultSymptoms: SymptomType[] = [
  'Cough', 'Cold', 'Sore Throat', 'Cancer', 'Stress', 
  'Anxiety', 'Depression', 'Insomnia', 'Headache', 'Joint Pain',
  'Digestive Issues', 'Fatigue', 'Skin Irritation', 'High Blood Pressure', 'Allergies',
  'Weak Immunity', 'Back Pain', 'Poor Circulation', 'Hair Loss', 'Eye Strain'
];

const SymptomsMarquee = () => {
  const isMobile = useIsMobile();

  const { data: topSymptoms } = useQuery({
    queryKey: ['topSymptoms'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_top_symptoms', { limit_count: 20 });
      if (error) {
        console.error('Error fetching top symptoms:', error);
        return defaultSymptoms;
      }
      return data.length > 0 ? data.map(item => item.symptom) : defaultSymptoms;
    }
  });

  const handleSymptomClick = async (symptom: SymptomType) => {
    try {
      const { error } = await supabase
        .from('symptom_clicks')
        .insert([{ symptom, user_id: (await supabase.auth.getUser()).data.user?.id }]);
      
      if (error) {
        console.error('Error logging symptom click:', error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const symptoms = topSymptoms || defaultSymptoms;

  return (
    <section className="py-8 bg-accent overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="group">
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
              {[...symptoms, ...symptoms].map((symptom, index) => (
                <CarouselItem
                  key={index}
                  className="basis-auto pl-8 cursor-pointer"
                  onClick={() => handleSymptomClick(symptom)}
                >
                  <a
                    href={`#${symptom.toLowerCase().replace(/\s+/g, '-')}`}
                    className={cn(
                      "text-lg font-medium text-primary hover:text-primary-dark",
                      "transition-colors duration-200"
                    )}
                  >
                    {symptom}
                  </a>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default SymptomsMarquee;