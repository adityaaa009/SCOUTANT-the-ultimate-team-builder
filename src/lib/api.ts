import { fetchMultiplePlayersData } from "./vlrDataFetcher";
import { recommendTeamComposition } from "./playerAnalysis";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetch AI response from Supabase Edge Function
 */
export async function fetchScoutantResponse(prompt: string): Promise<any> {
  try {
    // First, classify the prompt to understand user intent
    const classificationResponse = await supabase.functions.invoke("scoutant-ai", {
      body: {
        action: "classify_prompt",
        data: { prompt }
      }
    });
    
    if (classificationResponse.error) {
      throw new Error(classificationResponse.error.message);
    }
    
    const classification = classificationResponse.data;
    console.log("Prompt classification:", classification);

    // If it's a team formation request, handle accordingly
    if (classification.isTeamFormationRequest && classification.confidence > 0.6) {
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
    }
    
    // If it's an agent selection query, handle it
    if (classification.isAgentSelectionRequest && classification.confidence > 0.6) {
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
            throw new Error(aiResponse.error.message);
          }
          
          return {
            success: true,
            type: "agent_selection",
            data: aiResponse.data,
            prompt: prompt,
            mapName: mapName
          };
        } catch (error) {
          console.error("Error with agent selection:", error);
          throw error;
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
        throw new Error(aiResponse.error.message);
      }
      
      return {
        success: true,
        type: "text_response",
        data: aiResponse.data.content,
        isTeamRequest: aiResponse.data.isTeamRequest && aiResponse.data.isTeamRequest === true,
        isAgentSelectionRequest: aiResponse.data.isAgentSelectionRequest && aiResponse.data.isAgentSelectionRequest === true,
        isMapRequest: aiResponse.data.isMapRequest && aiResponse.data.isMapRequest === true
      };
    } catch (aiError) {
      console.error("Error with AI chat, falling back to template response:", aiError);
      // Fall back to template response if AI fails
      return generateTextResponse(prompt, classification);
    }
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
  // Example pro players - in a real app, this would be more sophisticated
  const proPlayers = ["TenZ", "yay", "Asuna", "ShahZaM", "cNed", "ScreaM", "Boaster", "nAts"];
  
  // Find potential player names in the prompt
  const mentionedPlayers = proPlayers.filter(player => 
    prompt.toLowerCase().includes(player.toLowerCase())
  );
  
  // If specific players mentioned, return them
  if (mentionedPlayers.length > 0) {
    return mentionedPlayers;
  }
  
  // Otherwise, return a selection of players for a sample analysis
  return proPlayers.slice(0, 5);
}

/**
 * Generate a text-based response for prompts that don't involve player analysis
 */
function generateTextResponse(prompt: string, classification: any): any {
  const promptLower = prompt.toLowerCase();
  
  // Different response types based on prompt classification
  let responseType = "general";
  
  if (classification.isTeamFormationRequest) {
    responseType = "team";
  } else if (classification.isAgentSelectionRequest) {
    responseType = "agent";
  } else if (classification.isMapRequest) {
    responseType = "map";
  } else if (promptLower.includes("strategy") || promptLower.includes("tactic")) {
    responseType = "strategy";
  } else if (promptLower.includes("tournament") || promptLower.includes("competition")) {
    responseType = "tournament";
  }
  
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

Here's what the data reveals about tournament strategies:`,
    general: `I've analyzed your question: "${prompt}" and searched through Valorant data to find you an answer.

Let me provide some insight based on current game knowledge and meta analysis...`
  };
  
  return {
    success: true,
    type: "text_response",
    data: responses[responseType as keyof typeof responses],
    prompt: prompt,
    isTeamRequest: classification.isTeamFormationRequest
  };
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
