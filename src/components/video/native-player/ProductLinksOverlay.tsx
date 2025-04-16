
import React from 'react';
import { cn } from '@/lib/utils';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductLink } from '@/types/video';
import ProductLinkCard from '../ProductLinkCard';

interface ProductLinksOverlayProps {
  productLinks: ProductLink[];
  visibleProductLink: string | null;
  toggleProductLink: (linkId: string) => void;
  disabled?: boolean;
}

const ProductLinksOverlay: React.FC<ProductLinksOverlayProps> = ({
  productLinks,
  visibleProductLink,
  toggleProductLink,
  disabled = false
}) => {
  if (productLinks.length === 0) return null;

  return (
    <>
      {/* Product button */}
      {!disabled && (
        <div className="absolute top-3 left-3 z-10">
          <Button
            variant="ghost"
            size="sm"
            className="bg-black/30 hover:bg-black/50 text-white p-2 h-auto touch-manipulation"
            onClick={(e) => {
              e.stopPropagation();
              toggleProductLink(productLinks[0].id);
            }}
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            <span className="text-xs">Products</span>
          </Button>
        </div>
      )}

      {/* Product cards */}
      {productLinks.map((link) => (
        <div key={link.id} 
          className={cn(
            "absolute left-0 right-0 bottom-0 z-10 transition-transform duration-300 transform",
            visibleProductLink === link.id ? "translate-y-0" : "translate-y-full"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <ProductLinkCard 
            link={link} 
            onClose={() => toggleProductLink(link.id)} 
          />
        </div>
      ))}
    </>
  );
};

export default ProductLinksOverlay;
