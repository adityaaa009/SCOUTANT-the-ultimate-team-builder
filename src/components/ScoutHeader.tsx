
import React from "react";
import { Button } from "@/components/ui/button";
import { Search, LogOut, PieChart, ListFilter, Users } from "lucide-react";
import { Link } from "react-router-dom";

interface ScoutHeaderProps {
  isAuthenticated: boolean;
  analysisMode: "chat" | "direct" | "agent-selection";
  onToggleAnalysisMode: (mode: "chat" | "direct" | "agent-selection") => void;
  onLogout: () => void;
}

const ScoutHeader: React.FC<ScoutHeaderProps> = ({
  isAuthenticated,
  analysisMode,
  onToggleAnalysisMode,
  onLogout
}) => {
  return (
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
          variant={analysisMode === "chat" ? "default" : "outline"} 
          size="sm"
          className="gap-1" 
          onClick={() => onToggleAnalysisMode("chat")}
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline-block">AI Chat</span>
        </Button>
        <Button 
          variant={analysisMode === "direct" ? "default" : "outline"} 
          size="sm"
          className="gap-1" 
          onClick={() => onToggleAnalysisMode("direct")}
        >
          <PieChart className="h-4 w-4" />
          <span className="hidden sm:inline-block">Team Analysis</span>
        </Button>
        <Button 
          variant={analysisMode === "agent-selection" ? "default" : "outline"} 
          size="sm"
          className="gap-1" 
          onClick={() => onToggleAnalysisMode("agent-selection")}
        >
          <ListFilter className="h-4 w-4" />
          <span className="hidden sm:inline-block">Agent Advisor</span>
        </Button>
        {isAuthenticated && (
          <Button variant="outline" size="icon" className="rounded-full" onClick={onLogout}>
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
  );
};

export default ScoutHeader;
