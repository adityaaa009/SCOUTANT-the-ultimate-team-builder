
import { corsHeaders } from "../cors.ts";

export async function handleScoutChat(data: { prompt: string; chatHistory?: any[] }, apiKey: string) {
  const { prompt, chatHistory = [] } = data;
  
  if (!prompt) {
    throw new Error('No prompt provided');
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

  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(`OpenAI API error: ${result.error?.message || 'Unknown error'}`);
  }
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      content: result.choices[0].message.content,
      type: "text_response"
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
