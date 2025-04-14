
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, ExternalLink } from 'lucide-react';
import { ProductLink } from '@/types/video';

interface ProductLinkItemProps {
  link: ProductLink;
  onDelete: (id: string) => Promise<void>;
}

const ProductLinkItem: React.FC<ProductLinkItemProps> = ({ link, onDelete }) => {
  return (
    <Card key={link.id} className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-start gap-3">
            {link.image_url ? (
              <div className="w-14 h-14 flex-shrink-0">
                <img 
                  src={link.image_url} 
                  alt={link.title} 
                  className="w-full h-full object-contain rounded border dark:border-dm-mist"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200/f3f3f3/444444?text=NA';
                  }}
                />
              </div>
            ) : (
              <div className="w-14 h-14 flex-shrink-0 bg-gray-100 dark:bg-dm-mist rounded border dark:border-dm-mist flex items-center justify-center text-xs text-gray-500">
                No image
              </div>
            )}
            <div className="flex-grow min-w-0">
              <h4 className="font-medium">{link.title}</h4>
              <p className="text-sm text-muted-foreground truncate">{link.url}</p>
              {link.price && (
                <p className="text-sm mt-1">${link.price.toFixed(2)}</p>
              )}
              {link.description && (
                <p className="text-xs text-muted-foreground mt-1 truncate">{link.description}</p>
              )}
            </div>
          </div>
          <div className="flex">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.open(link.url, '_blank')}
              className="h-8 w-8 touch-manipulation"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(link.id)}
              className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10 touch-manipulation"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductLinkItem;
