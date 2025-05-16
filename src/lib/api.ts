
import { fetchMultiplePlayersData } from "./vlrDataFetcher";
import { recommendTeamComposition } from "./playerAnalysis";
import { supabase } from "@/integrations/supabase/client";
import { predefinedTeamCompositions } from "./predefinedResponses";

/**
 * Fetch AI response from Supabase Edge Function
 */
export async function fetchScoutantResponse(prompt: string): Promise<any> {
  try {
    // Check for predefined prompts first
    const predefinedResponse = checkForPredefinedResponses(prompt);
    if (predefinedResponse) {
      console.log("Using predefined response for prompt:", prompt);
      return predefinedResponse;
    }
    
    // Parse the prompt to extract player names or analyze prompt intent
    const playerNames = extractPlayerNamesFromPrompt(prompt);
    
    // If we found player names, get their data and generate team composition
    if (playerNames.length > 0) {
      console.log("Detected player names in prompt:", playerNames);
      const playersData = await fetchMultiplePlayersData(playerNames);
      
      // Use predefined responses instead of OpenAI
      try {
        // Create a fallback team composition instead of calling the API
        const teamComp = createFallbackTeamComposition(playersData, prompt);
        
        return {
          success: true,
          type: "team_composition",
          data: teamComp,
          prompt: prompt,
          playerNames: playerNames,
          content: "Here's a team composition according to your requirements"
        };
      } catch (aiError) {
        console.error("Error with team composition analysis, falling back:", aiError);
        return generateFallbackResponse(prompt, playersData);
      }
    }
    
    // Handle agent selection without API
    if (isAgentSelectionQuery(prompt)) {
      const mapName = extractMapName(prompt);
      if (mapName) {
        try {
          // Instead of calling API, use predefined responses
          const agentSelectionResponse = getAgentSelectionForMap(mapName);
          
          return {
            success: true,
            type: "agent_selection",
            data: agentSelectionResponse,
            prompt: prompt,
            mapName: mapName
          };
        } catch (error) {
          console.error("Error with agent selection:", error);
          return generateFallbackResponse(prompt);
        }
      }
    }
    
    // Fallback to predefined chat responses
    try {
      // Instead of calling the AI API, use pattern matching to generate responses
      const responseContent = generateTextResponse(prompt);
      
      return {
        success: true,
        type: "text_response",
        content: responseContent
      };
    } catch (aiError) {
      console.error("Error with chat response, falling back:", aiError);
      return generateFallbackResponse(prompt);
    }
  } catch (error) {
    console.error("Error fetching Scoutant response:", error);
    return generateFallbackResponse(prompt);
  }
}

/**
 * Create a fallback team composition
 */
function createFallbackTeamComposition(playersData: any[], prompt: string) {
  // Try to identify the type of team composition requested
  const promptLower = prompt.toLowerCase();
  const isDefensiveTeam = promptLower.includes("defensive") || promptLower.includes("defense");
  const isOffensiveTeam = promptLower.includes("offensive") || promptLower.includes("attack");
  const isCrazyStats = promptLower.includes("crazy") || promptLower.includes("high") || promptLower.includes("best stats");
  
  // Find the map if mentioned
  const mapNames = ["ascent", "bind", "breeze", "haven", "icebox", "split", "fracture", "pearl", "lotus", "sunset"];
  const mentionedMap = mapNames.find(map => promptLower.includes(map));
  
  // Choose the appropriate composition
  if (isDefensiveTeam) {
    return predefinedTeamCompositions.defensive;
  } else if (isOffensiveTeam) {
    return predefinedTeamCompositions.offensive;
  } else if (isCrazyStats) {
    return predefinedTeamCompositions.crazyStats;
  } else if (mentionedMap) {
    // Return map-specific team if available, otherwise balanced
    return predefinedTeamCompositions.maps[mentionedMap] || predefinedTeamCompositions.balanced;
  } else {
    // Default to a balanced team
    return predefinedTeamCompositions.balanced;
  }
}

/**
 * Get predefined agent selections for a specific map
 */
function getAgentSelectionForMap(mapName: string) {
  const mapNameLower = mapName.toLowerCase();
  
  // Define the agent recommendations for each map
  const mapAgentRecommendations: Record<string, any> = {
    "ascent": {
      success: true,
      recommendations: [
        { agent: "Jett", role: "Duelist", map_effectiveness: 0.92, reason: "Great mobility for mid control and OPing from market or A main" },
        { agent: "Omen", role: "Controller", map_effectiveness: 0.90, reason: "Strong smokes for mid control and site executes" },
        { agent: "Killjoy", role: "Sentinel", map_effectiveness: 0.95, reason: "Excellent for site lockdown, especially on B site" },
        { agent: "Fade", role: "Initiator", map_effectiveness: 0.85, reason: "Strong recon abilities for clearing site corners" },
        { agent: "Chamber", role: "Sentinel", map_effectiveness: 0.88, reason: "Effective at holding angles and providing info" }
      ],
      strategyNotes: "Focus on mid control which opens up options to both sites. Sentinel anchoring B is crucial."
    },
    "bind": {
      success: true,
      recommendations: [
        { agent: "Raze", role: "Duelist", map_effectiveness: 0.94, reason: "Grenade and Boombot are perfect for close quarters and clearing hookah/bathroom" },
        { agent: "Brimstone", role: "Controller", map_effectiveness: 0.92, reason: "Precise smokes for site executes and post-plant situations" },
        { agent: "Cypher", role: "Sentinel", map_effectiveness: 0.90, reason: "Trip wires excellent for flank watch on this map with many paths" },
        { agent: "Skye", role: "Initiator", map_effectiveness: 0.89, reason: "Flash and scout information through tight corridors" },
        { agent: "Viper", role: "Controller", map_effectiveness: 0.87, reason: "Wall can effectively split sites for executes" }
      ],
      strategyNotes: "Map favors utility to clear tight spaces. Double controller can be strong for executes."
    },
    "haven": {
      success: true,
      recommendations: [
        { agent: "Phoenix", role: "Duelist", map_effectiveness: 0.87, reason: "Flashes and wall are great for taking map control" },
        { agent: "Astra", role: "Controller", map_effectiveness: 0.93, reason: "Global presence helps control all three sites simultaneously" },
        { agent: "Killjoy", role: "Sentinel", map_effectiveness: 0.89, reason: "Strong for holding C site and delaying pushes" },
        { agent: "Breach", role: "Initiator", map_effectiveness: 0.90, reason: "Long corridors perfect for flashes and stuns" },
        { agent: "Jett", role: "Duelist", map_effectiveness: 0.88, reason: "Mobility to rotate quickly between the three sites" }
      ],
      strategyNotes: "With three sites, mid control and fast rotations are essential. Prioritize information gathering."
    },
    "breeze": {
      success: true,
      recommendations: [
        { agent: "Jett", role: "Duelist", map_effectiveness: 0.96, reason: "Dash provides mobility across large open areas" },
        { agent: "Viper", role: "Controller", map_effectiveness: 0.97, reason: "Wall is essential for splitting large sites" },
        { agent: "Chamber", role: "Sentinel", map_effectiveness: 0.95, reason: "Teleport great for playing angles, trap for flank watch" },
        { agent: "Sova", role: "Initiator", map_effectiveness: 0.94, reason: "Recon dart excellent on large, open sites" },
        { agent: "Fade", role: "Initiator", map_effectiveness: 0.88, reason: "Haunt good for revealing multiple enemies on large sites" }
      ],
      strategyNotes: "Map favors long-range engagements. Viper is almost mandatory for site executes."
    },
    "split": {
      success: true,
      recommendations: [
        { agent: "Raze", role: "Duelist", map_effectiveness: 0.95, reason: "Great for clearing tight corners and spaces with utility" },
        { agent: "Omen", role: "Controller", map_effectiveness: 0.93, reason: "Smokes and teleport excellent for map control" },
        { agent: "Cypher", role: "Sentinel", map_effectiveness: 0.92, reason: "Trip wires strong for watching flanks in many choke points" },
        { agent: "Breach", role: "Initiator", map_effectiveness: 0.94, reason: "Stuns and flashes great for tight corridors and site takes" },
        { agent: "Sage", role: "Sentinel", map_effectiveness: 0.91, reason: "Wall can block key pathways particularly at mid and B" }
      ],
      strategyNotes: "Map favors control of middle area. Verticality makes sound cues very important."
    },
    "fracture": {
      success: true,
      recommendations: [
        { agent: "Neon", role: "Duelist", map_effectiveness: 0.90, reason: "Mobility helps cover the unique layout of the map" },
        { agent: "Brimstone", role: "Controller", map_effectiveness: 0.89, reason: "Smokes help control the many entry points" },
        { agent: "Chamber", role: "Sentinel", map_effectiveness: 0.88, reason: "Teleport great for playing different positions" },
        { agent: "Fade", role: "Initiator", map_effectiveness: 0.92, reason: "Recon abilities help track enemies across the split map" },
        { agent: "KAY/O", role: "Initiator", map_effectiveness: 0.87, reason: "Suppression blade valuable for disabling abilities during pushes" }
      ],
      strategyNotes: "Map requires coordination due to attackers having multiple entry points. Information control is critical."
    },
    "lotus": {
      success: true,
      recommendations: [
        { agent: "Jett", role: "Duelist", map_effectiveness: 0.88, reason: "Mobility helps navigate through the three-site layout" },
        { agent: "Harbor", role: "Controller", map_effectiveness: 0.90, reason: "Water walls great for blocking sightlines in the circular layout" },
        { agent: "Killjoy", role: "Sentinel", map_effectiveness: 0.89, reason: "Utility helps lock down sites against flanks" },
        { agent: "Skye", role: "Initiator", map_effectiveness: 0.91, reason: "Info gathering crucial for the complex layout" },
        { agent: "Gekko", role: "Initiator", map_effectiveness: 0.86, reason: "Recallable utility good for taking map control" }
      ],
      strategyNotes: "Three sites makes rotation timing crucial. Control of the wheel (mid) area opens up options."
    },
    "pearl": {
      success: true,
      recommendations: [
        { agent: "Raze", role: "Duelist", map_effectiveness: 0.87, reason: "Utility good for clearing tight urban spaces" },
        { agent: "Astra", role: "Controller", map_effectiveness: 0.93, reason: "Global presence helps control the large mid area" },
        { agent: "Cypher", role: "Sentinel", map_effectiveness: 0.89, reason: "Trip wires strong for watching multiple pathways" },
        { agent: "Fade", role: "Initiator", map_effectiveness: 0.90, reason: "Recon abilities helpful on this multi-level map" },
        { agent: "Sage", role: "Sentinel", map_effectiveness: 0.85, reason: "Wall can block key pathways and divide sites" }
      ],
      strategyNotes: "Mid control important as it connects to both sites. The map has multiple levels that add vertical complexity."
    },
    "sunset": {
      success: true,
      recommendations: [
        { agent: "Phoenix", role: "Duelist", map_effectiveness: 0.89, reason: "Flashes and wall great for controlling narrow corridors" },
        { agent: "Omen", role: "Controller", map_effectiveness: 0.91, reason: "Smokes and teleport valuable for map control" },
        { agent: "Deadlock", role: "Sentinel", map_effectiveness: 0.87, reason: "Barriers good for controlling the open spaces" },
        { agent: "KAY/O", role: "Initiator", map_effectiveness: 0.90, reason: "Suppression useful in the compact layout" },
        { agent: "Iso", role: "Duelist", map_effectiveness: 0.86, reason: "Abilities good for isolating enemies in key positions" }
      ],
      strategyNotes: "Map layout favors execution-heavy strategies. Coordinated utility usage is important."
    }
  };
  
  return mapAgentRecommendations[mapNameLower] || mapAgentRecommendations["haven"];
}

/**
 * Generate a text response based on pattern matching
 */
function generateTextResponse(prompt: string): string {
  const promptLower = prompt.toLowerCase();
  
  // Pattern matching for common questions
  if (promptLower.includes("best jett player") || promptLower.includes("top jett")) {
    return "Based on recent tournament performance, the top Jett players include TenZ, yay, and cNed. They've consistently shown exceptional mechanical skill and impact with the agent across various tournaments. TenZ in particular shows excellent movement mechanics and entry fragging capability.";
  }
  
  if (promptLower.includes("compare tenz") && promptLower.includes("yay")) {
    return "When comparing TenZ and yay:\n\nTenZ excels with aggressive playstyles on duelists like Jett and Raze. He averages 250+ ACS in major tournaments with a 1.2+ K/D ratio. His movement and aim mechanics are exceptional.\n\nyay (also known as El Diablo) is more versatile across both duelists and sentinels. He maintains a higher headshot percentage (around 25-30%) and is considered more consistent with a 1.3+ K/D ratio. His Chamber performance has been particularly noteworthy.\n\nBoth are exceptional players, with TenZ having a slight edge in raw mechanical skill, while yay is valued for consistency and adaptability.";
  }
  
  if (promptLower.includes("best team") && (promptLower.includes("split") || promptLower.includes("map"))) {
    return "The best team composition depends on the map and your playstyle. For Split specifically, an effective composition would include:\n\n- Raze (Duelist): Her utility is perfect for clearing tight spaces\n- Omen (Controller): Smokes are essential for site executes\n- Cypher or Chamber (Sentinel): For flank watching and site anchoring\n- Breach (Initiator): Stuns and flashes are powerful in narrow corridors\n- Sage (Sentinel): Wall is incredibly valuable for mid control and site defense\n\nThis composition balances strong defense capabilities with good site execution potential.";
  }
  
  if (promptLower.includes("meta") || promptLower.includes("current meta")) {
    return "The current Valorant meta favors a balanced composition with strong controller presence. Top agents include Omen and Astra for controllers, Jett and Raze for duelists, Fade and Sova for initiators, and Chamber and Killjoy for sentinels. Double controller setups have become more common on certain maps. Utility-heavy compositions that can control space effectively are preferred in professional play. Agent picks vary by map, with Viper being essential on maps like Breeze and Icebox.";
  }
  
  if (promptLower.includes("aim") && (promptLower.includes("improve") || promptLower.includes("better"))) {
    return "To improve your aim in Valorant:\n\n1. Establish a consistent sensitivity that works for you\n2. Practice daily with aim trainers like Aimlabs or Kovaak's\n3. Focus on crosshair placement at head level\n4. Develop recoil control for each weapon\n5. Play deathmatch to apply skills against real players\n6. Review your gameplay to identify habits to change\n7. Ensure your setup has minimal input lag\n\nMany pros recommend developing muscle memory through consistent practice rather than frequently changing settings.";
  }
  
  // If no specific pattern is matched, return a general response
  return "As your Valorant analyst, I can provide insights on team compositions, agent selections, player comparisons, and gameplay strategies. For team compositions, consider balancing roles with at least one controller, duelist, sentinel, and initiator. Agent selection should be map-dependent, focusing on synergies between abilities. Let me know if you need more specific information about maps, agents, or strategies.";
}

/**
 * Check if the prompt matches any predefined responses
 */
function checkForPredefinedResponses(prompt: string): any | null {
  const promptLower = prompt.toLowerCase().trim();
  
  // Map of predefined prompts to responses
  const predefinedPrompts: Record<string, any> = {
    "give me a team with crazy stats": {
      success: true,
      type: "team_composition",
      data: predefinedTeamCompositions.crazyStats,
      content: "Here's a team recommendation with impressive skillset."
    },
    "best team for playing defensive": {
      success: true,
      type: "team_composition",
      data: predefinedTeamCompositions.defensive,
      content: "Here's the best team for playing defensive."
    },
    "best team for playing offensive": {
      success: true,
      type: "team_composition",
      data: predefinedTeamCompositions.offensive,
      content: "Here's the best team for playing offensive."
    }
  };
  
  // Add map-specific team responses
  const mapNames = ["ascent", "bind", "breeze", "haven", "icebox", "split", "fracture", "pearl", "lotus", "sunset"];
  mapNames.forEach(map => {
    const capitalizedMap = map.charAt(0).toUpperCase() + map.slice(1);
    predefinedPrompts[`best team for ${map}`] = {
      success: true,
      type: "team_composition",
      data: predefinedTeamCompositions.maps[map] || predefinedTeamCompositions.balanced,
      content: `Here's the best team composition for ${capitalizedMap}.`
    };
  });
  
  // Check if we have an exact match
  if (predefinedPrompts[promptLower]) {
    return predefinedPrompts[promptLower];
  }
  
  // Check for close matches
  for (const [key, response] of Object.entries(predefinedPrompts)) {
    if (promptLower.includes(key) || key.includes(promptLower)) {
      return response;
    }
  }
  
  // Check for map-specific queries
  for (const map of mapNames) {
    if (promptLower.includes(map) && (promptLower.includes("team") || promptLower.includes("composition") || promptLower.includes("best agents"))) {
      const capitalizedMap = map.charAt(0).toUpperCase() + map.slice(1);
      return {
        success: true,
        type: "team_composition",
        data: predefinedTeamCompositions.maps[map] || predefinedTeamCompositions.balanced,
        content: `Here's the recommended team for ${capitalizedMap}.`
      };
    }
  }
  
  return null;
}

/**
 * Generate a text-based response for prompts that don't involve player analysis
 */
function generateFallbackResponse(prompt: string, playersData?: any[]) {
  const defaultResponses = [
    "Based on my analysis, I recommend a balanced team composition with a mix of duelists, controllers, initiators, and sentinels.",
    "For optimal team synergy, consider agents whose abilities complement each other.",
    "Map control and utility usage are key factors in successful Valorant strategies."
  ];

  const randomResponse = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];

  if (playersData && playersData.length > 0) {
    const recommendation = recommendTeamComposition(playersData);
    return {
      success: true,
      type: "text_response",
      content: `${randomResponse}\n\nHere's a team recommendation based on available data:\n${JSON.stringify(recommendation, null, 2)}`
    };
  }

  return {
    success: true,
    type: "text_response",
    content: randomResponse
  };
}

/**
 * Extract player names from the prompt
 */
function extractPlayerNamesFromPrompt(prompt: string): string[] {
  // Real implementation would use NLP or pattern matching
  // This is a simple implementation for demonstration
  const promptLower = prompt.toLowerCase();
  
  // Check if prompt contains keywords related to players or teams
  const playerKeywords = ["player", "team", "lineup", "roster", "professional"];
  const containsPlayerKeywords = playerKeywords.some(keyword => promptLower.includes(keyword));
  
  if (containsPlayerKeywords) {
    // Example pro players - in a real app, this would be more sophisticated
    const proPlayers = ["TenZ", "yay", "Asuna", "ShahZaM", "cNed", "ScreaM", "Boaster", "nAts"];
    
    // Find potential player names in the prompt
    const mentionedPlayers = proPlayers.filter(player => 
      promptLower.includes(player.toLowerCase())
    );
    
    // If specific players mentioned, return them
    if (mentionedPlayers.length > 0) {
      return mentionedPlayers;
    }
    
    // Otherwise, return a selection of players for a sample analysis
    return proPlayers.slice(0, 5);
  }
  
  return [];
}

/**
 * Check if the prompt is asking for agent selection advice
 */
function isAgentSelectionQuery(prompt: string): boolean {
  const promptLower = prompt.toLowerCase();
  const agentSelectionKeywords = [
    "agent selection", "which agent", "best agent", "agent for", 
    "pick agent", "should i play", "agent on", "good agent",
    "meta agent", "agent meta"
  ];
  
  return agentSelectionKeywords.some(keyword => promptLower.includes(keyword));
}

/**
 * Extract map name from the prompt
 */
function extractMapName(prompt: string): string | null {
  const promptLower = prompt.toLowerCase();
  const maps = [
    "ascent", "bind", "breeze", "haven", "icebox", 
    "split", "fracture", "pearl", "lotus", "sunset"
  ];
  
  for (const map of maps) {
    if (promptLower.includes(map)) {
      // Capitalize first letter
      return map.charAt(0).toUpperCase() + map.slice(1);
    }
  }
  
  return null;
}
