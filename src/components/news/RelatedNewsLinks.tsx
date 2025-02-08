
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
            <div className="flex-shrink-0 w-24 h-24 bg-primary/10 rounded overflow-hidden">
              {link.thumbnail_url && (
                <img
                  src={link.thumbnail_url}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    console.log('Image load error:', e);
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              )}
              <div className={`w-full h-full flex items-center justify-center ${link.thumbnail_url ? 'hidden' : ''}`}>
                <img
                  src="/placeholder.svg"
                  alt=""
                  className="w-12 h-12 opacity-50"
                />
              </div>
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
