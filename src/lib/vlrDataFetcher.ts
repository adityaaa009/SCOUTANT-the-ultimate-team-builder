
/**
 * Utility for fetching player stats from VLR.gg
 */

export interface PlayerStat {
  Agent: string;
  Usage: number;
  RoundsPlayed: number;
  Rating: number;
  ACS: number;
  KD: number;
  ADR: number;
  KAST: string;
  KPR: number;
  APR: number;
  FirstKillsPerRound: number;
  FirstDeathsPerRound: number;
  Kills: number;
  Deaths: number;
  Assists: number;
  FirstKills: number;
  FirstDeaths: number;
}

export interface PlayerData {
  name: string;
  stats: PlayerStat[];
}

/**
 * Simulates fetching player data from VLR.gg
 * In a real implementation, this would use an API or a proxy server 
 * to fetch and parse data from VLR.gg
 */
export async function fetchPlayerData(playerName: string): Promise<PlayerData | null> {
  // In a production environment, this would be replaced with an actual API call
  // to a backend service that fetches data from VLR.gg
  
  console.log(`Fetching data for player: ${playerName}`);
  
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For demo purposes, return random data
    // In production, this would use the Python scraping logic on the backend
    const agents = ["Jett", "Raze", "Breach", "Omen", "Killjoy", "Sage", "Reyna", "Sova"];
    const randomAgent = agents[Math.floor(Math.random() * agents.length)];
    
    return {
      name: playerName,
      stats: [
        {
          Agent: randomAgent,
          Usage: Math.floor(Math.random() * 50) + 50,
          RoundsPlayed: Math.floor(Math.random() * 500) + 200,
          Rating: parseFloat((Math.random() * 0.5 + 1.0).toFixed(2)),
          ACS: Math.floor(Math.random() * 100) + 200,
          KD: parseFloat((Math.random() * 1 + 0.8).toFixed(2)),
          ADR: Math.floor(Math.random() * 50) + 130,
          KAST: `${Math.floor(Math.random() * 20) + 70}%`,
          KPR: parseFloat((Math.random() * 0.3 + 0.6).toFixed(2)),
          APR: parseFloat((Math.random() * 0.2 + 0.3).toFixed(2)),
          FirstKillsPerRound: parseFloat((Math.random() * 0.2).toFixed(2)),
          FirstDeathsPerRound: parseFloat((Math.random() * 0.2).toFixed(2)),
          Kills: Math.floor(Math.random() * 300) + 200,
          Deaths: Math.floor(Math.random() * 200) + 150,
          Assists: Math.floor(Math.random() * 150) + 100,
          FirstKills: Math.floor(Math.random() * 50) + 30,
          FirstDeaths: Math.floor(Math.random() * 40) + 20
        }
      ]
    };
  } catch (error) {
    console.error("Error fetching player data:", error);
    return null;
  }
}

/**
 * Fetches data for multiple players
 */
export async function fetchMultiplePlayersData(playerNames: string[]): Promise<PlayerData[]> {
  const results: PlayerData[] = [];
  
  for (const playerName of playerNames) {
    const data = await fetchPlayerData(playerName);
    if (data) {
      results.push(data);
    }
  }
  
  return results;
}
