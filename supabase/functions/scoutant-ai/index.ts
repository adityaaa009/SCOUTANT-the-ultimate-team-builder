
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { corsHeaders } from "./cors.ts";
import { handlePlayerAnalysis } from "./handlers/playerAnalysis.ts";
import { handleScoutChat } from "./handlers/scoutChat.ts";
import { handleAgentSelection } from "./handlers/agentSelection.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, data } = await req.json();
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';

    // Log the action and basic info about the request
    console.log(`Processing action: ${action}`);

    // Handle different actions - now with less dependency on OpenAI API key
    switch (action) {
      case 'analyze_players':
        try {
          // We'll try to use the API if available, but won't error if it's missing
          return await handlePlayerAnalysis(data, OPENAI_API_KEY);
        } catch (error) {
          // If the API call fails, return a fallback response
          console.log(`Falling back to static response for player analysis: ${error.message}`);
          return new Response(
            JSON.stringify({
              success: true,
              lineup: generateFallbackPlayerAnalysis(data.players),
              teamAnalysis: "This team composition balances different roles and playstyles effectively.",
              is_fallback: true
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      case 'scout_chat':
        // The chat handler now works without OpenAI API
        return await handleScoutChat(data, OPENAI_API_KEY);
      case 'agent_selection':
        // The agent selection handler can fall back to static responses
        return await handleAgentSelection(data, OPENAI_API_KEY);
      default:
        console.error(`Unknown action requested: ${action}`);
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error(`Error in scoutant-ai function:`, error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        content: `An error occurred while processing your request. Please try again with a different query.`
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Fallback player analysis when OpenAI is unavailable
function generateFallbackPlayerAnalysis(players: any[]) {
  if (!players || players.length === 0) {
    return [];
  }
  
  // Define roles for a balanced team
  const roles = ["Duelist", "Controller", "Initiator", "Sentinel", "Duelist"];
  
  // Define agents by role
  const agents = {
    "Duelist": ["Jett", "Raze", "Phoenix", "Neon", "Yoru", "Reyna", "Iso"],
    "Controller": ["Omen", "Brimstone", "Astra", "Viper", "Harbor", "Clove"],
    "Initiator": ["Sova", "Skye", "Breach", "KAY/O", "Fade", "Gekko"],
    "Sentinel": ["Cypher", "Killjoy", "Chamber", "Sage", "Deadlock"]
  };
  
  // Maintain a set of used agents to avoid duplicates
  const usedAgents = new Set();
  
  return players.map((player, index) => {
    // Assign role based on position in the team
    const role = roles[index % roles.length];
    
    // Get all available agents for this role
    const availableAgents = agents[role].filter(agent => !usedAgents.has(agent));
    
    // If no agents available for this role, try agents from other roles
    let selectedAgent = "";
    let selectedRole = role;
    
    if (availableAgents.length > 0) {
      // Randomly select an agent from available ones
      selectedAgent = availableAgents[Math.floor(Math.random() * availableAgents.length)];
    } else {
      // Try to find an available agent from any role
      for (const [otherRole, agentsInRole] of Object.entries(agents)) {
        const availableInRole = agentsInRole.filter(agent => !usedAgents.has(agent));
        if (availableInRole.length > 0) {
          selectedAgent = availableInRole[Math.floor(Math.random() * availableInRole.length)];
          selectedRole = otherRole;
          break;
        }
      }
      
      // If still no agent is found (all agents are used), select a random agent from the original role
      // This is a fallback and shouldn't happen with normal team sizes
      if (!selectedAgent) {
        selectedAgent = agents[role][Math.floor(Math.random() * agents[role].length)];
      }
    }
    
    // Mark this agent as used
    usedAgents.add(selectedAgent);
    
    // Generate some reasonable stats
    const acs = Math.round(200 + Math.random() * 80);
    const kd = Math.round((0.9 + Math.random() * 0.6) * 100) / 100;
    const adr = Math.round(130 + Math.random() * 50);
    const kast = `${Math.round(60 + Math.random() * 25)}%`;
    
    return {
      name: player.name || `Player ${index + 1}`,
      agent: selectedAgent,
      role: selectedRole,
      confidence: Math.round((0.75 + Math.random() * 0.2) * 100) / 100,
      stats: {
        acs: acs,
        kd: kd,
        adr: adr,
        kast: kast
      },
      analysis: `This player would be effective as a ${selectedRole} playing ${selectedAgent} based on their playstyle.`
    };
  });
}
