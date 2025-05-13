/**
 * Extract player names from the prompt
 */
export function extractPlayerNamesFromPrompt(prompt: string): string[] {
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
export function isAgentSelectionQuery(prompt: string): boolean {
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
export function extractMapName(prompt: string): string | null {
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
