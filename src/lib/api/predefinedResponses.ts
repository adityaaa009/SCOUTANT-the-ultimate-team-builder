
/**
 * Check if the prompt matches any predefined responses
 */
export function checkForPredefinedResponses(prompt: string): any | null {
  const promptLower = prompt.toLowerCase().trim();
  
  // Map of predefined prompts to responses
  const predefinedPrompts: Record<string, any> = {
    "give me a team with crazy stats": {
      success: true,
      type: "text_response",
      content: "Here's a team recommendation with impressive skillset."
    },
    "give me a team recommendation that's good at defense": {
      success: true,
      type: "text_response",
      content: "Here's the best team for playing defensive."
    }
  };
  
  // Check if we have an exact match
  if (predefinedPrompts[promptLower]) {
    return predefinedPrompts[promptLower];
  }
  
  // Check for close matches (startsWith, includes, etc.)
  for (const [key, response] of Object.entries(predefinedPrompts)) {
    if (promptLower.includes(key) || key.includes(promptLower)) {
      return response;
    }
  }
  
  return null;
}
