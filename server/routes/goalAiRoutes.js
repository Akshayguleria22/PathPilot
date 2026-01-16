import express from "express";
import { protect } from "../middleware/auth.js";
import Course from "../models/Course.js";
import Habit from "../models/Habit.js";
import { getLLMResponse } from "../services/llmService.js";

const router = express.Router();

router.post("/goal-adjustments", protect, async (req, res) => {
    console.log("🎯 Goal Adjustments endpoint HIT in goalAiRoutes!");
    
    try {
        const userId = req.user._id;
        console.log("User ID:", userId);
        
        const courses = await Course.find({ userId });
        console.log("Courses found:", courses.length);
        
        if (courses.length === 0) {
            return res.json({
                courseAdjustments: [],
                habitAdjustments: {
                    sleepTarget: null,
                    studyTarget: null,
                    reason: "No courses found to optimize"
                },
                overallAdvice: "Add some courses first to get personalized goal recommendations!"
            });
        }
        
        const habits = await Habit.find({ userId })
            .sort({ date: -1 })
            .limit(14);
        
        console.log("Habits found:", habits.length);

        // Calculate averages
        const avgStudyTime = habits.length > 0
            ? habits.reduce((acc, h) => acc + (h.study || 0), 0) / habits.length
            : 0;
        const avgSleep = habits.length > 0
            ? habits.reduce((acc, h) => acc + (h.sleep || 0), 0) / habits.length
            : 0;
        const avgStress = habits.length > 0
            ? habits.reduce((acc, h) => acc + (h.stress || 0), 0) / habits.length
            : 0;

        console.log("Averages - Study:", avgStudyTime, "Sleep:", avgSleep, "Stress:", avgStress);

        const prompt = `You are an AI learning optimization coach. Analyze the student's data and propose goal adjustments.

IMPORTANT: You can ONLY propose adjustments, never apply them directly. Users must approve all changes.

Current Courses:
${JSON.stringify(courses.map(c => ({
    id: c._id,
    name: c.name,
    category: c.category,
    targetHours: c.targetHours,
    progress: c.progress
})), null, 2)}

Recent Performance (last 14 days):
- Average daily study time: ${avgStudyTime.toFixed(1)} hours
- Average sleep: ${avgSleep.toFixed(1)} hours
- Average stress level: ${avgStress.toFixed(1)}/10
- Total courses: ${courses.length}

Rules for adjustments:
1. If student is studying less than target, suggest REDUCING targets (realistic goals)
2. If student consistently exceeds targets, can suggest moderate INCREASE (max +2 hrs/week)
3. If stress is high (>6) or sleep is low (<7), REDUCE all targets by 20-30%
4. If too many courses (>4), suggest focusing on fewer courses
5. Each adjustment MUST have a clear, user-friendly reason

Respond with ONLY valid JSON (no markdown, no code blocks):
{
  "courseAdjustments": [
    {
      "courseId": "actual_mongodb_id",
      "courseName": "course name",
      "oldTargetHours": current_number,
      "newTargetHours": proposed_number,
      "reason": "Clear explanation why this change helps (mention specific data)"
    }
  ],
  "habitAdjustments": {
    "sleepTarget": number_or_null,
    "studyTarget": number_or_null,
    "reason": "Explanation for habit changes"
  },
  "overallAdvice": "One sentence summary of why these changes are proposed"
}

If no adjustments needed, return empty arrays but explain why in overallAdvice.`;

        console.log("Calling AI...");
        const response = await getLLMResponse(prompt);
        console.log("AI Response received:", response);
        
        // Clean the response - remove markdown code blocks if present
        let cleanedResponse = response.trim();
        if (cleanedResponse.startsWith("```")) {
            cleanedResponse = cleanedResponse.replace(/```json\n?/g, "").replace(/```\n?/g, "");
        }
        
        console.log("Cleaned response:", cleanedResponse);
        const parsed = JSON.parse(cleanedResponse);
        console.log("Parsed successfully:", JSON.stringify(parsed, null, 2));

        // Validate structure
        if (!parsed.courseAdjustments || !parsed.habitAdjustments || !parsed.overallAdvice) {
            throw new Error("Invalid AI response structure");
        }

        console.log("✓ Sending goal adjustments to client");
        res.json(parsed);
    } catch (err) {
        console.error("❌ AI Goal Adjustments Error:", err.message);
        console.error("Stack:", err.stack);
        
        res.json({
            courseAdjustments: [],
            habitAdjustments: {
                sleepTarget: null,
                studyTarget: null,
                reason: "Unable to generate recommendations at this time"
            },
            overallAdvice: "Your current goals look good. Keep up the consistent effort!"
        });
    }
});

export default router;
