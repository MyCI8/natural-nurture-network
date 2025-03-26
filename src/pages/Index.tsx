
import Hero from "../components/Hero";
import Features from "../components/Features";
import NewsSection from "../components/NewsSection";
import RemediesSection from "../components/RemediesSection";
import SymptomsMarquee from "../components/SymptomsMarquee";
import { useEffect } from "react";

const Index = () => {
  // Enable smooth scrolling and proper touch handling on mobile
  useEffect(() => {
    // Enable momentum scrolling on iOS
    document.documentElement.style.setProperty(
      '--webkit-overflow-scrolling', 'touch'
    );
    
    return () => {
      document.documentElement.style.removeProperty(
        '--webkit-overflow-scrolling'
      );
    };
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <Hero />
      <SymptomsMarquee />
      <NewsSection />
      <RemediesSection />
      <Features />
    </div>
  );
};

export default Index;
