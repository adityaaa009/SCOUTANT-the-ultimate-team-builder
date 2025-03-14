
// Define agent roles
export const AGENT_ROLES: Record<string, string> = {
  "Brimstone": "Controller", "Viper": "Controller", "Omen": "Controller",
  "Astra": "Controller", "Harbor": "Controller", "Clove": "Controller",
  "Sova": "Initiator", "Breach": "Initiator", "Skye": "Initiator", "KAY/O": "Initiator",
  "Fade": "Initiator", "Gekko": "Initiator", "Tejo": "Initiator",
  "Killjoy": "Sentinel", "Cypher": "Sentinel", "Sage": "Sentinel",
  "Chamber": "Sentinel", "Deadlock": "Sentinel", "Vyse": "Sentinel",
  "Phoenix": "Duelist", "Jett": "Duelist", "Reyna": "Duelist", "Raze": "Duelist",
  "Yoru": "Duelist", "Neon": "Duelist", "Iso": "Duelist"
};

// Define the player data interface
export interface PlayerData {
  Agent: string;
  "Rounds Played": number;
  ACS: number;
  ADR: number;
  "K:D": number;
  KAST: string;
}

// Define the role performance interface
export interface RolePerformance {
  Role: string;
  "Total Rounds": number;
  "Avg ACS": number;
  "Avg ADR": number;
  "Avg K:D": number;
  "Avg KAST": number;
  "Success Score": number;
}

// Function to analyze player performance
export function analyzePlayerPerformance(data: PlayerData[]): RolePerformance[] {
  const roleStats: Record<string, { 
    Rounds: number; 
    ACS: number; 
    ADR: number; 
    "K:D": number; 
    KAST: number; 
    Count: number 
  }> = {};
  
  // Initialize role stats
  Object.values(AGENT_ROLES).forEach(role => {
    roleStats[role] = { Rounds: 0, ACS: 0, ADR: 0, "K:D": 0, KAST: 0, Count: 0 };
  });

  // Process each player data entry
  data.forEach(row => {
    const agent = row.Agent;
    const role = AGENT_ROLES[agent] || "Unknown";

    if (role !== "Unknown") {
      roleStats[role].Rounds += row["Rounds Played"];
      roleStats[role].ACS += row.ACS;
      roleStats[role].ADR += row.ADR;
      roleStats[role]["K:D"] += row["K:D"];
      roleStats[role].KAST += parseFloat(row.KAST.replace('%', ''));
      roleStats[role].Count += 1;
    }
  });

  // Calculate averages and success scores
  const rolePerformance: RolePerformance[] = [];
  Object.entries(roleStats).forEach(([role, stats]) => {
    if (stats.Count > 0) {
      const avgACS = parseFloat((stats.ACS / stats.Count).toFixed(2));
      const avgADR = parseFloat((stats.ADR / stats.Count).toFixed(2));
      const avgKD = parseFloat((stats["K:D"] / stats.Count).toFixed(2));
      const avgKAST = parseFloat((stats.KAST / stats.Count).toFixed(2));
      const successScore = parseFloat(
        (avgACS * 0.4 + avgKD * 0.3 + avgADR * 0.2 + avgKAST * 0.1).toFixed(2)
      );

      rolePerformance.push({
        Role: role,
        "Total Rounds": stats.Rounds,
        "Avg ACS": avgACS,
        "Avg ADR": avgADR,
        "Avg K:D": avgKD,
        "Avg KAST": avgKAST,
        "Success Score": successScore
      });
    }
  });

  // Sort by success score in descending order
  return rolePerformance.sort((a, b) => b["Success Score"] - a["Success Score"]);
}

// Generate sample player data for testing
export function generateSamplePlayerData(): PlayerData[] {
  return [
    { Agent: "Jett", "Rounds Played": 20, ACS: 250, ADR: 140, "K:D": 1.2, KAST: "75%" },
    { Agent: "Sova", "Rounds Played": 25, ACS: 210, ADR: 135, "K:D": 1.1, KAST: "72%" },
    { Agent: "Viper", "Rounds Played": 22, ACS: 230, ADR: 130, "K:D": 1.3, KAST: "78%" },
    { Agent: "Reyna", "Rounds Played": 18, ACS: 280, ADR: 150, "K:D": 1.5, KAST: "70%" },
    { Agent: "Killjoy", "Rounds Played": 21, ACS: 200, ADR: 120, "K:D": 1.0, KAST: "80%" }
  ];
}
