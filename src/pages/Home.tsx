
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import NewsSection from "@/components/NewsSection";
import HealthConcernsMarquee from "@/components/HealthConcernsMarquee";

const Home = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-background w-full">
      <Hero />
      <HealthConcernsMarquee />
      <NewsSection />
      <Features />
    </div>
  );
};

export default Home;
