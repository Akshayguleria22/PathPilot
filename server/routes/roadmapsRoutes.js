import express from "express";
import axios from "axios";
import Roadmap from "../models/Roadmap.js";
import Course from "../models/Course.js";
import { protect } from "../middleware/auth.js";
import Assessment from "../models/Assessment.js";
import { generateRoadmap } from "../services/aiRoadmapService.js";
import { getAiServiceUrl } from "../utils/urlHelper.js";

const router = express.Router();

// Generate roadmap for a course
router.post("/adapt/:courseId", protect, async (req, res) => {
    try {
        const roadmap = await Roadmap.findOne({
            userId: req.user._id,
            courseId: req.params.courseId,
        });

        const assessment = await Assessment.findOne({
            userId: req.user._id,
            courseId: req.params.courseId,
        }).sort({ createdAt: -1 });

        if (!roadmap || !assessment) {
            return res.status(400).json({
                message: "Insufficient data to adapt roadmap",
            });
        }

        const completed = roadmap.steps.filter(s => s.status === "completed").length;

        const aiRes = await axios.post(
            `${getAiServiceUrl()}/adapt-roadmap`,
            {
                course_name: "Course",
                completed_steps: completed,
                total_steps: roadmap.steps.length,
                score: assessment.score,
                confidence: assessment.confidence,
            }
        );

        const actions = aiRes.data.actions || [];

        console.log(`📊 Received ${actions.length} actions from AI:`, actions);

        // RESET: Remove previously AI-generated steps and restore original statuses
        // Also remove steps with known AI-generated titles (for backward compatibility)
        const aiGeneratedTitles = [
            "Extra Practice & Revision",
            "Advanced Application Project"
        ];

        roadmap.steps = roadmap.steps.filter(step =>
            !step.aiGenerated && !aiGeneratedTitles.includes(step.title)
        );

        roadmap.steps.forEach(step => {
            if (step.originalStatus) {
                step.status = step.originalStatus;
                step.originalStatus = undefined;
            }
        });

        // APPLY NEW ACTIONS (actions are strings like "skip_intro", not objects)
        actions.forEach(actionType => {
            if (actionType === "skip_intro") {
                if (roadmap.steps.length > 0 && roadmap.steps[0].status !== "completed") {
                    roadmap.steps[0].originalStatus = roadmap.steps[0].status;
                    roadmap.steps[0].status = "completed";
                }
            }

            if (actionType === "add_practice") {
                roadmap.steps.push({
                    title: "Extra Practice & Revision",
                    description: "Additional exercises added due to low assessment score.",
                    resources: [],
                    status: "pending",
                    aiGenerated: true,
                });
            }

            if (actionType === "increase_challenge") {
                roadmap.steps.push({
                    title: "Advanced Application Project",
                    description: "Real-world project to increase difficulty.",
                    resources: [],
                    status: "pending",
                    aiGenerated: true,
                });
            }

            if (actionType === "reduce_load") {
                roadmap.steps.forEach(step => {
                    if (step.status === "pending") {
                        step.originalStatus = step.status;
                        step.status = "in-progress";
                        return false;
                    }
                });
            }
        });

        await roadmap.save();

        console.log(`✅ Roadmap adapted with actions: ${actions.join(", ")}`);

        res.json({
            message: "Roadmap adapted automatically",
            actionsApplied: actions, // actions are already strings
            roadmap,
        });
    } catch (error) {
        console.error("❌ Error adapting roadmap:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });

        res.status(500).json({
            message: "Failed to adapt roadmap",
            error: error.response?.data?.message || error.message,
            details: error.response?.data?.detail || "An error occurred while adapting the roadmap"
        });
    }
});

// Get roadmap for a course
router.get("/:courseId", protect, async (req, res) => {
    const roadmap = await Roadmap.findOne({
        userId: req.user._id,
        courseId: req.params.courseId,
    });

    if (!roadmap) {
        return res.status(404).json({ message: "Roadmap not generated yet" });
    }

    res.json(roadmap);
});

router.patch(
    "/:courseId/step/:stepIndex",
    protect,
    async (req, res) => {
        const { status } = req.body; // pending | in-progress | completed

        const roadmap = await Roadmap.findOne({
            userId: req.user._id,
            courseId: req.params.courseId,
        });

        if (!roadmap) {
            return res.status(404).json({ message: "Roadmap not found" });
        }

        const index = Number(req.params.stepIndex);
        if (Number.isNaN(index) || !roadmap.steps[index]) {
            return res.status(400).json({ message: "Invalid step index" });
        }

        roadmap.steps[index].status = status;
        await roadmap.save();

        // compute progress %
        const total = roadmap.steps.length;
        const completed = roadmap.steps.filter(s => s.status === "completed").length;
        const progress = Math.round((completed / total) * 100);

        // OPTIONAL: sync course progress
        await Course.findByIdAndUpdate(roadmap.courseId, { progress });

        res.json({ roadmap, progress });
    }
);


router.get("/adapt/:courseId", protect, async (req, res) => {
    try {
        const roadmap = await Roadmap.findOne({
            userId: req.user._id,
            courseId: req.params.courseId,
        });

        const assessment = await Assessment.findOne({
            userId: req.user._id,
            courseId: req.params.courseId,
        }).sort({ createdAt: -1 });

        if (!roadmap) {
            return res.status(404).json({
                message: "No roadmap found for this course. Please generate a roadmap first."
            });
        }

        if (!assessment) {
            return res.status(400).json({
                message: "Please submit a self-assessment first before adapting the roadmap."
            });
        }

        console.log(`📊 Getting adaptation advice for course ${req.params.courseId}`);
        console.log(`   Score: ${assessment.score}, Confidence: ${assessment.confidence}`);
        console.log(`   Progress: ${roadmap.steps.filter(s => s.status === "completed").length}/${roadmap.steps.length}`);

        const completed = roadmap.steps.filter(s => s.status === "completed").length;

        const aiRes = await axios.post(
            `${getAiServiceUrl()}/adapt-roadmap`,
            {
                course_name: "Course",
                completed_steps: completed,
                total_steps: roadmap.steps.length,
                score: assessment.score,
                confidence: assessment.confidence,
            },
            {
                timeout: 30000,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log(`✅ Received adaptation advice:`, aiRes.data);
        res.json(aiRes.data);
    } catch (error) {
        console.error("❌ Error getting roadmap adaptation:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });

        res.status(500).json({ 
            message: "Failed to get roadmap adaptation",
            error: error.response?.data?.message || error.message,
            details: error.response?.data?.detail || "An error occurred while getting adaptation advice"
        });
    }
});

router.get("/weekly-summary/:courseId", protect, async (req, res) => {
    try {
        const roadmap = await Roadmap.findOne({
            userId: req.user._id,
            courseId: req.params.courseId,
        });

        const assessment = await Assessment.findOne({
            userId: req.user._id,
            courseId: req.params.courseId,
        }).sort({ createdAt: -1 });

        if (!roadmap || !assessment) {
            return res.status(400).json({ message: "Insufficient data" });
        }

        const completed = roadmap.steps.filter(s => s.status === "completed").length;
        const progress = Math.round((completed / roadmap.steps.length) * 100);

        // TEMP values (later from habits analytics)
        const avgStudy = 2.5;
        const avgSleep = 6.5;

        const aiRes = await axios.post(
            `${getAiServiceUrl()}/weekly-summary`,
            {
                course_name: "Course",
                progress,
                completed_steps: completed,
                total_steps: roadmap.steps.length,
                avg_study_hours: avgStudy,
                avg_sleep_hours: avgSleep,
                score: assessment.score,
                confidence: assessment.confidence,
            }
        );

        res.json(aiRes.data);
    } catch (error) {
        console.error("Error getting weekly summary:", error);
        res.status(500).json({ 
            message: "Failed to get weekly summary",
            error: error.message 
        });
    }
});

router.post("/generate/:courseId", protect, async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);

        if (!course) return res.status(404).json({ message: "Course not found" });

        // Check if AI service is available
        const aiServiceUrl = getAiServiceUrl();
        if (!aiServiceUrl) {
            return res.status(503).json({
                message: "AI service URL not configured. Please contact administrator.",
                details: "The AI_SERVICE_URL environment variable is not set."
            });
        }

        console.log(`🔄 Generating roadmap for course: ${course.name}`);

        const roadmap = await generateRoadmap(course.name);

        if (!roadmap || !roadmap.steps || !Array.isArray(roadmap.steps)) {
            console.error("❌ Invalid roadmap format received:", roadmap);
            return res.status(500).json({
                message: "Received invalid roadmap format from AI service",
                details: "The AI service returned an unexpected response format."
            });
        }

        const saved = await Roadmap.create({
            userId: req.user._id,
            courseId: course._id,
            steps: roadmap.steps.map(s => ({
                ...s,
                status: "pending"
            })),
        });

        console.log(`✅ Successfully created roadmap with ${saved.steps.length} steps`);
        res.json(saved);

    } catch (error) {
        console.error("❌ Error generating roadmap:", {
            message: error.message,
            stack: error.stack
        });

        // Determine appropriate status code
        let statusCode = 500;
        let message = "Failed to generate roadmap";
        let details = error.message;

        if (error.message.includes("not reachable") || error.message.includes("ECONNREFUSED")) {
            statusCode = 503;
            message = "AI service is currently unavailable";
            details = "The AI service cannot be reached. It may be starting up or experiencing issues.";
        } else if (error.message.includes("timed out")) {
            statusCode = 504;
            message = "Request to AI service timed out";
            details = "The AI service took too long to respond. Please try again.";
        } else if (error.message.includes("Bad Gateway")) {
            statusCode = 502;
            message = "AI service gateway error";
            details = "The AI service is experiencing connectivity issues.";
        }

        res.status(statusCode).json({
            message,
            details,
            error: error.message
        });
    }
});




export default router;
