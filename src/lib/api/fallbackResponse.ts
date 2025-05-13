
import { recommendTeamComposition } from "../playerAnalysis";

/**
 * Generate a text-based response for prompts that don't involve player analysis
 */
export function generateFallbackResponse(prompt: string, playersData?: any[]) {
  const defaultResponses = [
    "I'm having trouble processing your request. Could you rephrase that?",
    "Sorry, I couldn't generate a detailed response right now.",
    "My AI assistant is currently experiencing some difficulties."
  ];

  const randomResponse = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];

  if (playersData && playersData.length > 0) {
    const recommendation = recommendTeamComposition(playersData);
    return {
      success: true,
      type: "text_response",
      content: `${randomResponse}\n\nHowever, here's a basic team recommendation based on available data:\n${JSON.stringify(recommendation, null, 2)}`
    };
  }

  return {
    success: true,
    type: "text_response",
    content: randomResponse
  };
}
