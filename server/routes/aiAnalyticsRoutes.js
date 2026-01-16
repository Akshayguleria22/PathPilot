import express from "express";
import { protect } from "../middleware/auth.js";
import { getLLMResponse } from "../services/llmService.js";

const router = express.Router();

router.post("/behavior-insights", protect, async (req, res) => {
    try {
        const { weeklySummary, habits } = req.body;

        const prompt = `
You are a behavioral analytics AI.

Weekly summary:
${JSON.stringify(weeklySummary)}

Daily habits (last 7 days):
${JSON.stringify(habits)}

Tasks:
1. Identify positive trends
2. Identify negative patterns
3. Detect burnout or inconsistency
4. Suggest ONE improvement for next week

Return STRICT JSON:
{
  "positive_trends": [string],
  "risk_factors": [string],
  "burnout_risk": "low" | "medium" | "high",
  "next_week_focus": string
}
`;

        const response = await getLLMResponse(prompt);
        const parsedResponse = JSON.parse(response);

        // Validate response structure
        if (!parsedResponse.burnout_risk || !parsedResponse.positive_trends || !parsedResponse.risk_factors) {
            console.error("Invalid AI response structure:", parsedResponse);
            throw new Error("Invalid AI response format");
        }

        res.json(parsedResponse);
    } catch (err) {
        console.error("Analytics AI error:", err.message);

        // Send a proper error response instead of partial data
        res.status(500).json({
            message: "Analytics AI failed",
            error: process.env.NODE_ENV === 'development' ? err.message : "AI service temporarily unavailable",
            // Don't send invalid data that would crash the frontend
        });
    }
});

export default router;
