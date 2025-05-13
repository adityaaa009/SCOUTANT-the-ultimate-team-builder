
import React from "react";
import { Card } from "@/components/ui/card";
import { Gamepad } from "lucide-react";
import { toast } from "sonner";

interface MapCard {
  name: string;
  rank: string;
  imageUrl: string;
}

interface ScoutMapCardsProps {
  mapCards: MapCard[];
}

const ScoutMapCards: React.FC<ScoutMapCardsProps> = ({ mapCards }) => {
  return (
    <div>
      <div className="bg-red-500 text-white font-bold px-4 py-2 mb-4 inline-block">
        TOP MAPS
      </div>
      <div className="grid grid-cols-1 gap-4">
        {mapCards.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Gamepad className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Submit a prompt to see top maps</p>
          </div>
        )}
        {mapCards.map((map, index) => (
          <Card key={index} className="relative overflow-hidden h-32">
            <img 
              src={map.imageUrl} 
              alt={map.name}
              className="absolute inset-0 w-full h-full object-cover"
              loading="eager"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg";
                toast.error(`Failed to load map image: ${map.name}`);
              }}
            />
            <div className="absolute inset-0 bg-black/50 flex justify-center items-center">
              <span className="text-xl font-bold text-white">{map.name}</span>
            </div>
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-sm font-bold">
              {map.rank}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ScoutMapCards;
