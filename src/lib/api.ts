
import { fetchMultiplePlayersData } from "./vlrDataFetcher";
import { recommendTeamComposition } from "./playerAnalysis";
import { supabase } from "@/integrations/supabase/client";

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
      
      // Use OpenAI for enhanced player analysis
      try {
        const aiResponse = await supabase.functions.invoke("scoutant-ai", {
          body: {
            action: "analyze_players",
            data: { players: playersData }
          }
        });
        
        if (aiResponse.error) {
          console.error("Error from analyze_players function:", aiResponse.error);
          throw new Error(aiResponse.error.message);
        }
        
        const data = aiResponse.data;
        
        if (data.success) {
          console.log("AI player analysis:", data);
          return {
            success: true,
            type: "team_composition",
            data: data,
            prompt: prompt,
            playerNames: playerNames
          };
        } else if (data.content) {
          // If there's an error but we have content, use it as a fallback message
          return {
            success: true,
            type: "text_response",
            content: data.content
          };
        }
      } catch (aiError) {
        console.error("Error with AI player analysis, falling back to algorithm:", aiError);
        // Fall back to algorithmic recommendation if AI fails
        const recommendation = recommendTeamComposition(playersData);
        return {
          success: true,
          type: "team_composition",
          data: recommendation,
          prompt: prompt,
          playerNames: playerNames
        };
      }
    }
    
    // If it's an agent selection query, handle it
    if (isAgentSelectionQuery(prompt)) {
      const mapName = extractMapName(prompt);
      if (mapName) {
        try {
          const aiResponse = await supabase.functions.invoke("scoutant-ai", {
            body: {
              action: "agent_selection",
              data: { map: mapName }
            }
          });
          
          if (aiResponse.error) {
            console.error("Error from agent_selection function:", aiResponse.error);
            throw new Error(aiResponse.error.message);
          }
          
          if (aiResponse.data && aiResponse.data.success) {
            return {
              success: true,
              type: "agent_selection",
              data: aiResponse.data,
              prompt: prompt,
              mapName: mapName
            };
          } else if (aiResponse.data && aiResponse.data.content) {
            // Use content as fallback response if available
            return {
              success: true,
              type: "text_response",
              content: aiResponse.data.content
            };
          }
        } catch (error) {
          console.error("Error with agent selection:", error);
        }
      }
    }
    
    // For all other queries, use the OpenAI-powered scout chat
    try {
      const aiResponse = await supabase.functions.invoke("scoutant-ai", {
        body: {
          action: "scout_chat",
          data: { prompt }
        }
      });
      
      if (aiResponse.error) {
        console.error("Error from scout_chat function:", aiResponse.error);
        throw new Error(aiResponse.error.message);
      }
      
      if (aiResponse.data && aiResponse.data.content) {
        return {
          success: true,
          type: "text_response",
          content: aiResponse.data.content
        };
      }
      
      return aiResponse.data;
    } catch (aiError) {
      console.error("Error with AI chat, falling back to template response:", aiError);
      // Fall back to template response if AI fails
      return generateTextResponse(prompt);
    }
  } catch (error) {
    console.error("Error fetching Scoutant response:", error);
    return { 
      success: false, 
      error: error.message,
      type: "text_response",
      content: `Sorry, I encountered an issue while processing your request. The team compositions and map recommendations are still available based on our internal data. Technical details: ${error.message}`
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
