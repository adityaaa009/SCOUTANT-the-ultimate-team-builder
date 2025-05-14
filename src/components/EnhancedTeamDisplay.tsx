
import React from "react";
import { Card } from "@/components/ui/card";
import { Target, AlertCircle } from "lucide-react";
import { AGENT_ROLES } from "@/lib/agentAnalysis";

interface TeamMember {
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
  analysis?: string; // Added for OpenAI enhanced analysis
}

interface TeamRecommendation {
  success: boolean;
  message?: string;
  lineup?: TeamMember[];
  teamAnalysis?: string; // Added for OpenAI enhanced analysis
  rawAnalysis?: string; // For fallback when parsing fails
}

interface EnhancedTeamDisplayProps {
  recommendation: TeamRecommendation | null;
}

const EnhancedTeamDisplay: React.FC<EnhancedTeamDisplayProps> = ({ recommendation }) => {
  if (!recommendation) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>Submit a player search to see team formation</p>
      </div>
    );
  }

  if (!recommendation.success) {
    return (
      <Card className="p-4 border-red-200 bg-red-50 dark:bg-red-900/20">
        <div className="flex items-center gap-3 text-red-500">
          <AlertCircle className="h-6 w-6" />
          <p className="font-medium">{recommendation.message || "Failed to generate team recommendation"}</p>
        </div>
      </Card>
    );
  }

  // Handle raw analysis fallback
  if (recommendation.rawAnalysis) {
    return (
      <Card className="p-4">
        <pre className="whitespace-pre-wrap text-sm">
          {recommendation.rawAnalysis}
        </pre>
      </Card>
    );
  }

  const lineup = recommendation.lineup || [];

  return (
    <div className="space-y-4">
      {recommendation.teamAnalysis && (
        <Card className="p-4 bg-muted/50">
          <h3 className="font-semibold mb-2">Team Analysis</h3>
          <p className="text-sm">{recommendation.teamAnalysis}</p>
        </Card>
      )}
      
      {lineup.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No valid lineup could be generated from the available data</p>
        </div>
      ) : (
        lineup.map((player, index) => (
          <Card key={index} className="overflow-hidden border-border">
            <div className="flex">
              <div className="w-1/3 bg-card relative p-2">
                <div className="absolute top-2 left-2 bg-black/50 px-2 py-1 text-xs">
                  {player.agent}
                </div>
                <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 text-xs">
                  {player.name}
                </div>
                <div className="h-full flex items-center justify-center">
                  <img 
                    src={`https://media.valorant-api.com/agents/displayname/${player.agent.toLowerCase()}/displayicon.png`}
                    alt={player.agent}
                    className="w-24 h-24 object-contain opacity-90"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                </div>
              </div>
              <div className="w-2/3 p-3">
                <div className="text-sm font-semibold mb-2 flex items-center justify-between">
                  <span>{player.name}</span>
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                    {player.role}
                  </span>
                </div>
                
                {player.analysis && (
                  <div className="text-xs mb-2 p-2 rounded bg-muted/50">
                    <p className="font-semibold mb-1">Analysis:</p>
                    <p className="italic">{player.analysis}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 gap-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs">ACS</span>
                    <span className="text-xs font-bold text-red-500">{player.stats.acs}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs">K:D RATIO</span>
                    <span className="text-xs font-bold text-red-500">{player.stats.kd}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs">ADR</span>
                    <span className="text-xs font-bold text-red-500">{player.stats.adr}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs">KAST</span>
                    <span className="text-xs font-bold text-red-500">{player.stats.kast}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs">CONFIDENCE</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div 
                        className="bg-red-500 h-2.5 rounded-full" 
                        style={{ width: `${player.confidence * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
};

export default EnhancedTeamDisplay;
