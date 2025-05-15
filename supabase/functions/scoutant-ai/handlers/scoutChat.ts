
import { corsHeaders } from "../cors.ts";

export async function handleScoutChat(data: { prompt: string; chatHistory?: any[] }, apiKey: string) {
  const { prompt, chatHistory = [] } = data;
  
  if (!prompt) {
    throw new Error('No prompt provided');
  }

  // Log the request for debugging
  console.log(`Processing chat request: "${prompt.substring(0, 30)}..."`);
  
  try {
    // Check if the OpenAI API key is available and valid
    if (!apiKey || apiKey.trim() === '') {
      console.warn("Missing or invalid OpenAI API key");
      return generateFallbackResponse(prompt, "missing_api_key");
    }
    
    const messages = [
      { 
        role: 'system', 
        content: `You are SCOUTANT, an expert Valorant AI assistant specializing in player analysis, team composition, agent selection, and professional esports. 
        Answer questions concisely and accurately, focusing on providing strategic insights and data-driven recommendations.
        When discussing player performance, consider ACS, KD ratio, ADR, KAST, and other relevant metrics.
        When discussing team composition, focus on synergy between agents, map-specific strategies, and role balance.
        Base your responses on current meta and professional play patterns.`
      },
      ...chatHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: prompt }
    ];

    console.log(`Sending request to OpenAI API with ${messages.length} messages`);
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenAI API error:", errorData);
        
        // Check specifically for quota exceeded error
        if (errorData.error?.type === "insufficient_quota" || 
            errorData.error?.message?.includes("exceeded your current quota")) {
          return generateFallbackResponse(prompt, "quota_exceeded");
        }
        
        throw new Error(`OpenAI API error: ${errorData.error?.message || `Status ${response.status}`}`);
      }
      
      const result = await response.json();
      console.log("OpenAI API response received successfully");
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          content: result.choices[0].message.content,
          type: "text_response"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (apiError) {
      console.error("Error calling OpenAI API:", apiError);
      return generateFallbackResponse(prompt, "api_error");
    }
  } catch (error) {
    console.error("Error in handleScoutChat:", error);
    return generateFallbackResponse(prompt, "general_error", error.message);
  }
}

// Generate a more helpful fallback response based on error type
function generateFallbackResponse(prompt: string, errorType: string, errorDetails?: string) {
  // Analyze prompt to provide a somewhat relevant response
  const promptLower = prompt.toLowerCase();
  
  // Check for common topics in the prompt to provide a better fallback
  const isAboutAgents = /agent|duelist|controller|initiator|sentinel/i.test(promptLower);
  const isAboutMaps = /map|haven|bind|ascent|split|breeze|lotus|pearl|sunset/i.test(promptLower);
  const isAboutPlayers = /player|pro|team|stats|performance/i.test(promptLower);
  
  let responseContent = "";
  
  // Base response on error type
  switch (errorType) {
    case "quota_exceeded":
      responseContent = "I'm currently experiencing high demand and my AI service quota has been temporarily reached. ";
      break;
    case "missing_api_key":
      responseContent = "My AI service is currently unavailable due to configuration issues. ";
      break;
    case "api_error":
      responseContent = "I'm having trouble connecting to my AI service right now. ";
      break;
    case "general_error":
      responseContent = `I encountered an unexpected error while processing your request. ${errorDetails ? `Details: ${errorDetails}` : ''} `;
      break;
    default:
      responseContent = "I'm experiencing technical difficulties at the moment. ";
  }
  
  // Add topic-specific content based on prompt analysis
  if (isAboutAgents) {
    responseContent += "For agent information, I recommend checking the current meta on sites like blitz.gg or valorbuff.com. Popular agents in the current meta include Jett, Fade, Skye, and Omen, but agent selection should always consider map and team composition.";
  } else if (isAboutMaps) {
    responseContent += "Map strategies vary widely in Valorant. Each map has unique callouts, optimal agent compositions, and execution strategies. Consider watching professional matches on the specific map you're interested in to learn current meta strategies.";
  } else if (isAboutPlayers) {
    responseContent += "Player performance is typically measured using metrics like ACS (Average Combat Score), K/D ratio, ADR (Average Damage per Round), and KAST percentage. These statistics can be found on official VCT websites or third-party analytics platforms.";
  } else {
    responseContent += "While my advanced features are temporarily unavailable, you can still access basic information about Valorant agents, maps, and general strategies through the app's static content.";
  }
  
  // Add a general closing note
  responseContent += " I'll be back with my full functionality soon!";
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      content: responseContent,
      type: "text_response",
      is_fallback: true
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
