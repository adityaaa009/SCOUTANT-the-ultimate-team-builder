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
          return generateFallbackResponse(prompt, playersData);
        }
        
        const data = aiResponse.data;
        
        if (data.success) {
          console.log("AI player analysis successful:", data);
          return {
            success: true,
            type: "team_composition",
            data: data,
            prompt: prompt,
            playerNames: playerNames
          };
        } else {
          console.warn("AI analysis returned without success flag");
          return generateFallbackResponse(prompt, playersData);
        }
      } catch (aiError) {
        console.error("Error with AI player analysis, falling back:", aiError);
        return generateFallbackResponse(prompt, playersData);
      }
    }
    
    // Handle agent selection and other queries similarly...
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
            return generateFallbackResponse(prompt);
          }
          
          if (aiResponse.data && aiResponse.data.success) {
            return {
              success: true,
              type: "agent_selection",
              data: aiResponse.data,
              prompt: prompt,
              mapName: mapName
            };
          } else {
            return generateFallbackResponse(prompt);
          }
        } catch (error) {
          console.error("Error with agent selection:", error);
          return generateFallbackResponse(prompt);
        }
      }
    }
    
    // Fallback to chat for other queries
    try {
      const aiResponse = await supabase.functions.invoke("scoutant-ai", {
        body: {
          action: "scout_chat",
          data: { prompt }
        }
      });
      
      if (aiResponse.error) {
        console.error("Error from scout_chat function:", aiResponse.error);
        return generateFallbackResponse(prompt);
      }
      
      if (aiResponse.data && aiResponse.data.content) {
        return {
          success: true,
          type: "text_response",
          content: aiResponse.data.content
        };
      }
      
      return generateFallbackResponse(prompt);
    } catch (aiError) {
      console.error("Error with AI chat, falling back:", aiError);
      return generateFallbackResponse(prompt);
    }
  } catch (error) {
    console.error("Error fetching Scoutant response:", error);
    return generateFallbackResponse(prompt);
  }
}

/**
 * Generate a text-based response for prompts that don't involve player analysis
 */
function generateFallbackResponse(prompt: string, playersData?: any[]) {
  const defaultResponses = [
    "I'm having trouble processing your request. Could you rephrase that?",
    "Sorry, I couldn't generate a detailed response right now.",
    "My AI assistant is currently experiencing some difficulties."
  ];

  const randomResponse = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];

  if (playersData && playersData.length > 0) {
    const recommendation = recommendTeamComposition(playersData);
    return {
      success: true,
      type: "text_response",
      content: `${randomResponse}\n\nHowever, here's a basic team recommendation based on available data:\n${JSON.stringify(recommendation, null, 2)}`
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
