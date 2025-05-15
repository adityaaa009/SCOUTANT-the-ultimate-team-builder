
import { corsHeaders } from "../cors.ts";

export async function handleScoutChat(data: { prompt: string; chatHistory?: any[] }, apiKey: string) {
  const { prompt, chatHistory = [] } = data;
  
  if (!prompt) {
    throw new Error('No prompt provided');
  }

  // Log the request for debugging
  console.log(`Processing chat request: "${prompt.substring(0, 30)}..."`);
  
  try {
    const messages = [
      { 
        role: 'system', 
        content: `You are SCOUTANT, an expert Valorant AI assistant specializing in player analysis, team composition, agent selection, and professional esports. 
        Answer questions concisely and accurately, focusing on providing strategic insights and data-driven recommendations.
        When discussing player performance, consider ACS, KD ratio, ADR, KAST, and other relevant metrics.
        When discussing team composition, focus on synergy between agents, map-specific strategies, and role balance.
        Base your responses on current meta and professional play patterns.
        Always provide reasoning for your recommendations.`
      },
      ...chatHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: prompt }
    ];

    console.log(`Sending request to OpenAI API with ${messages.length} messages`);
    
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
  } catch (error) {
    console.error("Error in handleScoutChat:", error);
    
    // Return a more meaningful error response
    return new Response(
      JSON.stringify({ 
        success: false, 
        content: `Sorry, I'm having trouble connecting to my knowledge base right now. The team compositions and map recommendations are based on cached data. Error: ${error.message}`,
        type: "text_response"
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
