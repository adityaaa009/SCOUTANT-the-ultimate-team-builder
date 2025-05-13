
import React, { useEffect } from "react";
import { useAutoLogout } from "@/hooks/use-auto-logout";
import { auth } from "@/lib/auth";
import { useScoutData } from "@/hooks/useScoutData";
import { useScoutActions } from "@/hooks/useScoutActions";

import ScoutHeader from "@/components/ScoutHeader";
import ScoutSidebar from "@/components/ScoutSidebar";
import ScoutChatInterface from "@/components/ScoutChatInterface";
import ScoutSidePanel from "@/components/ScoutSidePanel";
import PlayerSearchForm from "@/components/PlayerSearchForm";
import AgentSelectionAdvisor from "@/components/AgentSelectionAdvisor";

import { motion } from "framer-motion";

const Scout = () => {
  // Get state from custom hooks
  const {
    prompt,
    setPrompt,
    isLoading,
    setIsLoading,
    promptCount,
    setPromptCount,
    playerCards, 
    mapCards,
    showAuthPrompt,
    setShowAuthPrompt,
    isAuthenticated,
    setIsAuthenticated,
    promptHistory,
    setPromptHistory,
    playerData,
    teamRecommendation,
    analysisMode,
    setAnalysisMode
  } = useScoutData();
  
  // Get actions from custom hooks
  const {
    handlePromptSubmit,
    handleLogout,
    handlePlayerDataFetched,
    handleTeamRecommendation
  } = useScoutActions();
  
  useAutoLogout();

  // Effects
  useEffect(() => {
    setIsAuthenticated(auth.isAuthenticated());
  }, [setIsAuthenticated]);

  useEffect(() => {
    localStorage.setItem("scoutant-prompt-count", promptCount.toString());
    
    if (promptCount >= 2 && !isAuthenticated) {
      setShowAuthPrompt(true);
    }
  }, [promptCount, isAuthenticated, setShowAuthPrompt]);

  useEffect(() => {
    localStorage.setItem("scoutant-prompt-history", JSON.stringify(promptHistory));
  }, [promptHistory]);

  useEffect(() => {
    if (mapCards.length > 0) {
      mapCards.forEach(map => {
        const img = new Image();
        img.src = map.imageUrl;
        img.onload = () => {
          console.log(`Map image loaded: ${map.name}`);
        };
      });
    }
  }, [mapCards]);

  // Toggle analysis mode
  const toggleAnalysisMode = (mode: "chat" | "direct" | "agent-selection") => {
    setAnalysisMode(mode);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <ScoutHeader 
        isAuthenticated={isAuthenticated} 
        analysisMode={analysisMode}
        onToggleAnalysisMode={toggleAnalysisMode}
        onLogout={handleLogout}
      />

      <div className="flex flex-1 overflow-hidden">
        <ScoutSidebar 
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          {analysisMode === "direct" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-6"
            >
              <PlayerSearchForm 
                onPlayerDataFetched={handlePlayerDataFetched}
                onTeamRecommendation={handleTeamRecommendation}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            </motion.div>
          )}

          {analysisMode === "agent-selection" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-6"
            >
              <AgentSelectionAdvisor />
            </motion.div>
          )}

          {analysisMode === "chat" && (
            <ScoutChatInterface
              promptHistory={promptHistory}
              prompt={prompt}
              setPrompt={setPrompt}
              handlePromptSubmit={handlePromptSubmit}
              isLoading={isLoading}
              showAuthPrompt={showAuthPrompt}
              isAuthenticated={isAuthenticated}
            />
          )}
        </div>

        <ScoutSidePanel 
          playerCards={playerCards}
          mapCards={mapCards}
          teamRecommendation={teamRecommendation}
          analysisMode={analysisMode}
        />
      </div>
    </div>
  );
};

export default Scout;
