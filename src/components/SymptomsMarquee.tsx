
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
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

type SymptomType = Database['public']['Enums']['symptom_type'];

const defaultSymptoms: SymptomType[] = [
  'Cough', 'Cold', 'Sore Throat', 'Cancer', 'Stress', 
  'Anxiety', 'Depression', 'Insomnia', 'Headache', 'Joint Pain',
  'Digestive Issues', 'Fatigue', 'Skin Irritation', 'High Blood Pressure', 'Allergies',
  'Weak Immunity', 'Back Pain', 'Poor Circulation', 'Hair Loss', 'Eye Strain'
];

const SymptomsMarquee = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: topSymptoms = defaultSymptoms } = useQuery({
    queryKey: ['topSymptoms'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc('get_top_symptoms', { limit_count: 20 });
        if (error) {
          console.error('Error fetching top symptoms:', error);
          return defaultSymptoms;
        }
        return data.length > 0 ? data.map(item => item.symptom) : defaultSymptoms;
      } catch (error) {
        console.error('Error in symptom query:', error);
        return defaultSymptoms;
      }
    },
    initialData: defaultSymptoms,
    retry: 1
  });

  const handleSymptomClick = async (symptom: SymptomType) => {
    try {
      // Log the click
      const { error } = await supabase
        .from('symptom_clicks')
        .insert([{ symptom, user_id: (await supabase.auth.getUser()).data.user?.id }]);
      
      if (error) {
        console.error('Error logging symptom click:', error);
      }
      
      // Find the symptom ID or navigate by name
      const { data: symptomData, error: lookupError } = await supabase
        .from('symptom_details')
        .select('id')
        .eq('symptom', symptom)
        .maybeSingle();
      
      if (lookupError) {
        console.error('Error looking up symptom:', lookupError);
      }
      
      if (symptomData?.id) {
        navigate(`/symptoms/${symptomData.id}`);
      } else {
        navigate(`/symptoms/${encodeURIComponent(symptom)}`);
        toast({
          description: `Navigating to ${symptom}`,
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <section className="py-8 bg-accent dark:bg-accent-dark overflow-hidden z-0 relative">
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
              {[...topSymptoms, ...topSymptoms].map((symptom, index) => (
                <CarouselItem
                  key={`${symptom}-${index}`}
                  className="basis-auto pl-8 cursor-pointer"
                  onClick={() => handleSymptomClick(symptom)}
                >
                  <div
                    className={cn(
                      "text-lg font-medium text-primary hover:text-primary-dark dark:text-primary-foreground dark:hover:text-white",
                      "transition-colors duration-200"
                    )}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleSymptomClick(symptom);
                      }
                    }}
                  >
                    {symptom}
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

export default SymptomsMarquee;
