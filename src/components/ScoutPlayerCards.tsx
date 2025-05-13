
import React from "react";
import { Card } from "@/components/ui/card";
import { Target } from "lucide-react";

interface PlayerCard {
  name: string;
  agent: string;
  role: string;
  kpr: number;
  dpr: number;
  games: number;
  imageUrl: string;
  agentImageUrl: string;
}

interface ScoutPlayerCardsProps {
  playerCards: PlayerCard[];
}

const ScoutPlayerCards: React.FC<ScoutPlayerCardsProps> = ({ playerCards }) => {
  return (
    <div>
      <div className="bg-red-500 text-white font-bold px-4 py-2 mb-4 inline-block">
        TEAM FORMATION
      </div>
      <div className="space-y-4">
        {playerCards.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Submit a prompt to see team formation</p>
          </div>
        )}
        {playerCards.map((player, index) => (
          <Card key={index} className="overflow-hidden border-border">
            <div className="flex">
              <div className="w-1/3 bg-card relative">
                <img 
                  src={player.agentImageUrl} 
                  alt={player.agent} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-black/50 px-2 py-1 text-xs">
                  {player.agent}
                </div>
                <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 text-xs">
                  {player.name}
                </div>
              </div>
              <div className="w-2/3 p-3">
                <div className="grid grid-cols-1 gap-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs">KILLS / ROUND</span>
                    <span className="text-xs font-bold text-red-500">{player.kpr}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs">DEATHS / ROUND</span>
                    <span className="text-xs font-bold text-red-500">{player.dpr}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs">GAMES</span>
                    <span className="text-xs font-bold text-red-500">{player.games}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ScoutPlayerCards;
