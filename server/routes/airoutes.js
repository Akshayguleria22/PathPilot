import express from "express";
import { protect } from "../middleware/auth.js";
import { getLLMResponse } from "../services/llmService.js";
import Course from "../models/Course.js";
import Habit from "../models/Habit.js";

const router = express.Router();

router.post("/course-insights", protect, async (req, res) => {
    try {
        const { courses, habits = [], streak = 0 } = req.body;

        // If no courses, return default insights
        if (!courses || courses.length === 0) {
            return res.json({
                focus_course: "Add a course to get started",
                learning_velocity: "N/A",
                burnout_risk: "low",
                insights: [
                    "Start by adding your first course to begin tracking",
                    "Set realistic weekly targets for better progress",
                    "Consistency is key to successful learning"
                ]
            });
        }

        const prompt = `You are an AI learning coach analyzing student data.

Courses: ${JSON.stringify(courses, null, 2)}
Daily habits: ${JSON.stringify(habits, null, 2)}
Learning streak: ${streak} days

Analyze the data and respond with ONLY a valid JSON object (no markdown, no code blocks, just pure JSON):

{
  "focus_course": "name of course that needs most attention based on low progress or high target hours",
  "learning_velocity": "slow|moderate|fast (based on average progress across courses)",
  "burnout_risk": "low|medium|high (based on target hours and number of courses)",
  "insights": [
    "first actionable insight about their learning",
    "second actionable insight about progress",
    "third actionable insight about optimization"
  ]
}`;

        const aiResponse = await getLLMResponse(prompt);
        console.log("AI Raw Response:", aiResponse);

        // Clean the response - remove markdown code blocks if present
        let cleanedResponse = aiResponse.trim();
        if (cleanedResponse.startsWith("```")) {
            cleanedResponse = cleanedResponse.replace(/```json\n?/g, "").replace(/```\n?/g, "");
        }

        const parsed = JSON.parse(cleanedResponse);

        // Validate the response structure
        if (!parsed.focus_course || !parsed.learning_velocity || !parsed.burnout_risk || !Array.isArray(parsed.insights)) {
            throw new Error("Invalid AI response structure");
        }

        res.json(parsed);
    } catch (err) {
        console.error("AI Insights Error Details:", err.message);
        console.error("Stack:", err.stack);
        
        // Return fallback insights on error
        const { courses } = req.body;
        res.json({
            focus_course: courses && courses.length > 0 ? courses[0].name : "N/A",
            learning_velocity: "moderate",
            burnout_risk: "low",
            insights: [
                "Keep up your consistent learning efforts",
                "Consider reviewing courses with lower progress",
                "Balance your time across different subjects"
            ]
        });
    }
});

router.post("/analytics-insights", protect, async (req, res) => {
    try {
        const { summary, logs = [] } = req.body;

        // If no data, return default insights
        if (!summary || summary.count === 0) {
            return res.json({
                insights: [
                    "Start logging your daily habits to get personalized insights",
                    "Consistency is key to building better habits",
                    "Track sleep, study time, and wellness metrics regularly"
                ]
            });
        }

        const prompt = `You are a wellness and productivity coach analyzing user habits.

Weekly Summary:
- Average Sleep: ${summary.avgSleep || 0} hours
- Total Study Time: ${summary.totalStudy || 0} hours  
- Average Mood: ${summary.mood || 0}/10
- Average Stress: ${summary.stress || 0}/10
- Exercise: ${summary.totalExercise || 0} hours
- Entertainment: ${summary.totalEntertainment || 0} hours

Daily Logs: ${JSON.stringify(logs, null, 2)}

Analyze the data and provide 3-5 actionable insights to help improve:
1. Sleep quality and consistency
2. Study habits and focus
3. Stress management
4. Work-life balance
5. Overall wellness

Respond with ONLY a valid JSON object (no markdown, no code blocks):

{
  "insights": [
    "specific actionable insight 1",
    "specific actionable insight 2",
    "specific actionable insight 3"
  ]
}`;

        const aiResponse = await getLLMResponse(prompt);
        console.log("AI Analytics Response:", aiResponse);

        // Clean the response - remove markdown code blocks if present
        let cleanedResponse = aiResponse.trim();
        if (cleanedResponse.startsWith("```")) {
            cleanedResponse = cleanedResponse.replace(/```json\n?/g, "").replace(/```\n?/g, "");
        }

        const parsed = JSON.parse(cleanedResponse);

        // Validate the response structure
        if (!Array.isArray(parsed.insights)) {
            throw new Error("Invalid AI response structure");
        }

        res.json(parsed);
    } catch (err) {
        console.error("AI Analytics Insights Error Details:", err.message);
        console.error("Stack:", err.stack);
        
        // Return fallback insights on error
        res.json({
            insights: [
                "Keep maintaining your current habits and track consistently",
                "Consider balancing study time with adequate rest and breaks",
                "Monitor your stress levels and practice self-care regularly"
            ]
        });
    }
});

// AI Goal Adjustments - Proposes changes, never applies directly
router.post("/goals/goal-adjustments", protect, async (req, res) => {
    console.log("🎯 Goal Adjustments endpoint HIT!");
    
    try {
        const userId = req.user._id;
        
        console.log("=== Goal Adjustments Request ===");
        console.log("User ID:", userId);
        
        // Fetch user's courses
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
        
        // Fetch recent habits (last 14 days)
        const fourteenDaysAgo = new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const today = new Date().toISOString().split('T')[0];
        const habits = await Habit.find({
            userId,
            date: { $gte: fourteenDaysAgo, $lte: today }
        }).sort({ date: -1 });

        console.log("Habits found:", habits.length);

        // Calculate average study time
        const avgStudyTime = habits.length > 0
            ? habits.reduce((acc, h) => acc + (h.study || 0), 0) / habits.length
            : 0;

        // Calculate average sleep
        const avgSleep = habits.length > 0
            ? habits.reduce((acc, h) => acc + (h.sleep || 0), 0) / habits.length
            : 0;

        // Calculate stress level
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

Respond with ONLY valid JSON (no markdown):
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

        console.log("Calling AI with prompt...");
        const aiResponse = await getLLMResponse(prompt);
        console.log("AI Goal Adjustments Response:", aiResponse);

        // Clean the response
        let cleanedResponse = aiResponse.trim();
        if (cleanedResponse.startsWith("```")) {
            cleanedResponse = cleanedResponse.replace(/```json\n?/g, "").replace(/```\n?/g, "");
        }

        console.log("Cleaned response:", cleanedResponse);
        const parsed = JSON.parse(cleanedResponse);
        console.log("Parsed response:", JSON.stringify(parsed, null, 2));

        // Validate structure
        if (!parsed.courseAdjustments || !parsed.habitAdjustments || !parsed.overallAdvice) {
            throw new Error("Invalid AI response structure");
        }

        console.log("✓ Goal adjustments generated successfully");
        res.json(parsed);
    } catch (err) {
        console.error("❌ AI Goal Adjustments Error:", err.message);
        console.error("Stack:", err.stack);
        
        // Return safe fallback
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
