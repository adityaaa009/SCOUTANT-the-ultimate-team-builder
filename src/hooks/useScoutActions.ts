import { useState, useCallback } from "react";
import { toast } from "sonner";
import { auth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { fetchScoutantResponse } from "@/lib/api";
import { useScoutData } from "./useScoutData";

export const useScoutActions = () => {
  const navigate = useNavigate();
  const {
    prompt,
    setPrompt,
    isLoading,
    setIsLoading,
    setResponse,
    promptCount,
    setPromptCount,
    setPlayerCards,
    setMapCards,
    showAuthPrompt,
    isAuthenticated,
    promptHistory,
    setPromptHistory,
    setTeamRecommendation,
    generateRandomPlayerData,
    generateRandomMapData
  } = useScoutData();

  const handlePromptSubmit = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt first");
      return;
    }
    
    if (promptCount >= 2 && !isAuthenticated) {
      toast.error("Free trial limit reached. Please sign in to continue.");
      return;
    }
    
    setIsLoading(true);
    setPromptCount(prevCount => prevCount + 1);
    
    try {
      console.log("Submitting prompt:", prompt);
      const newPromptId = Date.now().toString();
      const newPrompt = {
        id: newPromptId,
        text: prompt,
        response: "Thinking...",
        timestamp: new Date()
      };
      
      setPromptHistory(prev => [...prev, newPrompt]);
      
      // Clear input field
      setPrompt("");
      
      const apiResponse = await fetchScoutantResponse(prompt);
      console.log("API response:", apiResponse);
      
      if (apiResponse.error) {
        throw new Error(apiResponse.error);
      }
      
      let responseText = "";
      
      if (apiResponse.type === "team_composition" && apiResponse.data && apiResponse.data.success) {
        responseText = `Based on analysis of ${apiResponse.playerNames.join(', ')}, I've identified optimal roles and agents for each player.

Team composition analysis complete. Here's the recommended lineup:`;
        
        setTeamRecommendation(apiResponse.data);
      } else if (apiResponse.type === "agent_selection" && apiResponse.data && apiResponse.data.success) {
        responseText = `Based on your query about agents for ${apiResponse.mapName}, I've analyzed the current meta and map strategies.

Here are my agent recommendations for ${apiResponse.mapName}:

${apiResponse.data.recommendations.map((rec: any) => 
  `- ${rec.agent} (${rec.role}): ${rec.reason}`
).join('\n\n')}

Strategy Notes: ${apiResponse.data.strategyNotes}`;
      } else if (apiResponse.type === "text_response") {
        // For predefined responses, display the content directly
        responseText = apiResponse.content || apiResponse.data;
      } else if (apiResponse.type === "error") {
        responseText = `Error: ${apiResponse.data}`;
      } else {
        responseText = "I couldn't process that request. Please try again with a different query.";
      }
      
      console.log("Setting response text:", responseText.substring(0, 100) + "...");
      
      setTimeout(() => {
        // Update the prompt history with the response
        setPromptHistory(prev => 
          prev.map(item => 
            item.id === newPromptId 
              ? { ...item, response: responseText } 
              : item
          )
        );
        
        setResponse(responseText);
        
        // Generate random data for demo purposes
        const newPlayerCards = generateRandomPlayerData();
        const newMapCards = generateRandomMapData();
        
        setPlayerCards(newPlayerCards);
        setMapCards(newMapCards);
        
        setIsLoading(false);
        
        console.log("Prompt processing complete");
      }, 1000);
      
    } catch (error) {
      console.error("Error in handlePromptSubmit:", error);
      toast.error("Failed to get response. Please try again.");
      
      setPromptHistory(prev => 
        prev.map(item => 
          item.text === prompt
            ? { ...item, response: "An error occurred while processing your request." } 
            : item
        )
      );
      setIsLoading(false);
    }
  };

  const handleLogout = useCallback(() => {
    auth.logout();
    
    setPromptHistory([]);
    localStorage.removeItem("scoutant-prompt-history");
    
    setPromptCount(0);
    localStorage.removeItem("scoutant-prompt-count");
    
    setPlayerCards([]);
    setMapCards([]);
    setTeamRecommendation(null);
    
    toast.success("Logged out successfully");
    navigate('/signin');
  }, [navigate, setPromptHistory, setPromptCount, setPlayerCards, setMapCards, setTeamRecommendation]);

  const handlePlayerDataFetched = useCallback((data: any[]) => {
    // Handle player data being fetched
  }, []);

  const handleTeamRecommendation = useCallback((recommendation: any) => {
    setTeamRecommendation(recommendation);
  }, [setTeamRecommendation]);

  const toggleAnalysisMode = useCallback((mode: "chat" | "direct" | "agent-selection") => {
    // Handle toggling analysis mode
  }, []);

  return {
    handlePromptSubmit,
    handleLogout,
    handlePlayerDataFetched,
    handleTeamRecommendation,
    toggleAnalysisMode
  };
};
