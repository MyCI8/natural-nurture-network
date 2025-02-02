import { Card, CardContent } from "@/components/ui/card";

const newsItems = [
  {
    thumbnail: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81",
    headline: "New Study Reveals Benefits of Traditional Herbal Remedies",
    summary: "Research confirms the effectiveness of ancient healing practices in modern healthcare, highlighting specific benefits for chronic conditions."
  },
  {
    thumbnail: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7",
    headline: "Digital Revolution in Natural Medicine",
    summary: "How technology is transforming the way we approach holistic health and natural healing methods."
  },
  {
    thumbnail: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
    headline: "Global Summit on Alternative Medicine Announces Key Findings",
    summary: "Leading practitioners share breakthrough discoveries in natural healing methodologies at international conference."
  },
  {
    thumbnail: "https://images.unsplash.com/photo-1472396961693-142e6e269027",
    headline: "Sustainable Wellness: Nature's Role in Healing",
    summary: "Exploring the connection between environmental conservation and natural healing practices."
  }
];

const NewsSection = () => {
  return (
    <section className="py-12 bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {newsItems.map((item, index) => (
            <Card key={index} className="overflow-hidden animate-fadeIn">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row md:items-center">
                  <div className="w-full md:w-1/3 h-48">
                    <img
                      src={item.thumbnail}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 md:w-2/3">
                    <h3 className="text-xl font-semibold text-text mb-2">
                      {item.headline}
                    </h3>
                    <p className="text-text-light">
                      {item.summary}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;