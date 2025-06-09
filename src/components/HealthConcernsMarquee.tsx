
import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const defaultHealthConcerns = [
  'Sore Throat', 'Depression', 'Joint Pain', 'Anxiety', 'Fatigue', 
  'Cold', 'High Blood Pressure', 'Headache', 'Allergies', 'Stress',
  'Eye Strain', 'Back Pain', 'Cough', 'Cancer', 'Weak Immunity',
  'Skin Irritation', 'Poor Circulation', 'Digestive Issues', 'Insomnia', 'Hair Loss',
  'Chronic Fatigue', 'Hormonal Imbalances', 'Immune System Weakness', 'Parasites', 'Skin Conditions',
  'Low Energy and Adrenal Fatigue', 'Cardiovascular Health', 'Blood Sugar Imbalances', 'Respiratory Issues', 'Weight Management'
];

const HealthConcernsMarquee = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();

  // For now, use default health concerns since the migration hasn't been applied yet
  const topHealthConcerns = defaultHealthConcerns;

  const handleHealthConcernClick = async (concernName: string) => {
    try {
      // Navigate directly using the concern name for now
      navigate(`/health-concerns/${encodeURIComponent(concernName)}`);
      toast({
        description: `Navigating to ${concernName}`,
      });
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
