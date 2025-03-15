
/**
 * Fetch AI response from Supabase Edge Function
 */
export async function fetchScoutantResponse(prompt: string) {
  try {
    const response = await fetch("https://your-supabase-url/functions/v1/scoutant-gemini", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" // Optional for CORS
      },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      console.error("Error fetching response:", response.status);
      return { error: "Failed to get a response", status: response.status };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in fetchScoutantResponse:", error);
    return { error: "Failed to connect to AI service" };
  }
}
