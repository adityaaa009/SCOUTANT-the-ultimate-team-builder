
import { useState, useEffect } from "react";

interface Prompt {
  id: string;
  text: string;
  response: string;
  timestamp: Date;
}

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

export const useScoutData = () => {
  // State management
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [promptCount, setPromptCount] = useState(() => {
    const savedCount = localStorage.getItem("scoutant-prompt-count");
    return savedCount ? parseInt(savedCount, 0) : 0;
  });
  const [playerCards, setPlayerCards] = useState<PlayerCard[]>([]);
  const [mapCards, setMapCards] = useState<MapCard[]>([]);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [promptHistory, setPromptHistory] = useState<Prompt[]>(() => {
    const savedHistory = localStorage.getItem("scoutant-prompt-history");
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const [playerData, setPlayerData] = useState<any[]>([]);
  const [teamRecommendation, setTeamRecommendation] = useState<any>(null);
  const [analysisMode, setAnalysisMode] = useState<"chat" | "direct" | "agent-selection">("chat");

  // Utility functions
  const getRandomNumber = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  const generateRandomPlayerData = () => {
    const playerNames = ["TenZ", "yay", "Asuna", "ShahZaM", "cNed", "ScreaM", "Boaster", "nAts", "Chronicle", "Derke", "Aspas", "Less", "Leo", "s0m", "Zekken"];
    const agents = [
      { name: "JETT", imageUrl: "https://media.valorant-api.com/agents/add6443a-41bd-e414-f6ad-e58d267f4e95/displayicon.png" },
      { name: "RAZE", imageUrl: "https://media.valorant-api.com/agents/f94c3b30-42be-e959-889c-5aa313dba261/displayicon.png" },
      { name: "BREACH", imageUrl: "https://media.valorant-api.com/agents/5f8d3a7f-467b-97f3-062c-13acf203c006/displayicon.png" },
      { name: "OMEN", imageUrl: "https://media.valorant-api.com/agents/8e253930-4c05-31dd-1b6c-968525494517/displayicon.png" },
      { name: "FADE", imageUrl: "https://media.valorant-api.com/agents/dade69b4-4f5a-8528-247b-219e5a1facd6/displayicon.png" },
      { name: "KILLJOY", imageUrl: "https://media.valorant-api.com/agents/1e58de9c-4950-5125-93e9-a0aee9f98746/displayicon.png" },
      { name: "CHAMBER", imageUrl: "https://media.valorant-api.com/agents/22697a3d-45bf-8dd7-4fec-84a9e28c69d7/displayicon.png" },
      { name: "SAGE", imageUrl: "https://media.valorant-api.com/agents/569fdd95-4d10-43ab-ca70-79becc718b46/displayicon.png" }
    ];
    const roles = ["Duelist", "Controller", "Sentinel", "Initiator"];
    
    return Array.from({ length: 5 }, () => {
      const randomAgent = agents[Math.floor(Math.random() * agents.length)];
      let role;
      switch (randomAgent.name) {
        case "JETT":
        case "RAZE":
          role = "Duelist";
          break;
        case "OMEN":
          role = "Controller";
          break;
        case "KILLJOY":
        case "CHAMBER":
        case "SAGE":
          role = "Sentinel";
          break;
        default:
          role = "Initiator";
      }
      
      return {
        name: playerNames[Math.floor(Math.random() * playerNames.length)],
        agent: randomAgent.name,
        role: role,
        kpr: parseFloat((Math.random() * 0.4 + 0.6).toFixed(2)),
        dpr: parseFloat((Math.random() * 0.25 + 0.55).toFixed(2)),
        games: getRandomNumber(200, 1800),
        imageUrl: "/lovable-uploads/e514a8de-14c8-4b5a-85f1-234e923cfb01.png",
        agentImageUrl: randomAgent.imageUrl
      };
    });
  };

  const generateRandomMapData = () => {
    const maps = [
      { name: "ASCENT", imageUrl: "https://media.valorant-api.com/maps/7eaecc1b-4337-bbf6-6ab9-04b8f06b3319/splash.png" },
      { name: "HAVEN", imageUrl: "https://media.valorant-api.com/maps/2c9d57ec-4431-9c5e-2939-8f9ef6dd5cba/splash.png" },
      { name: "SPLIT", imageUrl: "https://media.valorant-api.com/maps/d960549e-485c-e861-8d71-aa9d1aed12a2/splash.png" },
      { name: "BIND", imageUrl: "https://media.valorant-api.com/maps/2c9d57ec-4431-9c5e-2939-8f9ef6dd5cba/splash.png" },
      { name: "ICEBOX", imageUrl: "https://media.valorant-api.com/maps/e2ad5c54-4114-a870-9641-8ea21279579a/splash.png" },
      { name: "BREEZE", imageUrl: "https://media.valorant-api.com/maps/2fb9a4fd-47b8-4e7d-a969-74b4046ebd53/splash.png" },
      { name: "LOTUS", imageUrl: "https://media.valorant-api.com/maps/2fe4ed3a-450a-948b-6d6b-e89a78e680a9/splash.png" }
    ];
    
    const shuffled = [...maps].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3).map((map, index) => ({
      name: map.name,
      rank: `#${index + 1}`,
      imageUrl: map.imageUrl
    }));
  };

  return {
    prompt,
    setPrompt,
    isLoading,
    setIsLoading,
    response,
    setResponse,
    promptCount,
    setPromptCount,
    playerCards,
    setPlayerCards,
    mapCards,
    setMapCards,
    showAuthPrompt,
    setShowAuthPrompt,
    isAuthenticated,
    setIsAuthenticated,
    promptHistory,
    setPromptHistory,
    playerData,
    setPlayerData,
    teamRecommendation,
    setTeamRecommendation,
    analysisMode,
    setAnalysisMode,
    generateRandomPlayerData,
    generateRandomMapData
  };
};
