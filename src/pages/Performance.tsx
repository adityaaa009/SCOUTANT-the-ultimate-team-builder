
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Users, Search, ChevronLeft, Trophy } from "lucide-react";
import { toast } from "sonner";
import { auth } from "@/lib/auth";
import PerformanceTable from "@/components/PerformanceTable";
import PerformanceChart from "@/components/PerformanceChart";
import PlayerDataForm from "@/components/PlayerDataForm";
import { PlayerData, RolePerformance, analyzePlayerPerformance, generateSamplePlayerData } from "@/lib/agentAnalysis";

const Performance = () => {
  const [playerData, setPlayerData] = useState<PlayerData[]>([]);
  const [performanceData, setPerformanceData] = useState<RolePerformance[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [bestRole, setBestRole] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication status
    setIsAuthenticated(auth.isAuthenticated());
    
    // Load sample data
    const sampleData = generateSamplePlayerData();
    setPlayerData(sampleData);
    
    // Analyze the sample data
    const results = analyzePlayerPerformance(sampleData);
    setPerformanceData(results);
    
    // Set best role
    if (results.length > 0) {
      setBestRole(results[0].Role);
    }
  }, []);

  const handleAddPlayerData = (data: PlayerData) => {
    setPlayerData(prev => [...prev, data]);
    const newResults = analyzePlayerPerformance([...playerData, data]);
    setPerformanceData(newResults);
    
    if (newResults.length > 0) {
      setBestRole(newResults[0].Role);
    }
  };

  const handleClearData = () => {
    setPlayerData([]);
    setPerformanceData([]);
    setBestRole(null);
    toast.info("All player data cleared");
  };

  const handleUseSampleData = () => {
    const sampleData = generateSamplePlayerData();
    setPlayerData(sampleData);
    const results = analyzePlayerPerformance(sampleData);
    setPerformanceData(results);
    
    if (results.length > 0) {
      setBestRole(results[0].Role);
    }
    
    toast.success("Sample data loaded");
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
            <Link to="/scout">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Performance Analysis</h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleUseSampleData}>
                  Use Sample Data
                </Button>
                <Button variant="destructive" onClick={handleClearData}>
                  Clear Data
                </Button>
              </div>
            </div>

            {bestRole && (
              <Card className="bg-red-500 text-white p-6 mb-8">
                <div className="flex items-center gap-4">
                  <Trophy className="h-10 w-10" />
                  <div>
                    <h3 className="text-xl font-bold">Best Role: {bestRole}</h3>
                    <p>Based on your performance data, you excel most at playing {bestRole} agents.</p>
                  </div>
                </div>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-2">
                <PerformanceChart data={performanceData} />
              </div>
              <div>
                <PlayerDataForm onSubmit={handleAddPlayerData} />
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-bold mb-4">Role Performance Analysis</h3>
              <PerformanceTable data={performanceData} />
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-bold mb-4">Player Data Entries ({playerData.length})</h3>
              <Card className="w-full overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="bg-red-500 text-white">Agent</TableHead>
                      <TableHead className="bg-red-500 text-white">Role</TableHead>
                      <TableHead className="bg-red-500 text-white">Rounds</TableHead>
                      <TableHead className="bg-red-500 text-white">ACS</TableHead>
                      <TableHead className="bg-red-500 text-white">ADR</TableHead>
                      <TableHead className="bg-red-500 text-white">K:D</TableHead>
                      <TableHead className="bg-red-500 text-white">KAST</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {playerData.map((player, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{player.Agent}</TableCell>
                        <TableCell>{AGENT_ROLES[player.Agent]}</TableCell>
                        <TableCell>{player["Rounds Played"]}</TableCell>
                        <TableCell>{player.ACS}</TableCell>
                        <TableCell>{player.ADR}</TableCell>
                        <TableCell>{player["K:D"]}</TableCell>
                        <TableCell>{player.KAST}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Performance;

// Import the Table components for the player data table
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AGENT_ROLES } from "@/lib/agentAnalysis";
