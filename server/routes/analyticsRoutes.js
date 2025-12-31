import express from "express";
import Habit from "../models/Habit.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Weekly Summary
router.get("/weekly", protect, async (req, res) => {
    const userId = req.user._id;
    const last7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const logs = await Habit.find({
        userId,
        createdAt: { $gte: last7 }
    }).sort({ date: 1 });

    const summary = {
        sleep: 0,
        study: 0,
        entertainment: 0,
        exercise: 0,
        mood: 0,
        stress: 0,
        count: logs.length,
    };

    logs.forEach(l => {
        summary.sleep += l.sleep;
        summary.study += l.study;
        summary.entertainment += l.entertainment;
        summary.exercise += l.exercise;
        summary.mood += l.mood;
        summary.stress += l.stress;
    });

    if (summary.count > 0) {
        Object.keys(summary).forEach(key => {
            if (key !== "count") summary[key] = Number((summary[key] / summary.count).toFixed(1));
        });
    }

    res.json(summary);
});

export default router;
