
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Gamepad } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AgentRecommendation {
  agent: string;
  role: string;
  map_effectiveness: number;
  reason: string;
}

interface AgentSelectionResponse {
  success: boolean;
  recommendations: AgentRecommendation[];
  strategyNotes: string;
  error?: string;
}

const VALORANT_MAPS = [
  "Ascent", "Bind", "Breeze", "Haven", "Icebox", 
  "Split", "Fracture", "Pearl", "Lotus", "Sunset"
];

const AgentSelectionAdvisor: React.FC = () => {
  const [selectedMap, setSelectedMap] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [recommendations, setRecommendations] = useState<AgentSelectionResponse | null>(null);
  
  const handleGetRecommendations = async () => {
    if (!selectedMap) {
      toast.error("Please select a map first");
      return;
    }
    
    setIsLoading(true);
    setRecommendations(null);
    
    try {
      const response = await supabase.functions.invoke("scoutant-ai", {
        body: {
          action: "agent_selection",
          data: { map: selectedMap }
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      setRecommendations(response.data);
      toast.success(`Agent recommendations for ${selectedMap} ready!`);
    } catch (error) {
      console.error("Error getting agent recommendations:", error);
      toast.error("Failed to get agent recommendations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="text-lg font-bold mb-3">Agent Selection Advisor</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="map-select">Select Map</Label>
            <Select 
              value={selectedMap} 
              onValueChange={(value) => setSelectedMap(value)}
            >
              <SelectTrigger id="map-select">
                <SelectValue placeholder="Choose a map" />
              </SelectTrigger>
              <SelectContent>
                {VALORANT_MAPS.map((map) => (
                  <SelectItem key={map} value={map}>{map}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleGetRecommendations}
            disabled={isLoading || !selectedMap}
            className="w-full bg-red-500 hover:bg-red-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Map Meta...
              </>
            ) : (
              <>
                <Gamepad className="mr-2 h-4 w-4" />
                Get Agent Recommendations
              </>
            )}
          </Button>
        </div>
      </Card>
      
      {recommendations && (
        <Card className="p-4">
          <h3 className="text-lg font-bold mb-3">Recommendations for {selectedMap}</h3>
          <div className="mb-4 p-3 bg-muted rounded-md">
            <p className="text-sm italic">{recommendations.strategyNotes}</p>
          </div>
          
          <div className="space-y-3">
            {recommendations.recommendations.map((rec, index) => (
              <Card key={index} className="p-3 border-l-4" style={{ borderLeftColor: getColorForRole(rec.role) }}>
                <div className="flex justify-between items-center mb-2">
                  <div className="font-bold">{rec.agent}</div>
                  <div className="text-sm px-2 py-1 rounded-full bg-muted">{rec.role}</div>
                </div>
                <div className="text-sm mb-2">{rec.reason}</div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                  <div 
                    className="bg-red-500 h-1.5 rounded-full" 
                    style={{ width: `${rec.map_effectiveness * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-right mt-1">
                  Map Effectiveness: {(rec.map_effectiveness * 100).toFixed(0)}%
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

function getColorForRole(role: string): string {
  switch (role.toLowerCase()) {
    case "duelist":
      return "#ff4655"; // Red
    case "controller":
      return "#00d8ff"; // Blue
    case "sentinel":
      return "#c8ff00"; // Yellow-green
    case "initiator":
      return "#ff9c00"; // Orange
    default:
      return "#98b1c4"; // Grey-blue
  }
}

export default AgentSelectionAdvisor;
