
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
      case 'classify_prompt':
        return handlePromptClassification(data, OPENAI_API_KEY);
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

  try {
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

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const result = await response.json();
    
    try {
      const analysisResult = JSON.parse(result.choices[0].message.content);
      return new Response(
        JSON.stringify(analysisResult),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (e) {
      console.error('Error parsing OpenAI response:', e);
      // If parsing fails, return the raw text
      return new Response(
        JSON.stringify({ 
          success: true, 
          rawAnalysis: result.choices[0].message.content 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in handlePlayerAnalysis:', error);
    throw error;
  }
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
      Base your responses on current meta and professional play patterns.
      
      IMPORTANT RULES:
      1. If the user asks about player names, team composition, or lineup analysis, respond that you'll analyze the players but DO NOT generate any specific analysis in this message.
      2. If the user's message doesn't make sense or isn't related to Valorant, politely explain that you can only answer Valorant-related questions.
      3. Be helpful and informative but DO NOT hallucinate or make up statistics.
      4. DO NOT suggest a team composition unless explicitly asked.`
    },
    ...chatHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    })),
    { role: 'user', content: prompt }
  ];

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
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const result = await response.json();
    
    // Use a separate prompt classification to determine the intent
    const promptType = await classifyPromptType(prompt, apiKey);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        content: result.choices[0].message.content,
        type: "text_response",
        isTeamRequest: promptType.isTeamFormationRequest,
        isAgentSelectionRequest: promptType.isAgentSelectionRequest,
        isMapRequest: promptType.isMapRequest
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in handleScoutChat:', error);
    throw error;
  }
}

// New function to handle prompt classification
async function handlePromptClassification(data, apiKey) {
  const { prompt } = data;
  
  if (!prompt) {
    throw new Error('No prompt provided');
  }
  
  try {
    const promptType = await classifyPromptType(prompt, apiKey);
    return new Response(
      JSON.stringify(promptType),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in handlePromptClassification:', error);
    throw error;
  }
}

// Function to classify prompt types using OpenAI
async function classifyPromptType(prompt, apiKey) {
  const classificationPrompt = `
    Analyze the following user query and classify its intent.
    Query: "${prompt}"
    
    Classify this query into one of the following categories:
    1. Team Formation Request - if the user is asking for team composition, lineup suggestions, or player role recommendations
    2. Agent Selection Request - if the user is asking about which agents to pick for specific maps or scenarios
    3. Map-specific Request - if the user is asking about map strategies, layouts, or tips
    4. General Question - if the user is asking a general Valorant question that doesn't fit the above
    5. Invalid/Non-Valorant - if the query is unrelated to Valorant or doesn't make sense
    
    Return your answer in JSON format:
    {
      "isTeamFormationRequest": true/false,
      "isAgentSelectionRequest": true/false,
      "isMapRequest": true/false,
      "isGeneralQuestion": true/false,
      "isInvalid": true/false,
      "confidence": 0.0-1.0
    }
  `;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert at understanding and classifying user queries about Valorant.' },
          { role: 'user', content: classificationPrompt }
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    const result = await response.json();
    try {
      const classification = JSON.parse(result.choices[0].message.content);
      return classification;
    } catch (e) {
      console.error('Error parsing classification response:', e);
      // Default to safe values if parsing fails
      return {
        isTeamFormationRequest: false,
        isAgentSelectionRequest: false,
        isMapRequest: false,
        isGeneralQuestion: true,
        isInvalid: false,
        confidence: 0.5
      };
    }
  } catch (error) {
    console.error('Error classifying prompt:', error);
    // Default to safe values if API call fails
    return {
      isTeamFormationRequest: false,
      isAgentSelectionRequest: false,
      isMapRequest: false,
      isGeneralQuestion: true,
      isInvalid: false,
      confidence: 0.5
    };
  }
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

  try {
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

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const result = await response.json();
    
    try {
      const agentResult = JSON.parse(result.choices[0].message.content);
      return new Response(
        JSON.stringify(agentResult),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (e) {
      console.error('Error parsing OpenAI response:', e);
      // If parsing fails, return the raw text
      return new Response(
        JSON.stringify({ 
          success: true, 
          rawAnalysis: result.choices[0].message.content 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in handleAgentSelection:', error);
    throw error;
  }
}
