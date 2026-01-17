import express from "express";
import Assessment from "../models/Assessment.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/:courseId", protect, async (req, res) => {
    try {
        const { score, confidence } = req.body;

        // Validate input
        if (score === undefined || confidence === undefined) {
            return res.status(400).json({
                message: "Score and confidence are required"
            });
        }

        if (score < 0 || score > 100) {
            return res.status(400).json({
                message: "Score must be between 0 and 100"
            });
        }

        if (confidence < 1 || confidence > 5) {
            return res.status(400).json({
                message: "Confidence must be between 1 and 5"
            });
        }

        console.log(`📊 Creating assessment for course ${req.params.courseId}: score=${score}, confidence=${confidence}`);

        const assessment = await Assessment.create({
            userId: req.user._id,
            courseId: req.params.courseId,
            score,
            confidence,
        });

        console.log(`✅ Assessment created successfully:`, assessment._id);
        res.json(assessment);

    } catch (error) {
        console.error("❌ Error creating assessment:", error);
        res.status(500).json({
            message: "Failed to create assessment",
            error: error.message
        });
    }
});

export default router;
