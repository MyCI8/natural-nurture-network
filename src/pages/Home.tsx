
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import NewsSection from "@/components/NewsSection";
import SymptomsMarquee from "@/components/SymptomsMarquee";

const Home = () => {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <Hero />
      <SymptomsMarquee />
      <NewsSection />
      <Features />
    </div>
  );
};

export default Home;
