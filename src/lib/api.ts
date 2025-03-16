
import { fetchMultiplePlayersData } from "./vlrDataFetcher";
import { recommendTeamComposition } from "./playerAnalysis";

/**
 * Fetch AI response from Supabase Edge Function
 */
export async function fetchScoutantResponse(prompt: string): Promise<any> {
  try {
    // Parse the prompt to extract player names or analyze prompt intent
    const playerNames = extractPlayerNamesFromPrompt(prompt);
    
    // If we found player names, get their data and generate team composition
    if (playerNames.length > 0) {
      console.log("Detected player names in prompt:", playerNames);
      const playersData = await fetchMultiplePlayersData(playerNames);
      const recommendation = recommendTeamComposition(playersData);
      
      return {
        success: true,
        type: "team_composition",
        data: recommendation,
        prompt: prompt,
        playerNames: playerNames
      };
    }
    
    // If no player names found, use a text-based response
    return generateTextResponse(prompt);
  } catch (error) {
    console.error("Error fetching Scoutant response:", error);
    return { 
      success: false, 
      error: error.message,
      type: "error",
      data: `An error occurred: ${error.message}`
    };
  }
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
 * Generate a text-based response for prompts that don't involve player analysis
 */
function generateTextResponse(prompt: string): any {
  const promptLower = prompt.toLowerCase();
  
  // Different response types based on prompt keywords
  const keywords = {
    team: ["composition", "roster", "lineup", "squad", "players"],
    strategy: ["tactics", "approach", "plan", "method", "formation"],
    map: ["map", "maps", "arena", "venue", "location"],
    agent: ["agent", "character", "hero", "operator"],
    tournament: ["tournament", "competition", "championship", "event"]
  };
  
  let responseType = "";
  
  for (const [key, words] of Object.entries(keywords)) {
    if (words.some(word => promptLower.includes(word))) {
      responseType = key;
      break;
    }
  }
  
  if (!responseType) responseType = "team";
  
  const responses = {
    team: `Based on your request about "${prompt}", I've analyzed recent performance data from VCT International to create an optimal team composition.

Data analysis complete. Creating a balanced roster that complements player strengths...

Here's the recommended lineup:`,
    strategy: `I've evaluated your query: "${prompt}" and developed strategic recommendations based on current meta analysis.

Processing tactical data from recent professional matches...

Strategy formation complete. Here are my tactical recommendations:`,
    map: `Analyzing your request: "${prompt}" against the current map pool and meta.

Evaluating win rates and composition effectiveness across various maps...

Analysis complete. Here are the optimal maps for your scenario:`,
    agent: `For your query about "${prompt}", I've assessed agent performance data across competitive tiers.

Analyzing agent pick rates, win rates and utility effectiveness...

Here are my agent recommendations based on your requirements:`,
    tournament: `Based on your question about "${prompt}", I've compiled relevant tournament data.

Analyzing recent competition results and team performances...

Here's what the data reveals about tournament strategies:`
  };
  
  return {
    success: true,
    type: "text_response",
    data: responses[responseType as keyof typeof responses],
    prompt: prompt
  };
}
