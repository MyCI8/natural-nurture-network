import { Card, CardContent } from "@/components/ui/card";

interface RemedyCardProps {
  id: string;
  name: string;
  summary: string;
  imageUrl: string;
  onClick: (id: string) => void;
}

const RemedyCard = ({ id, name, summary, imageUrl, onClick }: RemedyCardProps) => {
  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow duration-300 animate-fadeIn cursor-pointer"
      onClick={() => onClick(id)}
    >
      <CardContent className="p-0">
        <div className="h-48">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-text mb-2">
            {name}
          </h3>
          <p className="text-text-light text-sm">
            {summary}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RemedyCard;