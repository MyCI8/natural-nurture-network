
import Hero from "../components/Hero";
import Features from "../components/Features";
import NewsSection from "../components/NewsSection";
import RemediesSection from "../components/RemediesSection";
import SymptomsMarquee from "../components/SymptomsMarquee";
import { useEffect } from "react";
import { ThemeProvider } from "../components/theme-provider";

const Index = () => {
  // Enable smooth scrolling and proper touch handling on mobile
  useEffect(() => {
    // Enable momentum scrolling on iOS
    document.documentElement.style.setProperty(
      '--webkit-overflow-scrolling', 'touch'
    );
    
    // Add invisible swipe detection area for the mobile menu
    const addSwipeArea = () => {
      // Check if we're on mobile
      if (window.innerWidth <= 768) {
        // Check if swipe area already exists
        if (!document.querySelector('.swipe-detection-area')) {
          const swipeArea = document.createElement('div');
          swipeArea.className = 'swipe-detection-area';
          swipeArea.setAttribute('aria-hidden', 'true');
          document.body.appendChild(swipeArea);
        }
      } else {
        // Remove if exists and we're not on mobile
        const existingSwipeArea = document.querySelector('.swipe-detection-area');
        if (existingSwipeArea) {
          existingSwipeArea.remove();
        }
      }
    };
    
    addSwipeArea();
    window.addEventListener('resize', addSwipeArea);
    
    return () => {
      document.documentElement.style.removeProperty(
        '--webkit-overflow-scrolling'
      );
      window.removeEventListener('resize', addSwipeArea);
      const swipeArea = document.querySelector('.swipe-detection-area');
      if (swipeArea) {
        swipeArea.remove();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background dark:bg-background overflow-hidden transition-colors duration-300">
      <Hero />
      <SymptomsMarquee />
      <NewsSection />
      <RemediesSection />
      <Features />
    </div>
  );
};

export default Index;
