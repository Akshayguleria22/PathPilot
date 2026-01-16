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

        try {
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

            // APPLY NEW ACTIONS
            actions.forEach(action => {
                if (action.type === "skip_intro") {
                    if (roadmap.steps.length > 0 && roadmap.steps[0].status !== "completed") {
                        roadmap.steps[0].originalStatus = roadmap.steps[0].status;
                        roadmap.steps[0].status = "completed";
                    }
                }

                if (action.type === "add_practice") {
                    roadmap.steps.push({
                        title: "Extra Practice & Revision",
                        description: "Additional exercises added due to low assessment score.",
                        resources: [],
                        status: "pending",
                        aiGenerated: true,
                    });
                }

                if (action.type === "increase_challenge") {
                    roadmap.steps.push({
                        title: "Advanced Application Project",
                        description: "Real-world project to increase difficulty.",
                        resources: [],
                        status: "pending",
                        aiGenerated: true,
                    });
                }

                if (action.type === "reduce_load") {
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

            res.json({
                message: "Roadmap adapted automatically",
                actionsApplied: actions.map(a => a.type),
                roadmap,
            });
        } catch (aiError) {
            console.error("AI service error:", aiError.message);
            // If AI service fails, return error but don't crash
            res.status(500).json({ 
                message: "Failed to contact AI service for roadmap adaptation",
                error: aiError.response?.data?.message || aiError.message
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

        if (!roadmap || !assessment) {
            return res.status(400).json({ message: "Insufficient data to adapt roadmap" });
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

        res.json(aiRes.data);
    } catch (error) {
        console.error("Error getting roadmap adaptation:", error);
        res.status(500).json({ 
            message: "Failed to get roadmap adaptation",
            error: error.message 
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
                message: "AI service URL not configured"
            });
        }

        const roadmap = await generateRoadmap(course.name);

        const saved = await Roadmap.create({
            userId: req.user._id,
            courseId: course._id,
            steps: roadmap.steps.map(s => ({
                ...s,
                status: "pending"
            })),
        });

        res.json(saved);
    } catch (error) {
        console.error("Error generating roadmap:", error);
        res.status(500).json({
            message: "Failed to generate roadmap",
            error: error.message
        });
    }
});




export default router;
