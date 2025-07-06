
import React from 'react';
import { ProductLink } from '@/types/video';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ProductLinksListProps {
  productLinks: ProductLink[];
}

const ProductLinksList: React.FC<ProductLinksListProps> = ({ productLinks }) => {
  if (productLinks.length === 0) {return null;}

  const handleProductClick = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="mt-4">
      <h3 className="font-semibold text-base mb-3 flex items-center gap-2 dark:text-dm-text">
        <ShoppingCart className="h-4 w-4" />
        Featured Products
      </h3>
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
        {productLinks.map(link => (
          <Card key={link.id} className="overflow-hidden border border-gray-200 dark:border-gray-700">
            <CardContent className="p-3">
              <div className="flex touch-manipulation" onClick={() => handleProductClick(link.url)}>
                {link.image_url && (
                  <div className="w-14 h-14 flex-shrink-0 mr-3">
                    <img 
                      src={link.image_url} 
                      alt={link.title} 
                      className="w-full h-full object-contain rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200/f3f3f3/444444?text=NA';
                      }}
                    />
                  </div>
                )}
                
                <div className="flex-grow min-w-0">
                  <h4 className="font-medium text-sm truncate dark:text-dm-text">{link.title}</h4>
                  {link.price && (
                    <p className="text-sm font-semibold mt-0.5 dark:text-dm-text">${link.price.toFixed(2)}</p>
                  )}
                  {link.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 dark:text-dm-text-supporting">{link.description}</p>
                  )}
                </div>
              </div>
              
              <div className="mt-2 flex justify-end">
                <Button 
                  size="sm" 
                  className="h-7 gap-1 touch-manipulation"
                  onClick={() => handleProductClick(link.url)}
                >
                  <ExternalLink className="h-3 w-3" />
                  <span className="text-xs">Shop Now</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductLinksList;
