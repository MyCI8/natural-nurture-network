import { Heart, Leaf, ShoppingCart, MessageCircle } from "lucide-react";

const Features = () => {
  const features = [
    {
      name: "Natural Remedies",
      description: "Access our curated collection of natural healing solutions.",
      icon: Leaf,
    },
    {
      name: "Expert Advice",
      description: "Connect with certified practitioners and wellness experts.",
      icon: Heart,
    },
    {
      name: "Shopping Lists",
      description: "Create and manage your wellness shopping lists.",
      icon: ShoppingCart,
    },
    {
      name: "AI Chat Support",
      description: "Get instant answers to your health-related questions.",
      icon: MessageCircle,
    },
  ];

  return (
    <div className="py-16 bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-text sm:text-4xl">
            Everything you need for natural wellness
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-text-light">
            Discover our comprehensive suite of features designed to support your
            journey to natural health.
          </p>
        </div>

        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.name} className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary rounded-md shadow-lg">
                        <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-text tracking-tight">
                      {feature.name}
                    </h3>
                    <p className="mt-5 text-base text-text-light">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;