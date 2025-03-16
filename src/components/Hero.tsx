
import { ArrowUp } from "lucide-react";
import { Input } from "@/components/ui/input";

const Hero = () => {
  return (
    <div className="relative bg-black pt-24 pb-16 sm:pt-32 lg:overflow-hidden w-full z-0">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source
            src="https://tdnuswekfcjgvqyiotoj.supabase.co/storage/v1/object/public/site-assets/hero-background.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8">
          <div className="mx-auto max-w-md px-0 sm:max-w-2xl sm:px-6 sm:text-center lg:px-0 lg:text-left lg:flex lg:items-center">
            <div className="lg:py-24">
              <h1 className="mt-4 text-4xl tracking-tight font-extrabold text-white sm:mt-5 sm:text-6xl lg:mt-6">
                <span className="block">Natural Healing</span>
                <span className="block text-primary-light">Made Simple</span>
              </h1>
              <p className="mt-3 text-base text-gray-300 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                Discover the power of natural remedies with our curated collection of
                alternative medicine solutions. Join our community of wellness enthusiasts
                and expert practitioners.
              </p>
              <div className="mt-10 sm:mt-12 max-w-md mx-auto lg:mx-0 lg:max-w-md">
                <div className="relative">
                  <Input 
                    type="text"
                    placeholder="Ask me anything about natural healing..."
                    className="pr-12 text-base bg-white/90 backdrop-blur-sm border-white/20"
                  />
                  <button 
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Send message"
                  >
                    <ArrowUp className="h-5 w-5 text-primary" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 -mb-16 sm:-mb-48 lg:m-0 lg:relative">
            <div className="mx-auto max-w-md px-4 sm:max-w-2xl sm:px-6 lg:max-w-none lg:px-0">
              <div className="w-full lg:absolute lg:inset-y-0 lg:left-0 lg:h-full lg:w-auto lg:max-w-none">
                <div className="relative h-64 w-full sm:h-72 md:h-96 lg:absolute lg:inset-y-0 lg:left-0 lg:h-full lg:w-auto lg:max-w-none">
                  {/* Removed the gradient background since we now have video */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
