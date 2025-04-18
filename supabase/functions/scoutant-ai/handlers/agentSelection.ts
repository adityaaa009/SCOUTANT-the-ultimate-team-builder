
import { corsHeaders } from "../cors.ts";

export async function handleAgentSelection(data: { map: string; playerStats?: any; teamComposition?: string[] }, apiKey: string) {
  const { map, playerStats, teamComposition = [] } = data;
  
  if (!map) {
    throw new Error('Map name is required');
  }

  const prompt = `
    Recommend optimal agent selections for a Valorant team on ${map} map.
    
    ${playerStats ? `Player statistics: ${JSON.stringify(playerStats, null, 2)}` : ''}
    ${teamComposition.length > 0 ? `Current team composition: ${teamComposition.join(', ')}` : ''}
    
    Please consider:
    1. Map-specific agent effectiveness
    2. Current meta strategies
    3. Team composition balance
    4. Agent synergies
    
    Format your response as a JSON with the following structure:
    {
      "success": true,
      "recommendations": [
        {
          "agent": "agent_name",
          "role": "agent_role",
          "map_effectiveness": 0.90,
          "reason": "Brief explanation for this recommendation"
        }
      ],
      "strategyNotes": "Brief overview of recommended strategy with these agents"
    }
  `;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert Valorant analyst specializing in map strategies and agent selection.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
    }),
  });

  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(`OpenAI API error: ${result.error?.message || 'Unknown error'}`);
  }
  
  try {
    const agentResult = JSON.parse(result.choices[0].message.content);
    return new Response(
      JSON.stringify(agentResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ 
        success: true, 
        rawAnalysis: result.choices[0].message.content 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
