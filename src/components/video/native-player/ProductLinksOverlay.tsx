
import React from 'react';
import { cn } from '@/lib/utils';
import { ProductLink } from '@/types/video';
import ProductLinkCard from '../ProductLinkCard';

interface ProductLinksOverlayProps {
  productLinks: ProductLink[];
  visibleProductLink: string | null;
  toggleProductLink: (linkId: string) => void;
}

const ProductLinksOverlay: React.FC<ProductLinksOverlayProps> = ({
  productLinks,
  visibleProductLink,
  toggleProductLink
}) => {
  return (
    <>
      {productLinks.map((link) => (
        <div key={link.id} className={cn(
          "absolute left-0 right-0 bottom-0 z-20 transition-transform duration-300 transform",
          visibleProductLink === link.id ? "translate-y-0" : "translate-y-full"
        )}>
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
