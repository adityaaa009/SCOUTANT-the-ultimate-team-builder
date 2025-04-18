
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
