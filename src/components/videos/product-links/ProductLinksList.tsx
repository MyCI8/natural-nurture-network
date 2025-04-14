
import React from 'react';
import { ProductLink } from '@/types/video';
import ProductLinkItem from './ProductLinkItem';

interface ProductLinksListProps {
  links: ProductLink[];
  isLoading: boolean;
  onDeleteLink: (id: string) => Promise<void>;
}

const ProductLinksList: React.FC<ProductLinksListProps> = ({ links, isLoading, onDeleteLink }) => {
  if (isLoading) {
    return <p className="text-center text-muted-foreground">Loading product links...</p>;
  }
  
  if (links.length === 0) {
    return <p className="text-center text-muted-foreground">No product links added yet.</p>;
  }
  
  return (
    <div className="space-y-3">
      {links.map((link) => (
        <ProductLinkItem 
          key={link.id} 
          link={link} 
          onDelete={onDeleteLink} 
        />
      ))}
    </div>
  );
};

export default ProductLinksList;
