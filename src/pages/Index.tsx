import Hero from "../components/Hero";
import Features from "../components/Features";
import NewsSection from "../components/NewsSection";
import RemediesSection from "../components/RemediesSection";
import SymptomsMarquee from "../components/SymptomsMarquee";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <NewsSection />
      <SymptomsMarquee />
      <RemediesSection />
      <Features />
    </div>
  );
};

export default Index;