
import { SimpleUrlPreview } from "@/components/ui/SimpleUrlPreview";
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
          <SimpleUrlPreview 
            key={index}
            url={link.url}
            className="w-full"
          />
        ))}
      </div>
    </section>
  );
};
