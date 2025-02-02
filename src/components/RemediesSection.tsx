import { Card, CardContent } from "@/components/ui/card";

const remedies = [
  {
    image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07",
    name: "Chamomile",
    summary: "A gentle herb known for its calming properties, helping with sleep and digestion."
  },
  {
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    name: "Lavender",
    summary: "Natural stress reliever that promotes relaxation and better sleep quality."
  },
  {
    image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9",
    name: "Ginger Root",
    summary: "Powerful anti-inflammatory properties, aids digestion and boosts immunity."
  },
  {
    image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901",
    name: "Peppermint",
    summary: "Refreshing herb that helps with digestive issues and headache relief."
  },
  {
    image: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1",
    name: "Echinacea",
    summary: "Boosts immune system and helps fight off colds and infections."
  },
  {
    image: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952",
    name: "Turmeric",
    summary: "Natural anti-inflammatory that supports joint health and immunity."
  },
  {
    image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07",
    name: "Green Tea",
    summary: "Rich in antioxidants, promotes heart health and mental clarity."
  },
  {
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    name: "Aloe Vera",
    summary: "Soothes skin conditions and supports digestive health."
  },
  {
    image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9",
    name: "Garlic",
    summary: "Natural antibiotic that supports heart health and immune system."
  },
  {
    image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901",
    name: "Rosemary",
    summary: "Improves memory and concentration while supporting digestion."
  },
  {
    image: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1",
    name: "Sage",
    summary: "Traditional herb for cognitive health and memory enhancement."
  },
  {
    image: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952",
    name: "Thyme",
    summary: "Natural antimicrobial that supports respiratory health."
  }
];

const RemediesSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-text mb-12 text-center">Natural Remedies</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {remedies.map((remedy, index) => (
            <Card 
              key={index} 
              className="overflow-hidden hover:shadow-lg transition-shadow duration-300 animate-fadeIn"
            >
              <CardContent className="p-0">
                <div className="h-48">
                  <img
                    src={remedy.image}
                    alt={remedy.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-text mb-2">
                    {remedy.name}
                  </h3>
                  <p className="text-text-light text-sm">
                    {remedy.summary}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RemediesSection;