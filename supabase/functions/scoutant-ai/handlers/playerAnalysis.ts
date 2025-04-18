
import { corsHeaders } from "../cors.ts";

export async function handlePlayerAnalysis(data: { players: any[] }, apiKey: string) {
  const { players } = data;
  
  if (!players || !players.length) {
    throw new Error('No player data provided');
  }

  const prompt = `
    Analyze the following Valorant players and recommend optimal roles and agents based on their stats:
    ${JSON.stringify(players, null, 2)}
    
    Please provide:
    1. A detailed analysis of each player's strengths and weaknesses
    2. Recommended agent for each player
    3. Optimal role for each player (Duelist, Controller, Sentinel, Initiator)
    4. Confidence score for each recommendation (0.0 to 1.0)
    5. Overall team composition recommendation
    
    Format your response as a JSON with the following structure:
    {
      "success": true,
      "lineup": [
        {
          "name": "player_name",
          "agent": "recommended_agent",
          "role": "recommended_role",
          "confidence": 0.92,
          "stats": {
            "acs": 230,
            "kd": 1.2,
            "adr": 143,
            "kast": "72%"
          },
          "analysis": "Brief analysis of player strengths"
        }
      ],
      "teamAnalysis": "Overall team analysis and recommendations"
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
        { role: 'system', content: 'You are an expert Valorant analyst and coach who specializes in player analysis and team composition.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
    }),
  });

  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(`OpenAI API error: ${result.error?.message || 'Unknown error'}`);
  }
  
  try {
    const analysisResult = JSON.parse(result.choices[0].message.content);
    return new Response(
      JSON.stringify(analysisResult),
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
