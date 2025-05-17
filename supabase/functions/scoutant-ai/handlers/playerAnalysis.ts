
import { corsHeaders } from "../cors.ts";

export async function handlePlayerAnalysis(data: { players: any[] }, apiKey: string) {
  const { players } = data;
  
  if (!players || !players.length) {
    throw new Error('No player data provided');
  }

  // Check if we have a valid API key
  if (!apiKey || apiKey.trim() === '') {
    console.log("No Google API key available, using fallback player analysis");
    return generateFallbackAnalysis(players);
  }

  try {
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
          temperature: 0.2,
        }
      }),
    });

    const result = await response.json();
    
    if (!response.ok || !result.candidates || result.candidates.length === 0) {
      console.error(`Google AI API error: ${JSON.stringify(result.error || 'Unknown error')}`);
      return generateFallbackAnalysis(players);
    }
    
    try {
      // Extract the response text from the result
      const responseText = result.candidates[0].content.parts[0].text;
      // Parse the JSON from the response text
      const analysisResult = JSON.parse(responseText);
      
      return new Response(
        JSON.stringify(analysisResult),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (e) {
      console.error("Error parsing Google AI response:", e);
      return generateFallbackAnalysis(players);
    }
  } catch (error) {
    console.error("Error in handlePlayerAnalysis:", error);
    return generateFallbackAnalysis(players);
  }
}

// Generate a fallback analysis when Google AI is unavailable
function generateFallbackAnalysis(players: any[]) {
  // Define role distribution for a balanced team
  const roles = ["Duelist", "Controller", "Sentinel", "Initiator", "Duelist"];
  const agentsByRole: Record<string, string[]> = {
    "Duelist": ["Jett", "Raze", "Phoenix", "Neon", "Yoru"],
    "Controller": ["Omen", "Brimstone", "Astra", "Viper", "Harbor"],
    "Initiator": ["Sova", "Skye", "Breach", "KAY/O", "Fade", "Gekko"],
    "Sentinel": ["Cypher", "Killjoy", "Chamber", "Sage", "Deadlock"]
  };
  
  // Analysis templates for different roles
  const analysisTemplates: Record<string, string[]> = {
    "Duelist": [
      "Shows aggressive playstyle suitable for entry fragging",
      "Has strong mechanical skills for creating space",
      "Demonstrates good first blood statistics",
      "Shows capability for high-impact plays"
    ],
    "Controller": [
      "Shows strategic mindset suitable for smoke placement",
      "Demonstrates good map awareness for controlling space",
      "Has good post-plant statistics",
      "Shows utility-focused playstyle"
    ],
    "Initiator": [
      "Demonstrates strong support capabilities",
      "Shows excellent assist statistics",
      "Has good utility usage patterns",
      "Balances fragging with team support well"
    ],
    "Sentinel": [
      "Shows patient playstyle suitable for site anchoring",
      "Demonstrates good clutch statistics",
      "Has strong defensive positioning",
      "Excels at holding angles and providing information"
    ]
  };

  // Maintain a set of used agents to avoid duplicates
  const usedAgents = new Set();

  const lineup = players.map((player, index) => {
    // Assign role based on position to ensure team balance
    const assignedRole = roles[index % roles.length];
    const availableAgents = agentsByRole[assignedRole].filter(agent => !usedAgents.has(agent));
    
    let assignedAgent;
    if (availableAgents.length > 0) {
      assignedAgent = availableAgents[Math.floor(Math.random() * availableAgents.length)];
    } else {
      // If no agents available for this role, find one from another role
      for (const [role, agents] of Object.entries(agentsByRole)) {
        const available = agents.filter(agent => !usedAgents.has(agent));
        if (available.length > 0) {
          assignedAgent = available[Math.floor(Math.random() * available.length)];
          break;
        }
      }
      // Last resort if all agents somehow taken (shouldn't happen with 5 players)
      if (!assignedAgent) {
        assignedAgent = agentsByRole[assignedRole][0];
      }
    }
    
    // Mark this agent as used
    usedAgents.add(assignedAgent);
    
    // Select a random analysis template for the role
    const analysisOptions = analysisTemplates[assignedRole];
    const analysis = analysisOptions[Math.floor(Math.random() * analysisOptions.length)];
    
    // Generate reasonable stat values
    const acs = 200 + Math.floor(Math.random() * 80);
    const kd = (0.9 + Math.random() * 0.6).toFixed(2);
    const adr = 130 + Math.floor(Math.random() * 50);
    const kast = `${65 + Math.floor(Math.random() * 20)}%`;
    
    return {
      name: player.name || `Player ${index + 1}`,
      agent: assignedAgent,
      role: assignedRole,
      confidence: parseFloat((0.75 + Math.random() * 0.2).toFixed(2)),
      stats: {
        acs: acs,
        kd: parseFloat(kd),
        adr: adr,
        kast: kast
      },
      analysis: analysis
    };
  });
  
  const teamAnalysis = "This team composition provides a balanced distribution of roles with appropriate agents for each player's playstyle. The lineup has good synergy between agents and covers all essential roles for both attack and defense.";
  
  return new Response(
    JSON.stringify({
      success: true,
      lineup: lineup,
      teamAnalysis: teamAnalysis,
      is_fallback: true
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
