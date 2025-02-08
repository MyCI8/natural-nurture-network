
import type { Database } from "@/integrations/supabase/types";

type NewsArticleLink = Database["public"]["Tables"]["news_article_links"]["Row"];

interface RelatedNewsLinksProps {
  links: NewsArticleLink[];
}

export const RelatedNewsLinks = ({ links }: RelatedNewsLinksProps) => {
  if (!links || links.length === 0) return null;

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-6">Related Links</h2>
      <div className="space-y-4">
        {links.map((link, index) => (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 bg-secondary rounded-lg hover:bg-accent transition-colors"
          >
            <div className="flex-shrink-0 w-16 h-16 bg-primary/10 rounded overflow-hidden">
              <img
                src={`https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d`}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.svg";
                }}
              />
            </div>
            <div className="flex-grow min-w-0">
              <h3 className="font-medium text-lg text-text truncate">{link.title}</h3>
              <p className="text-sm text-text-light truncate">{link.url}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};
