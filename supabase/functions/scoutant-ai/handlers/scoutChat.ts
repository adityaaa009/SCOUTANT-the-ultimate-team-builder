
import { corsHeaders } from "../cors.ts";

export async function handleScoutChat(data: { prompt: string; chatHistory?: any[] }, apiKey: string) {
  const { prompt, chatHistory = [] } = data;
  
  if (!prompt) {
    throw new Error('No prompt provided');
  }

  // Log the request for debugging
  console.log(`Processing chat request: "${prompt.substring(0, 30)}..."`);
  
  try {
    // If we have a valid Google API key, use it
    if (apiKey && apiKey.trim() !== '') {
      try {
        const apiPrompt = `
          You are an expert Valorant gaming assistant specializing in player analysis, team composition, agent selection, and strategy for competitive play. You are extremely passionate about Valorant and all your knowledge is focused on this game.
          
          Always answer from the perspective of a Valorant expert. If the question is not directly related to Valorant, find a way to connect it to Valorant concepts, strategies, professional players, or the gaming community. Never acknowledge that a topic is outside of Valorant - instead, pivot to relate it to the Valorant universe.
          
          For example:
          - If asked about cooking, relate it to Valorant player diets or tournament catering
          - If asked about history, relate it to the lore and history of Valorant
          - If asked about other games, compare them to Valorant mechanics
          - If asked about math or science, relate it to Valorant game mechanics
          
          User query: "${prompt}"
          
          If the query is about team composition or specific players, format your response as JSON with this structure:
          {
            "type": "team_composition",
            "lineup": [array of player objects with roles],
            "teamAnalysis": "analysis of the team"
          }
          
          If the query is about agent selection for a specific map, format your response as JSON:
          {
            "type": "agent_selection",
            "recommendations": [array of agent recommendations],
            "strategyNotes": "strategy notes for the map"
          }
          
          Otherwise, provide a helpful text response about Valorant or relating the topic to Valorant.
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
                  { text: apiPrompt }
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
          throw new Error(result.error?.message || 'Unknown error');
        }
        
        // Extract the response text from the result
        const responseText = result.candidates[0].content.parts[0].text;
        
        // Try to parse as JSON, if it's in JSON format
        try {
          const jsonResponse = JSON.parse(responseText);
          return new Response(
            JSON.stringify(jsonResponse),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (e) {
          // Not JSON, return as text response
          return new Response(
            JSON.stringify({
              success: true,
              content: responseText,
              type: "text_response"
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (error) {
        console.error("Error calling Google AI:", error);
        // Fall back to predefined responses
        return generateFallbackResponse(prompt);
      }
    } else {
      // No API key, use fallback responses
      return generateFallbackResponse(prompt);
    }
  } catch (error) {
    console.error("Error in handleScoutChat:", error);
    return generateFallbackResponse(prompt, "general_error", error.message);
  }
}

// Generate a team formation response with varied agents
function generateTeamFormationResponse(prompt: string) {
  // Extract any specific team type requests
  const promptLower = prompt.toLowerCase();
  let teamType = "balanced";
  
  if (promptLower.includes("defensive") || promptLower.includes("defense")) {
    teamType = "defensive";
  } else if (promptLower.includes("offensive") || promptLower.includes("attack")) {
    teamType = "offensive";
  }
  
  // Extract map name if present
  let mapName = "";
  const mapNames = ["haven", "bind", "split", "ascent", "icebox", "breeze", "fracture", "pearl", "lotus", "sunset"];
  for (const map of mapNames) {
    if (promptLower.includes(map)) {
      mapName = map.charAt(0).toUpperCase() + map.slice(1);
      break;
    }
  }
  
  // Generate team with varied agents based on team type
  const teamData = generateSpecializedTeam(teamType, mapName);
  
  return new Response(
    JSON.stringify({
      success: true,
      type: "team_composition",
      playerNames: teamData.lineup.map((player: any) => player.name),
      data: teamData,
      mapName: mapName || "various maps"
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Generate team based on type and map
function generateSpecializedTeam(teamType: string, mapName: string = "") {
  const playerNames = ["Chronicle", "nAts", "Aspas", "Zekken", "cNed", "TenZ", "yay", "ScreaM", "Derke", "Boaster", "Shao"];
  const duelist = ["Jett", "Raze", "Reyna", "Phoenix", "Neon", "Iso", "Yoru"];
  const controller = ["Omen", "Brimstone", "Astra", "Viper", "Harbor", "Clove"];
  const sentinel = ["Cypher", "Killjoy", "Chamber", "Sage", "Deadlock"];
  const initiator = ["Sova", "Skye", "Breach", "KAY/O", "Fade", "Gekko"];
  
  // Use different agent distributions based on team type
  let teamComposition: string[][] = [];
  
  if (teamType === "defensive") {
    teamComposition = [
      sentinel, sentinel, controller, initiator, duelist
    ];
  } else if (teamType === "offensive") {
    teamComposition = [
      duelist, duelist, controller, initiator, initiator
    ];
  } else {
    // Balanced team
    teamComposition = [
      duelist, controller, sentinel, initiator, initiator
    ];
  }
  
  // Shuffle the player names
  const shuffledNames = [...playerNames].sort(() => 0.5 - Math.random()).slice(0, 5);
  
  // Track used agents to prevent duplicates
  const usedAgents = new Set();
  
  // Create lineup with different agents for each player
  const lineup = teamComposition.map((agentPool, index) => {
    // Filter out already used agents
    const availableAgents = agentPool.filter(agent => !usedAgents.has(agent));
    
    // Select an agent - if no agents available in this role, try another role
    let selectedAgent: string;
    let selectedAgentPool = availableAgents;
    
    if (availableAgents.length === 0) {
      // Try to find available agents from any other role
      const allAvailableAgents = [
        ...duelist.filter(a => !usedAgents.has(a)),
        ...controller.filter(a => !usedAgents.has(a)),
        ...sentinel.filter(a => !usedAgents.has(a)),
        ...initiator.filter(a => !usedAgents.has(a))
      ];
      
      // If absolutely all agents are used (shouldn't happen with 5 players), reset
      if (allAvailableAgents.length === 0) {
        selectedAgent = agentPool[Math.floor(Math.random() * agentPool.length)];
      } else {
        selectedAgentPool = allAvailableAgents;
        selectedAgent = allAvailableAgents[Math.floor(Math.random() * allAvailableAgents.length)];
      }
    } else {
      selectedAgent = availableAgents[Math.floor(Math.random() * availableAgents.length)];
    }
    
    // Mark agent as used
    usedAgents.add(selectedAgent);
    
    // Determine role based on the agent
    let role;
    if (duelist.includes(selectedAgent)) role = "Duelist";
    else if (controller.includes(selectedAgent)) role = "Controller";
    else if (sentinel.includes(selectedAgent)) role = "Sentinel";
    else role = "Initiator";
    
    return {
      name: shuffledNames[index],
      agent: selectedAgent,
      role: role,
      confidence: parseFloat((0.75 + Math.random() * 0.2).toFixed(2)),
      stats: {
        acs: Math.floor(Math.random() * 80) + 220,
        kd: parseFloat((0.9 + Math.random() * 0.6).toFixed(2)),
        adr: Math.floor(Math.random() * 50) + 130,
        kast: `${Math.floor(Math.random() * 20) + 70}%`
      },
      analysis: `${shuffledNames[index]} is a strong ${role} player with excellent ${selectedAgent} mechanics.`
    };
  });
  
  // Create team analysis based on team type
  let teamAnalysis = "";
  if (teamType === "defensive") {
    teamAnalysis = "This defensive team composition excels at holding sites with multiple sentinels. The utility coverage allows for strong retakes and information gathering.";
  } else if (teamType === "offensive") {
    teamAnalysis = "This aggressive team composition focuses on fast executes and space creation with double duelist setup. The initiators provide excellent support for entries.";
  } else {
    teamAnalysis = "This balanced team composition provides good coverage of all roles, with strong fragging potential while maintaining utility for both attack and defense.";
  }
  
  if (mapName) {
    teamAnalysis += ` This composition is particularly effective on ${mapName}.`;
  }
  
  return {
    success: true,
    lineup: lineup,
    teamAnalysis: teamAnalysis,
    is_fallback: true
  };
}

// Generate a more helpful fallback response based on the prompt content
function generateFallbackResponse(prompt: string, errorType?: string, errorDetails?: string) {
  // Analyze prompt to provide a relevant response
  const promptLower = prompt.toLowerCase();
  
  // Check for non-Valorant topics and respond with Valorant context anyway
  if (isNonValorantTopic(promptLower)) {
    return nonValorantToValorantResponse(promptLower);
  }
  
  // Pattern matching for different Valorant topics
  if (/best (agent|duelist|controller|initiator|sentinel)/i.test(promptLower)) {
    return agentRecommendationResponse(promptLower);
  } else if (/map|haven|bind|ascent|split|breeze|lotus|pearl/i.test(promptLower)) {
    return mapStrategyResponse(promptLower);
  } else if (/player|pro|team|stats|performance/i.test(promptLower)) {
    return playerAnalysisResponse(promptLower);
  } else if (/meta|current|patch|update/i.test(promptLower)) {
    return metaAnalysisResponse(promptLower);
  } else if (/aim|improve|tip|advice|rank up|better/i.test(promptLower)) {
    return improvementTipsResponse(promptLower);
  } else {
    // Default response if no specific topic is detected
    return new Response(
      JSON.stringify({ 
        success: true, 
        content: "As your Valorant analyst, I can provide insights on team compositions, agent selections, player comparisons, and gameplay strategies. For specific information, try asking about particular agents, maps, or professional players. Consider balancing team compositions with different roles for optimal performance.",
        type: "text_response"
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Check if the prompt is about a non-Valorant topic
function isNonValorantTopic(prompt: string): boolean {
  const valorantKeywords = [
    "valorant", "agent", "duelist", "controller", "sentinel", "initiator", 
    "jett", "raze", "omen", "viper", "cypher", "killjoy", "chamber", "sage", 
    "sova", "skye", "breach", "phoenix", "reyna", "neon", "harbor", "astra", 
    "kay/o", "fade", "gekko", "iso", "clove", "team", "comp", "composition", 
    "map", "haven", "bind", "split", "ascent", "icebox", "breeze", "fracture", 
    "pearl", "lotus", "sunset", "spike", "plant", "defuse", "ult", "ultimate", 
    "ability", "tournament", "vct", "rank", "radiant", "immortal", "diamond", 
    "platinum", "gold", "silver", "bronze", "iron"
  ];
  
  return !valorantKeywords.some(keyword => prompt.includes(keyword));
}

// Transform non-Valorant topics into Valorant context
function nonValorantToValorantResponse(prompt: string) {
  // Categories to respond to with Valorant context
  const topics = {
    "food|cooking|recipe|meal|eat|drink|restaurant": "In the Valorant community, many pro players maintain strict diets to enhance their performance. For example, TenZ has mentioned his diet regimen during tournament preparation. Proper nutrition and hydration are crucial for maintaining focus during long matches. At major Valorant events like VCT, players often have specialized meal plans to optimize their performance.",
    
    "weather|climate|temperature|rain|snow|forecast": "Weather conditions don't affect Valorant gameplay directly since it's an indoor esport, but many maps feature different environmental themes. Haven has a warm, middle-eastern climate, while Icebox features harsh winter conditions. Players often report that their setup and performance can be affected by room temperature - many pros prefer cooler environments for better focus during intense clutch moments.",
    
    "history|ancient|medieval|war|civilization": "Valorant's lore includes a rich history about the First Light event and the emergence of Radiants. The Kingdom Corporation's experiments and the formation of the VALORANT Protocol form a complex historical narrative. Different agents come from various historical and cultural backgrounds, like Cypher from Morocco or Sage from China, bringing diverse historical influences into the game.",
    
    "math|calculation|equation|number|statistics": "Valorant is deeply mathematical! Players constantly calculate economy (eco) rounds, damage statistics, and utility usage efficiency. The difference between a 150 and 151 damage output can determine if an enemy is eliminated. Pro analysts use advanced statistics like ACS (Average Combat Score), KAST (Kill/Assist/Survive/Trade) percentage, and first blood percentage to evaluate player performance.",
    
    "movie|film|show|actor|director|hollywood": "While Valorant doesn't have a movie (yet), its cinematic trailers like 'Duality' and character reveal videos showcase incredible storytelling. Many Valorant pro players and streamers are huge personalities in their own right, with TenZ, Shroud and others becoming celebrities in the gaming world. Some players like Asuna or Sinatraa have been called the 'main characters' of competitive matches due to their highlight-worthy plays.",
    
    "music|song|band|concert|album|genre": "Music plays an important role in Valorant gameplay, with sound cues being critical for locating enemies. Many pro players have specific playlists they use while training. The game itself features dynamic music that intensifies during clutch situations. The community often discusses which agent would listen to which music genres - with Raze likely enjoying energetic beats while Cypher might prefer mysterious ambient tracks.",
    
    "politics|government|election|president|policy": "The politics of Valorant exist within its lore, where the world is divided between Kingdom Corporation's influence and the secretive VALORANT Protocol. Different agents represent various nations and ideologies, creating a complex geopolitical environment. In the competitive scene, regional rivalries (like NA vs EU vs KR) create their own form of 'political' discussions about which region has the best players and strategies.",
    
    "travel|vacation|hotel|flight|tourism": "Valorant's global map pool takes players on a virtual world tour - from the bells of Ascent in Italy to the cherry blossoms of Split in Tokyo. Professional Valorant players are true world travelers, competing in tournaments across the globe in cities like Berlin, Reykjavik, and Istanbul. Each map offers unique 'tourism' opportunities through its detailed environmental storytelling.",
    
    "sport|basketball|football|soccer|tennis|athlete": "Valorant is one of the fastest growing esports in the world! Like traditional sports, it requires incredible reaction time, hand-eye coordination, and strategic teamwork. Many former professional athletes from traditional sports have become Valorant players or fans. The VCT (Valorant Champions Tour) is structured similarly to traditional sports leagues, with regional qualifiers leading to international championships."
  };
  
  // Find matching category
  let response = "As a Valorant expert, I focus on helping players improve their gameplay, understand team compositions, and master agent abilities. Valorant is a 5v5 tactical shooter where precise gunplay meets unique agent abilities. Let me know what aspects of Valorant you'd like to explore - from professional strategies to beginner tips!";
  
  for (const [keywords, answer] of Object.entries(topics)) {
    if (new RegExp(keywords, 'i').test(prompt)) {
      response = answer;
      break;
    }
  }
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      content: response,
      type: "text_response"
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function agentRecommendationResponse(prompt: string) {
  let responseContent = "";
  
  // Check for specific agent roles
  if (prompt.includes("duelist")) {
    responseContent = "The strongest duelists in the current meta are Jett and Raze. Jett excels on maps with vertical play and Operator opportunities like Ascent and Breeze. Raze is dominant on maps with tight spaces like Split and Bind. Phoenix and Neon are solid alternatives with self-sufficient utility.";
  } else if (prompt.includes("controller")) {
    responseContent = "Omen is currently the most versatile controller with global smoke placement and repositioning ability. Astra offers excellent site control and utility for coordinated teams. Viper is essential on larger maps like Breeze and Icebox. Brimstone provides precise execute potential with his stim beacon and ultimate.";
  } else if (prompt.includes("sentinel")) {
    responseContent = "Chamber has been the dominant sentinel with his teleport and Operator capabilities, though recent nerfs have balanced him. Killjoy offers excellent site anchoring and post-plant utility. Cypher provides valuable information gathering. Sage remains valuable for her wall and healing abilities.";
  } else if (prompt.includes("initiator")) {
    responseContent = "Fade has become one of the strongest initiators with her multi-target reveal and disruptive utility. Sova remains essential on open maps for his recon abilities. Skye provides team healing and flash utility. KAY/O's suppress ability is powerful against utility-dependent compositions.";
  } else {
    // General agent recommendation
    responseContent = "The current agent meta favors flexible compositions with strong controllers and information-gathering initiators. Top-tier agents include:\n\n" +
      "- Duelists: Jett, Raze\n" +
      "- Controllers: Omen, Astra, Viper (map-dependent)\n" +
      "- Sentinels: Chamber, Killjoy\n" +
      "- Initiators: Fade, Sova, Skye\n\n" +
      "Agent selection should be map-dependent and balance team composition needs.";
  }
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      content: responseContent,
      type: "text_response"
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function mapStrategyResponse(prompt: string) {
  let mapContent = "";
  
  // Check for specific maps
  if (prompt.includes("ascent")) {
    mapContent = "Ascent favors mid control which opens options to both sites. A standard composition includes Jett, Omen, Killjoy, Fade, and Chamber. Killjoy is excellent for B site anchoring, while Operator agents can hold A main and mid. Focus on establishing control of mid, catwalk, and market for rotational advantage.";
  } else if (prompt.includes("bind")) {
    mapContent = "Bind's unique teleporters create rotation challenges. Raze excels for clearing tight spaces like hookah and bathroom. Brimstone provides precise smoke execution. Cypher helps watch flanks on this map with many paths. Double controller setups with Brimstone and Viper can be effective for site executes.";
  } else if (prompt.includes("haven")) {
    mapContent = "Haven is the only map with three sites, making information gathering and fast rotations crucial. Astra can control multiple areas simultaneously. Phoenix and Breach work well in the long corridors. Killjoy is strong for holding C site. Prioritize mid control to enable faster rotations between sites.";
  } else if (prompt.includes("breeze")) {
    mapContent = "Breeze's large open spaces favor long-range engagements. Jett and Chamber excel with the Operator. Viper is almost mandatory for splitting sites with her wall. Sova provides crucial recon information. Focus on controlling mid and halls for rotational advantage.";
  } else if (prompt.includes("split")) {
    mapContent = "Split features narrow corridors and verticality. Raze and Breach excel in tight spaces. Sage's wall is crucial for mid control. Cypher and Omen provide strong utility for site control. Focus on establishing mid control to squeeze sites from multiple angles.";
  } else {
    // General map strategy
    mapContent = "Each Valorant map requires specific agent compositions and strategies. Focus on controlling key areas that enable rotation options. For attacking, establish a default setup to gather information before committing. For defending, establish crossfires and use utility to delay pushes. Agent selection should complement the map's unique features.";
  }
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      content: mapContent,
      type: "text_response"
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function playerAnalysisResponse(prompt: string) {
  let playerContent = "";
  
  // Check for specific players
  if (prompt.includes("tenz")) {
    playerContent = "TenZ is known for his exceptional mechanical skill and movement. He excels on duelists like Jett and has some of the highest ACS (250+) and KD ratios (1.2+) in professional play. His aggressive playstyle makes him an excellent entry fragger, though sometimes at the cost of consistency.";
  } else if (prompt.includes("yay")) {
    playerContent = "yay (El Diablo) is regarded as one of the most consistent players with exceptional Operator play. He maintains a high headshot percentage (25-30%) and KD ratio (1.3+). He's versatile across agents but particularly excels on Chamber and Jett.";
  } else if (prompt.includes("nats")) {
    playerContent = "nAts is known for his exceptional lurking and clutch capabilities. He excels on sentinels like Cypher and Killjoy, maintaining high impact with smart positioning rather than pure aim duels. His utility usage is considered among the best for sentinel players.";
  } else {
    // General player analysis
    playerContent = "Professional Valorant players are evaluated based on several key metrics:\n\n" +
      "- ACS (Average Combat Score): Measures overall impact, with 250+ considered excellent\n" +
      "- KD Ratio: Kill-to-death ratio, with 1.2+ considered strong\n" +
      "- ADR (Average Damage per Round): 160+ is considered high impact\n" +
      "- KAST%: Percentage of rounds with a Kill, Assist, Survival, or Trade\n" +
      "- First Blood %: Success rate on opening duels\n\n" +
      "Top players typically specialize in specific agent roles while maintaining flexibility for team needs.";
  }
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      content: playerContent,
      type: "text_response"
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function metaAnalysisResponse(prompt: string) {
  const metaContent = "The current Valorant meta favors balanced compositions with strong controller presence. Key trends include:\n\n" +
    "- Double controller setups on certain maps for enhanced smoke coverage\n" +
    "- Initiator-heavy compositions for better information gathering\n" +
    "- Fade has risen in popularity as a strong alternative to Sova\n" +
    "- Chamber remains strong but more balanced after recent nerfs\n" +
    "- Map-specific agent selections, particularly for controllers\n\n" +
    "Teams are focusing on utility-heavy executes and post-plant setups rather than pure aim duels.";
    
  return new Response(
    JSON.stringify({ 
      success: true, 
      content: metaContent,
      type: "text_response"
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function improvementTipsResponse(prompt: string) {
  const tipsContent = "To improve your Valorant gameplay:\n\n" +
    "1. **Aim Improvement**\n" +
    "   - Practice crosshair placement at head level\n" +
    "   - Use aim trainers like Aimlabs or Kovaak's daily\n" +
    "   - Play deathmatch focusing on precision over speed\n\n" +
    "2. **Game Sense**\n" +
    "   - Learn common angles and pre-aim positions\n" +
    "   - Develop awareness of the minimap and team economy\n" +
    "   - Study professional gameplay for positioning\n\n" +
    "3. **Communication**\n" +
    "   - Make concise callouts with location and damage\n" +
    "   - Coordinate utility usage with teammates\n\n" +
    "4. **Agent Mastery**\n" +
    "   - Focus on 2-3 agents across different roles\n" +
    "   - Learn lineup positions for specific utility\n\n" +
    "5. **VOD Review**\n" +
    "   - Review your gameplay to identify mistakes\n" +
    "   - Analyze professional matches for strategic insights";
    
  return new Response(
    JSON.stringify({ 
      success: true, 
      content: tipsContent,
      type: "text_response"
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
