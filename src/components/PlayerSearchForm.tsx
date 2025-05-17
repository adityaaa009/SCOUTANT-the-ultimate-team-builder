
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Users } from "lucide-react";
import { toast } from "sonner";
import { fetchMultiplePlayersData } from "@/lib/vlrDataFetcher";
import { recommendTeamComposition } from "@/lib/playerAnalysis";

interface PlayerSearchFormProps {
  onPlayerDataFetched: (data: any) => void;
  onTeamRecommendation: (data: any) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const PlayerSearchForm: React.FC<PlayerSearchFormProps> = ({ 
  onPlayerDataFetched, 
  onTeamRecommendation,
  isLoading,
  setIsLoading
}) => {
  const [playerNames, setPlayerNames] = useState("");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!playerNames.trim()) {
      toast.error("Please enter at least one player name");
      return;
    }
    
    const names = playerNames.split(',').map(name => name.trim()).filter(Boolean);
    
    if (names.length === 0) {
      toast.error("Please enter valid player names");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Ensure we have at least 5 player names by duplicating if needed
      let processedNames = [...names];
      while (processedNames.length < 5) {
        processedNames = [...processedNames, ...names].slice(0, 5);
      }
      
      const playersData = await fetchMultiplePlayersData(processedNames);
      onPlayerDataFetched(playersData);
      
      if (playersData.length > 0) {
        try {
          // First try the local recommendation
          const recommendation = recommendTeamComposition(playersData);
          
          // If local recommendation fails or doesn't have enough data, try the API
          if (!recommendation.success || !recommendation.lineup || recommendation.lineup.length < 5) {
            await fetchAITeamRecommendation(processedNames, playersData);
          } else {
            onTeamRecommendation(recommendation);
            toast.success(`Team composition analyzed based on ${names.length} player(s)`);
          }
        } catch (error) {
          // If local fails, try the API
          await fetchAITeamRecommendation(processedNames, playersData);
        }
      } else {
        toast.error("No player data found. Try different player names.");
      }
    } catch (error) {
      console.error("Error fetching player data:", error);
      toast.error("Failed to fetch player data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to fetch AI-based team recommendation from the Supabase function
  const fetchAITeamRecommendation = async (names: string[], playersData: any[]) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/scoutant-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          action: 'analyze_players',
          data: {
            players: playersData.map(p => ({
              name: p.name,
              stats: p.stats
            }))
          }
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        onTeamRecommendation(data);
        toast.success(`Team composition analyzed based on ${names.length} player(s)`);
      } else {
        throw new Error(data.message || "Failed to analyze team composition");
      }
    } catch (error) {
      console.error("Error in AI recommendation:", error);
      toast.error("Failed to generate AI team recommendation. Using basic analysis instead.");
      
      // Use local recommendation as fallback
      const recommendation = recommendTeamComposition(playersData);
      onTeamRecommendation(recommendation);
    }
  };
  
  return (
    <Card className="p-4 mb-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col space-y-2">
          <label htmlFor="player-names" className="text-sm font-medium">
            Search Professional Players
          </label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="player-names"
              placeholder="Enter player names (comma-separated)"
              value={playerNames}
              onChange={(e) => setPlayerNames(e.target.value)}
              className="pl-8"
              disabled={isLoading}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Example: TenZ, Asuna, ScreaM, cNed, nAts
          </p>
        </div>
        
        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-red-500 hover:bg-red-600"
        >
          <Users className="mr-2 h-4 w-4" />
          {isLoading ? "Analyzing Players..." : "Analyze Player Data"}
        </Button>
      </form>
    </Card>
  );
};

export default PlayerSearchForm;
