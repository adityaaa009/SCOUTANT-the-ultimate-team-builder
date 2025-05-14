
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Send, Users, Mic } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/components/ui/use-toast";

interface Prompt {
  id: string;
  text: string;
  response: string;
  timestamp: Date;
}

interface ScoutChatInterfaceProps {
  promptHistory: Prompt[];
  prompt: string;
  setPrompt: (prompt: string) => void;
  handlePromptSubmit: () => void;
  isLoading: boolean;
  showAuthPrompt: boolean;
  isAuthenticated: boolean;
}

const ScoutChatInterface: React.FC<ScoutChatInterfaceProps> = ({
  promptHistory,
  prompt,
  setPrompt,
  handlePromptSubmit,
  isLoading,
  showAuthPrompt,
  isAuthenticated
}) => {
  const messageEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && prompt.trim()) {
      e.preventDefault();
      handlePromptSubmit();
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      handlePromptSubmit();
    } else {
      toast({
        title: "Error",
        description: "Please enter a prompt first",
        variant: "destructive"
      });
    }
  };

  // Scroll to bottom when messages change
  React.useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [promptHistory]);

  return (
    <>
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

        {promptHistory.length > 0 && (
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
        
        {promptHistory.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="mx-auto bg-primary/10 rounded-full p-6 w-24 h-24 flex items-center justify-center mb-6">
              <Search className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">SCOUTANT AI Assistant</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Your AI-powered Valorant analyst. Ask about player stats, team compositions, agent recommendations, and more.
            </p>
            <div className="grid gap-4 max-w-md mx-auto">
              {[
                "Who are the best Jett players right now?",
                "Recommend agents for Haven map",
                "Compare TenZ and yay stats",
                "What's the best team composition for Split?"
              ].map((suggestion, index) => (
                <Button 
                  key={index} 
                  variant="outline" 
                  className="justify-start text-left"
                  onClick={() => {
                    setPrompt(suggestion);
                  }}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </motion.div>
        )}
        
        <div ref={messageEndRef} />
      </ScrollArea>

      <div className="border-t border-border p-4 sticky bottom-0 bg-background">
        <form onSubmit={onSubmit} className="relative flex items-center">
          <Mic className="absolute left-4 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about players, teams, agents, or strategies..."
            className="w-full rounded-full bg-card/70 border border-border py-3 pl-12 pr-20 focus:outline-none focus:border-primary transition-all"
            disabled={isLoading}
          />
          <div className="absolute right-2 flex gap-2">
            <Button 
              type="submit"
              disabled={!prompt.trim() || isLoading} 
              size="sm" 
              className={`rounded-full ${prompt.trim() && !isLoading ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-500'}`}
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent border-white"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className={isMobile ? "" : "ml-1"}>
                {isMobile ? "" : (isLoading ? "SENDING..." : "SEND")}
              </span>
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ScoutChatInterface;
