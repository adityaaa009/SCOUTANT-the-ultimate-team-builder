
/**
 * Fetch AI response from Supabase Edge Function
 */
export async function fetchScoutantResponse(prompt: string): Promise<any> {
  try {
    const response = await fetch(
      "https://your-supabase-url/functions/v1/scoutant-gemini",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching Scoutant response:", error);
    return { error: error.message };
  }
}
