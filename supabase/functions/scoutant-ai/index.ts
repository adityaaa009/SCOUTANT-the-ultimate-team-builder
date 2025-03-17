
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, data } = await req.json();
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    // Handle different actions
    switch (action) {
      case 'analyze_players':
        return handlePlayerAnalysis(data, OPENAI_API_KEY);
      case 'scout_chat':
        return handleScoutChat(data, OPENAI_API_KEY);
      case 'agent_selection':
        return handleAgentSelection(data, OPENAI_API_KEY);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error(`Error in scoutant-ai function:`, error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Handle player analysis with OpenAI
async function handlePlayerAnalysis(data, apiKey) {
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
  
  let analysisResult;
  
  try {
    analysisResult = JSON.parse(result.choices[0].message.content);
  } catch (e) {
    // If parsing fails, return the raw text
    return new Response(
      JSON.stringify({ 
        success: true, 
        rawAnalysis: result.choices[0].message.content 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  return new Response(
    JSON.stringify(analysisResult),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Handle scout chat with OpenAI
async function handleScoutChat(data, apiKey) {
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

// Handle agent selection with OpenAI
async function handleAgentSelection(data, apiKey) {
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
  
  let agentResult;
  
  try {
    agentResult = JSON.parse(result.choices[0].message.content);
  } catch (e) {
    // If parsing fails, return the raw text
    return new Response(
      JSON.stringify({ 
        success: true, 
        rawAnalysis: result.choices[0].message.content 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  return new Response(
    JSON.stringify(agentResult),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
