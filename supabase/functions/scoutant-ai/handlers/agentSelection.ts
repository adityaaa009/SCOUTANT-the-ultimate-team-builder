
import { corsHeaders } from "../cors.ts";

export async function handleAgentSelection(data: { map: string; playerStats?: any; teamComposition?: string[] }, apiKey: string) {
  const { map, playerStats, teamComposition = [] } = data;
  
  if (!map) {
    throw new Error('Map name is required');
  }

  // Check if OpenAI API key is available and valid
  if (!apiKey || apiKey.trim() === '') {
    console.warn("OpenAI API key is not configured or is invalid");
    return generateFallbackAgentResponse(map);
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

    const result = await response.json();
    
    if (!response.ok) {
      console.error(`OpenAI API error: ${JSON.stringify(result.error)}`);
      
      // Check specifically for quota exceeded error
      if (result.error?.type === "insufficient_quota" || 
          result.error?.message?.includes("exceeded your current quota")) {
        return generateFallbackAgentResponse(map);
      }
      
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
  } catch (error) {
    console.error("Error in handleAgentSelection:", error);
    return generateFallbackAgentResponse(map);
  }
}

function generateFallbackAgentResponse(map: string) {
  // Predefined agent recommendations for each map
  const mapRecommendations: Record<string, any> = {
    "Ascent": {
      recommendations: [
        { agent: "Jett", role: "Duelist", map_effectiveness: 0.92, reason: "Great mobility for mid control and OPing from market or A main" },
        { agent: "Omen", role: "Controller", map_effectiveness: 0.90, reason: "Strong smokes for mid control and site executes" },
        { agent: "Killjoy", role: "Sentinel", map_effectiveness: 0.95, reason: "Excellent for site lockdown, especially on B site" },
        { agent: "Fade", role: "Initiator", map_effectiveness: 0.85, reason: "Strong recon abilities for clearing site corners" },
        { agent: "Chamber", role: "Sentinel", map_effectiveness: 0.88, reason: "Effective at holding angles and providing info" }
      ],
      strategyNotes: "Focus on mid control which opens up options to both sites. Sentinel anchoring B is crucial."
    },
    "Bind": {
      recommendations: [
        { agent: "Raze", role: "Duelist", map_effectiveness: 0.94, reason: "Grenade and Boombot are perfect for close quarters and clearing hookah/bathroom" },
        { agent: "Brimstone", role: "Controller", map_effectiveness: 0.92, reason: "Precise smokes for site executes and post-plant situations" },
        { agent: "Cypher", role: "Sentinel", map_effectiveness: 0.90, reason: "Trip wires excellent for flank watch on this map with many paths" },
        { agent: "Skye", role: "Initiator", map_effectiveness: 0.89, reason: "Flash and scout information through tight corridors" },
        { agent: "Viper", role: "Controller", map_effectiveness: 0.87, reason: "Wall can effectively split sites for executes" }
      ],
      strategyNotes: "Map favors utility to clear tight spaces. Double controller can be strong for executes."
    },
    "Haven": {
      recommendations: [
        { agent: "Phoenix", role: "Duelist", map_effectiveness: 0.87, reason: "Flashes and wall are great for taking map control" },
        { agent: "Astra", role: "Controller", map_effectiveness: 0.93, reason: "Global presence helps control all three sites simultaneously" },
        { agent: "Killjoy", role: "Sentinel", map_effectiveness: 0.89, reason: "Strong for holding C site and delaying pushes" },
        { agent: "Breach", role: "Initiator", map_effectiveness: 0.90, reason: "Long corridors perfect for flashes and stuns" },
        { agent: "Jett", role: "Duelist", map_effectiveness: 0.88, reason: "Mobility to rotate quickly between the three sites" }
      ],
      strategyNotes: "With three sites, mid control and fast rotations are essential. Prioritize information gathering."
    },
    "Breeze": {
      recommendations: [
        { agent: "Jett", role: "Duelist", map_effectiveness: 0.96, reason: "Dash provides mobility across large open areas" },
        { agent: "Viper", role: "Controller", map_effectiveness: 0.97, reason: "Wall is essential for splitting large sites" },
        { agent: "Chamber", role: "Sentinel", map_effectiveness: 0.95, reason: "Teleport great for playing angles, trap for flank watch" },
        { agent: "Sova", role: "Initiator", map_effectiveness: 0.94, reason: "Recon dart excellent on large, open sites" },
        { agent: "Fade", role: "Initiator", map_effectiveness: 0.88, reason: "Haunt good for revealing multiple enemies on large sites" }
      ],
      strategyNotes: "Map favors long-range engagements. Viper is almost mandatory for site executes."
    }
  };
  
  // Default recommendations if the map isn't in our predefined list
  const defaultRecommendations = {
    recommendations: [
      { agent: "Omen", role: "Controller", map_effectiveness: 0.85, reason: "Versatile controller that works on most maps" },
      { agent: "Jett", role: "Duelist", map_effectiveness: 0.83, reason: "Mobility makes her effective on most maps" },
      { agent: "Killjoy", role: "Sentinel", map_effectiveness: 0.82, reason: "Strong site anchor on most maps" },
      { agent: "Skye", role: "Initiator", map_effectiveness: 0.84, reason: "Information gathering and flashes useful everywhere" },
      { agent: "Sage", role: "Sentinel", map_effectiveness: 0.81, reason: "Healing and wall provide value on any map" }
    ],
    strategyNotes: "This is a balanced team composition that should be effective on most maps."
  };
  
  const recommendations = mapRecommendations[map] || defaultRecommendations;
  
  return new Response(
    JSON.stringify({
      success: true,
      is_fallback: true,
      ...recommendations
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
