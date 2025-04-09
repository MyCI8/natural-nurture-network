
import React, { useState, useEffect } from 'react';
import { X, ExternalLink, ShoppingCart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProductLink } from '@/types/video';

interface ProductLinkCardProps {
  link: ProductLink;
  onClose: () => void;
}

const ProductLinkCard: React.FC<ProductLinkCardProps> = ({ link, onClose }) => {
  const [productMetadata, setProductMetadata] = useState<{
    title: string;
    price?: number;
    imageUrl?: string;
    description?: string;
  }>({
    title: link.title,
    price: link.price || undefined,
    imageUrl: link.image_url || undefined,
    description: undefined
  });

  useEffect(() => {
    // Use the image_url from the link if available
    if (link.image_url) {
      setProductMetadata(prev => ({
        ...prev,
        imageUrl: link.image_url
      }));
    } else if (link.url.includes('amazon.com') || link.url.includes('a.co') || link.url.includes('amzn.to')) {
      // Generate a placeholder image based on the product title
      const placeholderImage = `https://via.placeholder.com/200x200/f0f0f0/404040?text=${encodeURIComponent(link.title.substring(0, 10))}`;
      
      setProductMetadata(prev => ({
        ...prev,
        imageUrl: placeholderImage,
        description: "This is a product available on Amazon. Click to learn more and purchase."
      }));
    }
  }, [link]);

  const handleProductClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Log the click for analytics
    console.log(`Product link clicked: ${link.id}`);
    // Open the product in a new tab
    window.open(link.url, '_blank');
  };

  return (
    <Card className="rounded-t-lg rounded-b-none border-t border-x border-b-0 shadow-up bg-card/95 backdrop-blur-sm touch-manipulation">
      <CardContent className="p-3">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-sm flex items-center gap-1">
            <ShoppingCart className="h-3.5 w-3.5" />
            Featured Product
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="h-6 w-6 p-0 touch-manipulation"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex touch-manipulation" onClick={handleProductClick}>
          {productMetadata.imageUrl && (
            <div className="w-16 h-16 flex-shrink-0 mr-3">
              <img 
                src={productMetadata.imageUrl} 
                alt={productMetadata.title} 
                className="w-full h-full object-contain rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200/f3f3f3/444444?text=NA';
                }}
              />
            </div>
          )}
          
          <div className="flex-grow min-w-0">
            <h4 className="font-medium text-sm truncate">{productMetadata.title}</h4>
            {productMetadata.price && (
              <p className="text-sm font-semibold mt-0.5">${productMetadata.price.toFixed(2)}</p>
            )}
            {productMetadata.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{productMetadata.description}</p>
            )}
          </div>
        </div>
        
        <div className="mt-2 flex justify-end">
          <Button 
            size="sm" 
            className="h-8 gap-1 touch-manipulation"
            onClick={handleProductClick}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="text-xs">Buy on Amazon</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductLinkCard;
