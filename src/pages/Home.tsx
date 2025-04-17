
import { useEffect } from "react";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import NewsSection from "@/components/NewsSection";
import SymptomsMarquee from "@/components/SymptomsMarquee";
import { useLayout } from "@/contexts/LayoutContext";

const Home = () => {
  const { setShowRightSection } = useLayout();
  
  // Ensure right section is off for home page
  useEffect(() => {
    setShowRightSection(false);
    return () => {
      // Clean up effect when component unmounts
      setShowRightSection(false);
    };
  }, [setShowRightSection]);

  return (
    <div className="min-h-screen bg-white dark:bg-background overflow-hidden">
      <Hero />
      <SymptomsMarquee />
      <NewsSection />
      <Features />
    </div>
  );
};

export default Home;
