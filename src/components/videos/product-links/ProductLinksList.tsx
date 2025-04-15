
import React from 'react';
import { ProductLink } from '@/types/video';
import ProductLinkItem from './ProductLinkItem';
import { Swipeable } from '@/components/ui/swipeable';

interface ProductLinksListProps {
  links: ProductLink[];
  isLoading: boolean;
  onDeleteLink: (id: string) => Promise<void>;
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down') => void;
}

const ProductLinksList: React.FC<ProductLinksListProps> = ({ 
  links, 
  isLoading, 
  onDeleteLink,
  onSwipe 
}) => {
  if (isLoading) {
    return <p className="text-center text-muted-foreground">Loading product links...</p>;
  }
  
  if (links.length === 0) {
    return <p className="text-center text-muted-foreground">No product links added yet.</p>;
  }
  
  return (
    <Swipeable onSwipe={onSwipe} className="space-y-3 touch-manipulation w-full">
      {links.map((link) => (
        <ProductLinkItem 
          key={link.id} 
          link={link} 
          onDelete={onDeleteLink} 
        />
      ))}
    </Swipeable>
  );
};

export default ProductLinksList;
