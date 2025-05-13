
import React from "react";
import { Button } from "@/components/ui/button";
import { Users, BarChart, LogOut } from "lucide-react";
import { Link } from "react-router-dom";

interface ScoutSidebarProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

const ScoutSidebar: React.FC<ScoutSidebarProps> = ({ 
  isAuthenticated, 
  onLogout 
}) => {
  return (
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
        <Button variant="ghost" size="icon" onClick={onLogout}>
          <LogOut className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};

export default ScoutSidebar;
