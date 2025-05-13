
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import ScoutPlayerCards from "./ScoutPlayerCards";
import ScoutMapCards from "./ScoutMapCards";
import EnhancedTeamDisplay from "./EnhancedTeamDisplay";

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

interface MapCard {
  name: string;
  rank: string;
  imageUrl: string;
}

interface TeamRecommendation {
  success: boolean;
  message?: string;
  lineup?: Array<{
    name: string;
    agent: string;
    role: string;
    confidence: number;
    stats: {
      acs: number;
      kd: number;
      adr: number;
      kast: string;
    }
  }>;
}

interface ScoutSidePanelProps {
  playerCards: PlayerCard[];
  mapCards: MapCard[];
  teamRecommendation: TeamRecommendation | null;
  analysisMode: "chat" | "direct" | "agent-selection";
}

const ScoutSidePanel: React.FC<ScoutSidePanelProps> = ({ 
  playerCards,
  mapCards,
  teamRecommendation,
  analysisMode
}) => {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return null;
  }
  
  return (
    <div className="w-96 border-l border-border overflow-y-auto p-4 flex flex-col gap-6">
      <div>
        {analysisMode === "direct" ? (
          <EnhancedTeamDisplay recommendation={teamRecommendation} />
        ) : (
          <ScoutPlayerCards playerCards={playerCards} />
        )}
      </div>
      
      <ScoutMapCards mapCards={mapCards} />
    </div>
  );
};

export default ScoutSidePanel;
