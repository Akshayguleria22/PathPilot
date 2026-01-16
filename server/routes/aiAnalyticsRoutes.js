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
        res.json(JSON.parse(response));
    } catch (err) {
        res.status(500).json({ message: "Analytics AI failed" });
    }
});

export default router;
