
import React, { useEffect, useState } from 'react';
import { ProductLink } from '@/types/video';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ProductLinksPanel = () => {
  const [productLinks, setProductLinks] = useState<ProductLink[]>([]);

  useEffect(() => {
    // Listen for the display-product-links event
    const handleDisplayProductLinks = (event: CustomEvent) => {
      if (event.detail && event.detail.productLinks) {
        setProductLinks(event.detail.productLinks);
      }
    };

    // Listen for the clear-product-links event
    const handleClearProductLinks = () => {
      setProductLinks([]);
    };

    // Add event listeners
    window.addEventListener('display-product-links', handleDisplayProductLinks as EventListener);
    window.addEventListener('clear-product-links', handleClearProductLinks);

    // Clean up
    return () => {
      window.removeEventListener('display-product-links', handleDisplayProductLinks as EventListener);
      window.removeEventListener('clear-product-links', handleClearProductLinks);
    };
  }, []);

  if (productLinks.length === 0) {
    return null;
  }

  return (
    <div className="p-4 mb-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
      <h3 className="font-semibold mb-3 text-foreground">Featured Products</h3>
      <div className="space-y-3">
        {productLinks.map((link) => (
          <div 
            key={link.id}
            className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3"
          >
            <div className="flex items-center mb-2">
              {link.image_url && (
                <img 
                  src={link.image_url} 
                  alt={link.title} 
                  className="w-12 h-12 object-cover rounded mr-3"
                />
              )}
              <div>
                <h4 className="font-medium text-sm text-foreground">{link.title}</h4>
                {link.price && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ${link.price.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
            
            {link.description && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                {link.description}
              </p>
            )}
            
            <div className="text-right">
              <Button 
                size="sm" 
                className="h-8 text-xs gap-1"
                onClick={() => window.open(link.url, '_blank')}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>View Product</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductLinksPanel;
