import { getLLMResponse } from "./llmService.js";

export const generateRoadmap = async (courseName) => {
    try {
        if (!process.env.GROQ_API_KEY) {
            throw new Error("AI service unavailable: GROQ_API_KEY not configured");
        }

        const prompt = `
You are an expert learning architect.

Create a structured learning roadmap for:
Course: ${courseName}
Level: beginner

Return ONLY valid JSON:
{
  "steps": [
    {
      "title": "",
      "description": "",
      "difficulty": "beginner|intermediate|advanced",
      "estimatedHours": number,
      "topics": []
    }
  ]
}
No explanations. No markdown.
`;

        console.log(`🔄 Generating roadmap for: "${courseName}"`);

        const content = await getLLMResponse(prompt);
        console.log("✅ Received response from GROQ");

        // Parse and validate JSON
        const result = JSON.parse(content);

        if (!result.steps || !Array.isArray(result.steps)) {
            console.error("⚠️  Invalid response format: missing 'steps' field");
            throw new Error("Invalid AI response format");
        }

        console.log(`✅ Successfully generated roadmap with ${result.steps.length} steps`);
        return result;
    } catch (error) {
        console.error(`❌ Error generating roadmap: ${error.message}`);
        throw error;
    }
};
