
import { corsHeaders } from "../cors.ts";

export async function handleScoutChat(data: { prompt: string; chatHistory?: any[] }, apiKey: string) {
  const { prompt, chatHistory = [] } = data;
  
  if (!prompt) {
    throw new Error('No prompt provided');
  }

  // Log the request for debugging
  console.log(`Processing chat request: "${prompt.substring(0, 30)}..."`);
  
  try {
    // Skip OpenAI API call and generate fallback response directly
    return generateFallbackResponse(prompt);
  } catch (error) {
    console.error("Error in handleScoutChat:", error);
    return generateFallbackResponse(prompt, "general_error", error.message);
  }
}

// Generate a more helpful fallback response based on the prompt content
function generateFallbackResponse(prompt: string, errorType?: string, errorDetails?: string) {
  // Analyze prompt to provide a relevant response
  const promptLower = prompt.toLowerCase();
  
  // Pattern matching for different Valorant topics
  if (/best (agent|duelist|controller|initiator|sentinel)/i.test(promptLower)) {
    return agentRecommendationResponse(promptLower);
  } else if (/map|haven|bind|ascent|split|breeze|lotus|pearl|sunset/i.test(promptLower)) {
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
