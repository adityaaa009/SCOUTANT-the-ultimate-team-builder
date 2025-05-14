
import { generateFallbackResponse } from './fallbackResponse';
import { checkForPredefinedResponses } from './predefinedResponses';
import { extractPlayerNamesFromPrompt, isAgentSelectionQuery, extractMapName } from './promptAnalysis';
import { supabase } from "@/integrations/supabase/client";

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
      return await handlePlayerAnalysis(prompt, playerNames);
    }
    
    // Handle agent selection queries
    if (isAgentSelectionQuery(prompt)) {
      return await handleAgentSelection(prompt);
    }
    
    // Fallback to chat for other queries
    return await handleChatQuery(prompt);
  } catch (error) {
    console.error("Error fetching Scoutant response:", error);
    return generateFallbackResponse(prompt);
  }
}

/**
 * Handle player analysis requests
 */
async function handlePlayerAnalysis(prompt: string, playerNames: string[]) {
  try {
    const { fetchMultiplePlayersData } = await import('@/lib/vlrDataFetcher');
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
          playerNames: playerNames,
          content: "Here's a team composition according to your requirements"
        };
      } else {
        console.warn("AI analysis returned without success flag");
        return generateFallbackResponse(prompt, playersData);
      }
    } catch (aiError) {
      console.error("Error with AI player analysis, falling back:", aiError);
      return generateFallbackResponse(prompt, playersData);
    }
  } catch (error) {
    console.error("Error in player analysis:", error);
    return generateFallbackResponse(prompt);
  }
}

/**
 * Handle agent selection queries
 */
async function handleAgentSelection(prompt: string) {
  const mapName = extractMapName(prompt);
  if (!mapName) {
    return generateFallbackResponse(prompt);
  }
  
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

/**
 * Handle general chat queries
 */
async function handleChatQuery(prompt: string) {
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
}
