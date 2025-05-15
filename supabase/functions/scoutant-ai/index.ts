
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

    // Log the action and basic info about the request
    console.log(`Processing action: ${action}`);

    // Check for API key and log appropriate warning
    if (!OPENAI_API_KEY) {
      console.warn('OpenAI API key is not configured');
    }

    // Handle different actions
    switch (action) {
      case 'analyze_players':
        return await handlePlayerAnalysis(data, OPENAI_API_KEY || '');
      case 'scout_chat':
        return await handleScoutChat(data, OPENAI_API_KEY || '');
      case 'agent_selection':
        return await handleAgentSelection(data, OPENAI_API_KEY || '');
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
        content: `An error occurred while processing your request. Please try again with a different query or check back later.`
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
