
import React from 'react';
import { useProductLinks } from '@/hooks/video/useProductLinks';
import ProductLinkForm from './product-links/ProductLinkForm';
import ProductLinksList from './product-links/ProductLinksList';
import { supabase } from '@/integrations/supabase/client';

interface ProductLinksEditorProps {
  videoId: string;
}

const ProductLinksEditor: React.FC<ProductLinksEditorProps> = ({ videoId }) => {
  const { links, isLoading, addProductLink, deleteProductLink } = useProductLinks(videoId);

  return (
    <div className="space-y-6">
      <ProductLinkForm onAddLink={addProductLink} />

      <div>
        <h3 className="text-lg font-medium mb-4">Existing Product Links</h3>
        <ProductLinksList 
          links={links}
          isLoading={isLoading}
          onDeleteLink={deleteProductLink}
        />
      </div>
    </div>
  );
};

export default ProductLinksEditor;
