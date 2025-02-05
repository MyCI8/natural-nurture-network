
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

const NewsArticle = () => {
  const { id } = useParams();

  const { data: article, isLoading } = useQuery({
    queryKey: ["news-article", id],
    queryFn: async () => {
      const { data: articleData, error: articleError } = await supabase
        .from("news_articles")
        .select("*")
        .eq("id", id)
        .single();

      if (articleError) throw articleError;

      if (articleData.related_experts && articleData.related_experts.length > 0) {
        const { data: expertsData, error: expertsError } = await supabase
          .from("experts")
          .select("*")
          .in("id", articleData.related_experts);

        if (expertsError) throw expertsError;
        articleData.expertDetails = expertsData;
      }

      return articleData;
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-64 w-full mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-bold mb-4">Article not found</h1>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <article className="text-left">
        <h1 className="text-3xl font-bold mb-6">{article.title}</h1>
        {article.main_image_url && (
          <figure className="mb-8">
            <img
              src={article.main_image_url}
              alt={article.main_image_description || ""}
              className="w-full rounded-lg"
            />
            {article.main_image_description && (
              <figcaption className="mt-2 text-sm text-text-light text-center">
                {article.main_image_description}
              </figcaption>
            )}
          </figure>
        )}
        <div 
          className="prose prose-lg max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Related Experts Section */}
        {article.expertDetails && article.expertDetails.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Related Experts</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {article.expertDetails.map((expert) => (
                <Card key={expert.id} className="text-center">
                  <CardContent className="pt-6">
                    {expert.image_url ? (
                      <img
                        src={expert.image_url}
                        alt={expert.full_name}
                        className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
                        <span className="text-4xl text-text-light">
                          {expert.full_name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <h3 className="font-semibold text-lg">{expert.full_name}</h3>
                    <p className="text-text-light">{expert.title}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Related Links Section */}
        {article.related_links && article.related_links.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-6">Related Links</h2>
            <div className="space-y-4">
              {article.related_links.map((link: { title: string; url: string }, index: number) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 bg-secondary rounded-lg hover:bg-accent transition-colors"
                >
                  <h3 className="font-medium text-lg text-text">{link.title}</h3>
                  <p className="text-sm text-text-light mt-1">{link.url}</p>
                </a>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
};

export default NewsArticle;
