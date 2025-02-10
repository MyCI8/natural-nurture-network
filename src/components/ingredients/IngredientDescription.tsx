
interface IngredientDescriptionProps {
  fullDescription: string | null;
  imageUrl: string | null;
  name: string;
}

export const IngredientDescription = ({ 
  fullDescription, 
  imageUrl, 
  name 
}: IngredientDescriptionProps) => {
  return (
    <div className="space-y-6">
      {imageUrl && (
        <div className="mb-6">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-64 object-cover rounded-lg"
          />
        </div>
      )}

      {fullDescription && (
        <div className="prose max-w-none">
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <div dangerouslySetInnerHTML={{ __html: fullDescription }} />
        </div>
      )}
    </div>
  );
};
