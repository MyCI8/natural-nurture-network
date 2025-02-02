import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

const symptoms = [
  'Cough', 'Cold', 'Sore Throat', 'Cancer', 'Stress', 
  'Anxiety', 'Depression', 'Insomnia', 'Headache', 'Joint Pain',
  'Digestive Issues', 'Fatigue', 'Skin Irritation', 'High Blood Pressure', 'Allergies',
  'Weak Immunity', 'Back Pain', 'Poor Circulation', 'Hair Loss', 'Eye Strain'
];

const SymptomsMarquee = () => {
  return (
    <section className="py-8 bg-accent overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <Carousel
          opts={{
            align: "start",
            loop: true,
            dragFree: true,
            containScroll: false,
          }}
          className="w-full"
        >
          <CarouselContent className="animate-marquee">
            {[...symptoms, ...symptoms].map((symptom, index) => (
              <CarouselItem
                key={index}
                className="basis-auto pl-8 group cursor-pointer"
              >
                <a
                  href={`#${symptom.toLowerCase().replace(/\s+/g, '-')}`}
                  className={cn(
                    "text-lg font-medium text-primary hover:text-primary-dark",
                    "transition-colors duration-200",
                    "group-hover:pause-animation"
                  )}
                >
                  {symptom}
                </a>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
};

export default SymptomsMarquee;