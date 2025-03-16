
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Users, 
  Search, 
  Send, 
  Target, 
  Gamepad, 
  Mic,
  BarChart,
  LogOut,
  PieChart
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "@/lib/auth";
import { useAutoLogout } from "@/hooks/use-auto-logout";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchScoutantResponse } from "@/lib/api";
import PlayerSearchForm from "@/components/PlayerSearchForm";
import EnhancedTeamDisplay from "@/components/EnhancedTeamDisplay";

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

const Scout = () => {
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
  const [teamRecommendation, setTeamRecommendation] = useState<TeamRecommendation | null>(null);
  const [analysisMode, setAnalysisMode] = useState<"chat" | "direct">("chat");
  
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const messageEndRef = useRef<HTMLDivElement>(null);
  
  useAutoLogout();

  useEffect(() => {
    setIsAuthenticated(auth.isAuthenticated());
  }, []);

  useEffect(() => {
    localStorage.setItem("scoutant-prompt-count", promptCount.toString());
    
    if (promptCount >= 2 && !isAuthenticated) {
      setShowAuthPrompt(true);
    }
  }, [promptCount, isAuthenticated]);

  useEffect(() => {
    localStorage.setItem("scoutant-prompt-history", JSON.stringify(promptHistory));
  }, [promptHistory]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [promptHistory]);

  useEffect(() => {
    if (mapCards.length > 0) {
      mapCards.forEach(map => {
        const img = new Image();
        img.src = map.imageUrl;
        img.onload = () => {
          console.log(`Map image loaded: ${map.name}`);
        };
        img.onerror = () => {
          console.error(`Failed to load map image: ${map.name}`);
          toast.error(`Failed to load map image: ${map.name}`);
        };
      });
    }
  }, [mapCards]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && prompt.trim()) {
      handlePromptSubmit();
    }
  };

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

  const handlePromptSubmit = async () => {
    if (!prompt.trim()) return;
    
    if (promptCount >= 2 && !isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }
    
    setIsLoading(true);
    setPromptCount(prevCount => prevCount + 1);
    
    try {
      const newPromptId = Date.now().toString();
      const newPrompt: Prompt = {
        id: newPromptId,
        text: prompt,
        response: "Thinking...",
        timestamp: new Date()
      };
      
      setPromptHistory(prev => [...prev, newPrompt]);
      
      setPrompt("");
      
      // Use the new enhanced API response
      const apiResponse = await fetchScoutantResponse(prompt);
      
      if (apiResponse.error) {
        throw new Error(apiResponse.error);
      }
      
      // Update the response based on the type of response
      let responseText = "";
      
      if (apiResponse.type === "team_composition" && apiResponse.data.success) {
        responseText = `Based on analysis of ${apiResponse.playerNames.join(', ')}, I've identified optimal roles and agents for each player.

Team composition analysis complete. Here's the recommended lineup:`;
        
        setTeamRecommendation(apiResponse.data);
      } else {
        responseText = apiResponse.data;
      }
      
      setTimeout(() => {
        setPromptHistory(prev => 
          prev.map(item => 
            item.id === newPromptId 
              ? { ...item, response: responseText } 
              : item
          )
        );
        
        setResponse(responseText);
        
        const newPlayerCards = generateRandomPlayerData();
        const newMapCards = generateRandomMapData();
        
        setPlayerCards(newPlayerCards);
        setMapCards(newMapCards);
        
        setIsLoading(false);
      }, 1500);
      
    } catch (error) {
      console.error("Error in handlePromptSubmit:", error);
      toast.error("Failed to get response. Please try again.");
      
      setPromptHistory(prev => 
        prev.map(item => 
          item.id === Date.now().toString() 
            ? { ...item, response: "An error occurred while processing your request." } 
            : item
        )
      );
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    auth.logout();
    
    setPromptHistory([]);
    localStorage.removeItem("scoutant-prompt-history");
    
    setPromptCount(0);
    localStorage.removeItem("scoutant-prompt-count");
    
    setPlayerCards([]);
    setMapCards([]);
    setPlayerData([]);
    setTeamRecommendation(null);
    
    toast.success("Logged out successfully");
    navigate('/signin');
  };

  const handlePlayerDataFetched = (data: any[]) => {
    setPlayerData(data);
  };

  const handleTeamRecommendation = (recommendation: TeamRecommendation) => {
    setTeamRecommendation(recommendation);
  };

  const toggleAnalysisMode = () => {
    setAnalysisMode(prev => prev === "chat" ? "direct" : "chat");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link to="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <Search className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold tracking-tight">SCOUTANT</h1>
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="gap-1" 
            onClick={toggleAnalysisMode}
          >
            {analysisMode === "chat" ? <PieChart className="h-4 w-4" /> : <Search className="h-4 w-4" />}
            <span className="hidden sm:inline-block">
              {analysisMode === "chat" ? "Direct Analysis" : "Chat"}
            </span>
          </Button>
          {isAuthenticated && (
            <Button variant="outline" size="icon" className="rounded-full" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          )}
          <Button variant="outline" size="icon" className="rounded-full" asChild>
            <Link to={isAuthenticated ? "/scout" : "/signin"}>
              <Users className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="border-r border-border p-4 flex flex-col items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to={isAuthenticated ? "/scout" : "/signin"}>
              <Users className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link to="/performance">
              <BarChart className="h-5 w-5" />
            </Link>
          </Button>
          {isAuthenticated && (
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          )}
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 p-6">
            {showAuthPrompt && !isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-amber-500 rounded-lg p-6 text-white mb-6"
              >
                <p className="font-semibold mb-2">Free trial limit reached!</p>
                <p className="mb-4">You've used your 2 free prompts. Sign up or sign in to continue using SCOUTANT.</p>
                <div className="flex gap-3">
                  <Button className="bg-white text-amber-500 hover:bg-white/90" asChild>
                    <Link to="/signup">Sign Up</Link>
                  </Button>
                  <Button variant="outline" className="border-white text-white hover:bg-amber-600" asChild>
                    <Link to="/signin">Sign In</Link>
                  </Button>
                </div>
              </motion.div>
            )}

            {analysisMode === "direct" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <PlayerSearchForm 
                  onPlayerDataFetched={handlePlayerDataFetched}
                  onTeamRecommendation={handleTeamRecommendation}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                />
              </motion.div>
            )}

            {analysisMode === "chat" && promptHistory.length > 0 && (
              <div className="space-y-8 mb-4">
                {promptHistory.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className="bg-muted rounded-full p-2 flex-shrink-0">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="mb-1">{item.text}</p>
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 rounded-full p-2 flex-shrink-0">
                        <Search className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="mb-1 whitespace-pre-line">{item.response}</p>
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            
            <div ref={messageEndRef} />
          </ScrollArea>

          {analysisMode === "chat" && (
            <div className="border-t border-border p-4 sticky bottom-0 bg-background">
              <div className="relative flex items-center">
                <Mic className="absolute left-4 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Build the team..."
                  className="w-full rounded-full bg-card/70 border border-border py-3 pl-12 pr-20 focus:outline-none focus:border-primary transition-all"
                />
                <div className="absolute right-2 flex gap-2">
                  <Button 
                    disabled={!prompt.trim() || isLoading} 
                    onClick={handlePromptSubmit}
                    size="sm" 
                    className={`rounded-full ${prompt.trim() ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-500'}`}
                  >
                    <Send className="h-4 w-4" />
                    <span className={isMobile ? "" : "ml-1"}>
                      {isMobile ? "" : "SEND"}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {!isMobile && (
          <div className="w-96 border-l border-border overflow-y-auto p-4 flex flex-col gap-6">
            <div>
              <div className="bg-red-500 text-white font-bold px-4 py-2 mb-4 inline-block">
                TEAM FORMATION
              </div>
              <div className="space-y-4">
                {analysisMode === "direct" ? (
                  <EnhancedTeamDisplay recommendation={teamRecommendation} />
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </div>

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
          </div>
        )}
      </div>
    </div>
  );
};

export default Scout;

