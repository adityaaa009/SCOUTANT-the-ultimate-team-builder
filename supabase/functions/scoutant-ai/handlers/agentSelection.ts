import { corsHeaders } from "../cors.ts";

export async function handleAgentSelection(data: { map: string; playerStats?: any; teamComposition?: string[] }, apiKey: string) {
  const { map, playerStats, teamComposition = [] } = data;
  
  if (!map) {
    throw new Error('Map name is required');
  }

  // Check if Google API key is available and valid
  if (!apiKey || apiKey.trim() === '') {
    console.warn("Google API key is not configured or is invalid");
    return generateFallbackAgentResponse(map);
  }

  try {
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
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: prompt }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.3,
          }
        }),
      });

      const result = await response.json();
      
      if (!response.ok || !result.candidates || result.candidates.length === 0) {
        console.error(`Google AI API error: ${JSON.stringify(result.error || 'Unknown error')}`);
        return generateFallbackAgentResponse(map);
      }
      
      try {
        // Extract the response text from the result
        const responseText = result.candidates[0].content.parts[0].text;
        // Parse the JSON from the response text
        const agentResult = JSON.parse(responseText);
        
        return new Response(
          JSON.stringify(agentResult),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (e) {
        console.error("Error parsing Google AI response:", e);
        return generateFallbackAgentResponse(map);
      }
    } catch (error) {
      console.error("Error calling Google AI API:", error);
      return generateFallbackAgentResponse(map);
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
    },
    "Split": {
      recommendations: [
        { agent: "Raze", role: "Duelist", map_effectiveness: 0.95, reason: "Great for clearing tight corners and spaces with utility" },
        { agent: "Omen", role: "Controller", map_effectiveness: 0.93, reason: "Smokes and teleport excellent for map control" },
        { agent: "Cypher", role: "Sentinel", map_effectiveness: 0.92, reason: "Trip wires strong for watching flanks in many choke points" },
        { agent: "Breach", role: "Initiator", map_effectiveness: 0.94, reason: "Stuns and flashes great for tight corridors and site takes" },
        { agent: "Sage", role: "Sentinel", map_effectiveness: 0.91, reason: "Wall can block key pathways particularly at mid and B" }
      ],
      strategyNotes: "Map favors control of middle area. Verticality makes sound cues very important."
    },
    "Fracture": {
      recommendations: [
        { agent: "Neon", role: "Duelist", map_effectiveness: 0.90, reason: "Mobility helps cover the unique layout of the map" },
        { agent: "Brimstone", role: "Controller", map_effectiveness: 0.89, reason: "Smokes help control the many entry points" },
        { agent: "Chamber", role: "Sentinel", map_effectiveness: 0.88, reason: "Teleport great for playing different positions" },
        { agent: "Fade", role: "Initiator", map_effectiveness: 0.92, reason: "Recon abilities help track enemies across the split map" },
        { agent: "KAY/O", role: "Initiator", map_effectiveness: 0.87, reason: "Suppression blade valuable for disabling abilities during pushes" }
      ],
      strategyNotes: "Map requires coordination due to attackers having multiple entry points. Information control is critical."
    },
    "Lotus": {
      recommendations: [
        { agent: "Jett", role: "Duelist", map_effectiveness: 0.88, reason: "Mobility helps navigate through the three-site layout" },
        { agent: "Harbor", role: "Controller", map_effectiveness: 0.90, reason: "Water walls great for blocking sightlines in the circular layout" },
        { agent: "Killjoy", role: "Sentinel", map_effectiveness: 0.89, reason: "Utility helps lock down sites against flanks" },
        { agent: "Skye", role: "Initiator", map_effectiveness: 0.91, reason: "Info gathering crucial for the complex layout" },
        { agent: "Gekko", role: "Initiator", map_effectiveness: 0.86, reason: "Recallable utility good for taking map control" }
      ],
      strategyNotes: "Three sites makes rotation timing crucial. Control of the wheel (mid) area opens up options."
    },
    "Pearl": {
      recommendations: [
        { agent: "Raze", role: "Duelist", map_effectiveness: 0.87, reason: "Utility good for clearing tight urban spaces" },
        { agent: "Astra", role: "Controller", map_effectiveness: 0.93, reason: "Global presence helps control the large mid area" },
        { agent: "Cypher", role: "Sentinel", map_effectiveness: 0.89, reason: "Trip wires strong for watching multiple pathways" },
        { agent: "Fade", role: "Initiator", map_effectiveness: 0.90, reason: "Recon abilities helpful on this multi-level map" },
        { agent: "Sage", role: "Sentinel", map_effectiveness: 0.85, reason: "Wall can block key pathways and divide sites" }
      ],
      strategyNotes: "Mid control important as it connects to both sites. The map has multiple levels that add vertical complexity."
    },
    "Sunset": {
      recommendations: [
        { agent: "Phoenix", role: "Duelist", map_effectiveness: 0.89, reason: "Flashes and wall great for controlling narrow corridors" },
        { agent: "Omen", role: "Controller", map_effectiveness: 0.91, reason: "Smokes and teleport valuable for map control" },
        { agent: "Deadlock", role: "Sentinel", map_effectiveness: 0.87, reason: "Barriers good for controlling the open spaces" },
        { agent: "KAY/O", role: "Initiator", map_effectiveness: 0.90, reason: "Suppression useful in the compact layout" },
        { agent: "Iso", role: "Duelist", map_effectiveness: 0.86, reason: "Abilities good for isolating enemies in key positions" }
      ],
      strategyNotes: "Map layout favors execution-heavy strategies. Coordinated utility usage is important."
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
  
  // Convert to lowercase for case-insensitive comparison
  const mapLower = map.toLowerCase();
  
  // Look for the map in our recommendations
  let recommendations = defaultRecommendations;
  for (const [mapKey, mapData] of Object.entries(mapRecommendations)) {
    if (mapKey.toLowerCase() === mapLower) {
      recommendations = mapData;
      break;
    }
  }
  
  return new Response(
    JSON.stringify({
      success: true,
      is_fallback: true,
      ...recommendations
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
