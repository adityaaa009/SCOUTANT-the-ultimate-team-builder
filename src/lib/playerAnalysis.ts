
import { PlayerData, PlayerStat } from "./vlrDataFetcher";
import { AGENT_ROLES } from "./agentAnalysis";

export interface RolePerformanceExtended {
  Role: string;
  "Total Rounds": number;
  "Avg ACS": number;
  "Avg ADR": number;
  "Avg K:D": number;
  "Avg KAST": number;
  "Avg KPR": number;
  "Avg APR": number;
  "Success Score": number;
  "Confidence": number;
  "Players": string[];
}

/**
 * Analyzes player performance data and returns role-based performance metrics
 */
export function analyzePlayerPerformance(playersData: PlayerData[]): RolePerformanceExtended[] {
  const roleStats: Record<string, { 
    Rounds: number; 
    ACS: number; 
    ADR: number; 
    "K:D": number; 
    KAST: number;
    KPR: number;
    APR: number;
    Count: number;
    Players: Set<string>;
  }> = {};
  
  // Initialize role stats
  Object.values(AGENT_ROLES).forEach(role => {
    roleStats[role] = { 
      Rounds: 0, ACS: 0, ADR: 0, "K:D": 0, KAST: 0, KPR: 0, APR: 0, Count: 0, Players: new Set() 
    };
  });

  // Process each player data entry
  playersData.forEach(playerData => {
    playerData.stats.forEach(stat => {
      const agent = stat.Agent;
      const role = AGENT_ROLES[agent] || "Unknown";

      if (role !== "Unknown") {
        roleStats[role].Rounds += stat.RoundsPlayed;
        roleStats[role].ACS += stat.ACS;
        roleStats[role].ADR += stat.ADR;
        roleStats[role]["K:D"] += stat.KD;
        roleStats[role].KAST += parseFloat(stat.KAST.replace('%', ''));
        roleStats[role].KPR += stat.KPR;
        roleStats[role].APR += stat.APR;
        roleStats[role].Count += 1;
        roleStats[role].Players.add(playerData.name);
      }
    });
  });

  // Calculate averages and success scores
  const rolePerformance: RolePerformanceExtended[] = [];
  Object.entries(roleStats).forEach(([role, stats]) => {
    if (stats.Count > 0) {
      const avgACS = parseFloat((stats.ACS / stats.Count).toFixed(2));
      const avgADR = parseFloat((stats.ADR / stats.Count).toFixed(2));
      const avgKD = parseFloat((stats["K:D"] / stats.Count).toFixed(2));
      const avgKAST = parseFloat((stats.KAST / stats.Count).toFixed(2));
      const avgKPR = parseFloat((stats.KPR / stats.Count).toFixed(2));
      const avgAPR = parseFloat((stats.APR / stats.Count).toFixed(2));
      
      // Calculate success score with a weighted formula similar to the Python code
      const successScore = parseFloat(
        (avgACS * 0.4 + avgKD * 0.3 + avgADR * 0.2 + avgKAST * 0.1).toFixed(2)
      );

      // Calculate confidence based on sample size
      const confidence = parseFloat(
        Math.min(stats.Count / 10, 1).toFixed(2)
      );

      rolePerformance.push({
        Role: role,
        "Total Rounds": stats.Rounds,
        "Avg ACS": avgACS,
        "Avg ADR": avgADR,
        "Avg K:D": avgKD,
        "Avg KAST": avgKAST,
        "Avg KPR": avgKPR,
        "Avg APR": avgAPR,
        "Success Score": successScore,
        "Confidence": confidence,
        "Players": Array.from(stats.Players)
      });
    }
  });

  // Sort by success score in descending order
  return rolePerformance.sort((a, b) => b["Success Score"] - a["Success Score"]);
}

/**
 * Recommends a team composition based on player performance data
 */
export function recommendTeamComposition(playersData: PlayerData[]): {
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
} {
  if (!playersData.length) {
    return { 
      success: false, 
      message: "No player data available for analysis" 
    };
  }

  try {
    const rolePerformance = analyzePlayerPerformance(playersData);
    
    // Check if we have enough roles covered
    if (rolePerformance.length < 4) {
      return {
        success: false,
        message: "Not enough role data to recommend a complete lineup"
      };
    }

    // Ensure we have at least one player for each key role
    const rolesCovered = new Set(rolePerformance.map(r => r.Role));
    const essentialRoles = ["Duelist", "Controller", "Sentinel", "Initiator"];
    const missingRoles = essentialRoles.filter(role => !rolesCovered.has(role));
    
    if (missingRoles.length > 0) {
      return {
        success: false,
        message: `Missing data for these essential roles: ${missingRoles.join(', ')}`
      };
    }

    // Build optimal lineup with 5 players, one for each role with the highest scores
    // and an extra player for the role with highest score
    const lineup: Array<{
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
    }> = [];

    // First, select top performers for each essential role
    for (const role of essentialRoles) {
      const bestForRole = rolePerformance.find(r => r.Role === role);
      if (bestForRole && bestForRole.Players.length > 0) {
        const playerName = bestForRole.Players[0];
        const playerData = playersData.find(p => p.name === playerName);
        
        if (playerData && playerData.stats.length > 0) {
          const stat = playerData.stats[0];
          lineup.push({
            name: playerName,
            agent: stat.Agent,
            role: role,
            confidence: bestForRole.Confidence,
            stats: {
              acs: stat.ACS,
              kd: stat.KD,
              adr: stat.ADR,
              kast: stat.KAST
            }
          });
        }
      }
    }

    // If we haven't filled all 5 spots, add additional players
    if (lineup.length < 5) {
      const existingPlayers = new Set(lineup.map(p => p.name));
      
      // Sort roles by performance score
      const sortedRoles = [...rolePerformance].sort((a, b) => b["Success Score"] - a["Success Score"]);
      
      for (const rolePerf of sortedRoles) {
        // If we have enough players, break
        if (lineup.length >= 5) break;
        
        // Try to find a player for this role that's not already in the lineup
        for (const playerName of rolePerf.Players) {
          if (!existingPlayers.has(playerName)) {
            const playerData = playersData.find(p => p.name === playerName);
            
            if (playerData && playerData.stats.length > 0) {
              const stat = playerData.stats[0];
              lineup.push({
                name: playerName,
                agent: stat.Agent,
                role: rolePerf.Role,
                confidence: rolePerf.Confidence,
                stats: {
                  acs: stat.ACS,
                  kd: stat.KD,
                  adr: stat.ADR,
                  kast: stat.KAST
                }
              });
              existingPlayers.add(playerName);
              break;
            }
          }
        }
      }
    }

    return {
      success: true,
      lineup
    };
  } catch (error) {
    console.error("Error in team composition recommendation:", error);
    return {
      success: false,
      message: "An error occurred while analyzing player data"
    };
  }
}
