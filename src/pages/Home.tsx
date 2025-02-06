import Hero from "@/components/Hero";
import Features from "@/components/Features";
import NewsSection from "@/components/NewsSection";
import RemediesSection from "@/components/RemediesSection";
import SymptomsMarquee from "@/components/SymptomsMarquee";

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <SymptomsMarquee />
      <NewsSection />
      <RemediesSection />
      <Features />
    </div>
  );
};

export default Home;