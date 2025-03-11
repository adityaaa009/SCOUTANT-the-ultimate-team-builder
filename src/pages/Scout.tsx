import React, { useState } from "react";
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

  const playerCards: PlayerCard[] = [
    {
      name: "S0M",
      agent: "OMEN",
      role: "Controller",
      kpr: 0.77,
      dpr: 0.68,
      games: 215,
      imageUrl: "/lovable-uploads/e514a8de-14c8-4b5a-85f1-234e923cfb01.png",
      agentImageUrl: "https://media.valorant-api.com/agents/8e253930-4c05-31dd-1b6c-968525494517/displayicon.png"
    },
    {
      name: "LEO",
      agent: "FADE",
      role: "Initiator",
      kpr: 0.73,
      dpr: 0.58,
      games: 818,
      imageUrl: "/lovable-uploads/e514a8de-14c8-4b5a-85f1-234e923cfb01.png",
      agentImageUrl: "https://media.valorant-api.com/agents/dade69b4-4f5a-8528-247b-219e5a1facd6/displayicon.png"
    },
    {
      name: "LESS",
      agent: "KILLJOY",
      role: "Sentinel",
      kpr: 0.73,
      dpr: 0.63,
      games: 957,
      imageUrl: "/lovable-uploads/e514a8de-14c8-4b5a-85f1-234e923cfb01.png",
      agentImageUrl: "https://media.valorant-api.com/agents/1e58de9c-4950-5125-93e9-a0aee9f98746/displayicon.png"
    },
    {
      name: "ASPAS",
      agent: "RAZE",
      role: "Duelist",
      kpr: 0.9,
      dpr: 0.65,
      games: 1736,
      imageUrl: "/lovable-uploads/e514a8de-14c8-4b5a-85f1-234e923cfb01.png",
      agentImageUrl: "https://media.valorant-api.com/agents/f94c3b30-42be-e959-889c-5aa313dba261/displayicon.png"
    },
    {
      name: "ZEKKEN",
      agent: "JETT",
      role: "Duelist",
      kpr: 0.88,
      dpr: 0.74,
      games: 1650,
      imageUrl: "/lovable-uploads/e514a8de-14c8-4b5a-85f1-234e923cfb01.png",
      agentImageUrl: "https://media.valorant-api.com/agents/add6443a-41bd-e414-f6ad-e58d267f4e95/displayicon.png"
    }
  ];

  const mapCards: MapCard[] = [
    {
      name: "ASCENT",
      rank: "#1",
      imageUrl: "https://media.valorant-api.com/maps/7eaecc1b-4337-bbf6-6ab9-04b8f06b3319/splash.png"
    },
    {
      name: "HAVEN",
      rank: "#2",
      imageUrl: "https://media.valorant-api.com/maps/2c9d57ec-4431-9c5e-2939-8f9ef6dd5cba/splash.png"
    },
    {
      name: "SPLIT",
      rank: "#3",
      imageUrl: "https://media.valorant-api.com/maps/d960549e-485c-e861-8d71-aa9d1aed12a2/splash.png"
    }
  ];

  const handlePromptSubmit = () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    
    // Simulate AI response
    setTimeout(() => {
      setResponse(`Certainly! I'll build a team using players from VCT International, assign roles, and explain the
composition's effectiveness. Let's begin by retrieving the necessary data and analyzing it.

Data Retrieval...
Data Retrieval...
Team Composition...
Analysis...
Strategy Development...

Based on the team composition I've selected, I'll now save it to the database for future
reference.

Based on the data from VCT International, I've assembled a balanced and competitive team
composition. Here's the lineup with assigned roles and explanations for their effectiveness:

1. s0m (Controller - Omen, IGL)
2. Leo (Initiator - Fade)
3. Less (Sentinel - Killjoy)
4. Aspas (Duelist - Raze)
5. Zekken (Duelist - Jett)

This team composition would be highly effective in a competitive match for the following
reasons:

1. Balanced Roles: The team has a good mix of agents covering all essential roles -
controller for smokes, initiator for intel, sentinel for site anchoring, and duelists for entry.`);
      
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-border py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Search className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">SCOUTANT</h1>
        </div>
        <Button variant="outline" size="icon" className="rounded-full">
          <Users className="h-5 w-5" />
        </Button>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Toggle */}
        <div className="border-r border-border p-4 flex flex-col items-center">
          <Button variant="ghost" size="icon">
            <Users className="h-5 w-5" />
          </Button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Prompt Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500 rounded-lg p-6 text-white mb-6"
            >
              <p>Build a team using only players from VCT International
                 Assign roles to each player and explain why this
                 composition would be effective in a competitive match.</p>
            </motion.div>

            {/* Response */}
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

          {/* Input Area */}
          <div className="border-t border-border p-4">
            <div className="relative flex items-center">
              <Mic className="absolute left-4 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
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

        {/* Right Sidebar */}
        <div className="w-96 border-l border-border overflow-y-auto p-4 flex flex-col gap-6">
          {/* Team Formation Section */}
          <div>
            <div className="bg-red-500 text-white font-bold px-4 py-2 mb-4 inline-block">
              TEAM FORMATION
            </div>
            <div className="space-y-4">
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

          {/* Top Maps Section */}
          <div>
            <div className="bg-red-500 text-white font-bold px-4 py-2 mb-4 inline-block">
              TOP MAPS
            </div>
            <div className="grid grid-cols-1 gap-4">
              {mapCards.map((map, index) => (
                <Card key={index} className="relative overflow-hidden h-32">
                  <img 
                    src={map.imageUrl} 
                    alt={map.name}
                    className="absolute inset-0 w-full h-full object-cover"
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
