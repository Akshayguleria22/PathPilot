import express from "express";
import Assessment from "../models/Assessment.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/:courseId", protect, async (req, res) => {
    const { score, confidence } = req.body;

    const assessment = await Assessment.create({
        userId: req.user._id,
        courseId: req.params.courseId,
        score,
        confidence,
    });

    res.json(assessment);
});

export default router;
