
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Users, 
  Search, 
  Send, 
  Target, 
  Gamepad, 
  Mic 
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { auth } from "@/lib/auth";

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

  useEffect(() => {
    // Check authentication status
    setIsAuthenticated(auth.isAuthenticated());
  }, []);

  useEffect(() => {
    localStorage.setItem("scoutant-prompt-count", promptCount.toString());
    
    // Only show auth prompt if not authenticated AND prompt count is 2 or more
    if (promptCount >= 2 && !isAuthenticated) {
      setShowAuthPrompt(true);
    }
  }, [promptCount, isAuthenticated]);

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

  const generateDynamicResponse = (userPrompt: string) => {
    // Create a more dynamic response based on the user's prompt
    const keywords = {
      team: ["composition", "roster", "lineup", "squad", "players"],
      strategy: ["tactics", "approach", "plan", "method", "formation"],
      map: ["map", "maps", "arena", "venue", "location"],
      agent: ["agent", "character", "hero", "operator"],
      tournament: ["tournament", "competition", "championship", "event"]
    };

    const promptLower = userPrompt.toLowerCase();
    
    let responseType = "";
    
    // Determine response type based on keywords
    for (const [key, words] of Object.entries(keywords)) {
      if (words.some(word => promptLower.includes(word))) {
        responseType = key;
        break;
      }
    }
    
    // Default to team if no keywords match
    if (!responseType) responseType = "team";
    
    const responses = {
      team: `Based on your request about "${userPrompt}", I've analyzed recent performance data from VCT International to create an optimal team composition.

Data analysis complete. Creating a balanced roster that complements player strengths...

Here's the recommended lineup:`,
      strategy: `I've evaluated your query: "${userPrompt}" and developed strategic recommendations based on current meta analysis.

Processing tactical data from recent professional matches...

Strategy formation complete. Here are my tactical recommendations:`,
      map: `Analyzing your request: "${userPrompt}" against the current map pool and meta.

Evaluating win rates and composition effectiveness across various maps...

Analysis complete. Here are the optimal maps for your scenario:`,
      agent: `For your query about "${userPrompt}", I've assessed agent performance data across competitive tiers.

Analyzing agent pick rates, win rates and utility effectiveness...

Here are my agent recommendations based on your requirements:`,
      tournament: `Based on your question about "${userPrompt}", I've compiled relevant tournament data.

Analyzing recent competition results and team performances...

Here's what the data reveals about tournament strategies:`
    };
    
    return responses[responseType as keyof typeof responses];
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
    
    // Generate 5 players with random data
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
    
    // Get 3 random maps
    const shuffled = [...maps].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3).map((map, index) => ({
      name: map.name,
      rank: `#${index + 1}`,
      imageUrl: map.imageUrl
    }));
  };

  const handlePromptSubmit = () => {
    if (!prompt.trim()) return;
    
    if (promptCount >= 2 && !isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }
    
    setIsLoading(true);
    
    setPromptCount(prevCount => prevCount + 1);
    
    setTimeout(() => {
      const dynamicResponse = generateDynamicResponse(prompt);
      setResponse(dynamicResponse);
      
      setPlayerCards(generateRandomPlayerData());
      setMapCards(generateRandomMapData());
      
      setIsLoading(false);
    }, 2000);
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
        <Button variant="outline" size="icon" className="rounded-full" asChild>
          <Link to={isAuthenticated ? "/scout" : "/signin"}>
            <Users className="h-5 w-5" />
          </Link>
        </Button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="border-r border-border p-4 flex flex-col items-center">
          <Button variant="ghost" size="icon" asChild>
            <Link to={isAuthenticated ? "/scout" : "/signin"}>
              <Users className="h-5 w-5" />
            </Link>
          </Button>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
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

            {response && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 rounded-full p-2">
                    <Search className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-4 flex-1">
                    <p>{response}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div className="border-t border-border p-4">
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
                  <span>SEND</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="w-96 border-l border-border overflow-y-auto p-4 flex flex-col gap-6">
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
      </div>
    </div>
  );
};

export default Scout;
