import Hero from "../components/Hero";
import Features from "../components/Features";
import NewsSection from "../components/NewsSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <NewsSection />
      <Features />
    </div>
  );
};

export default Index;