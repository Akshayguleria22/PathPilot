import express from "express";
import Habit from "../models/Habit.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Weekly Summary
router.get("/weekly", protect, async (req, res) => {
    const userId = req.user._id;

    // Get current week dates (Monday to Sunday)
    const now = new Date();
    const currentDay = now.getDay();
    const diff = currentDay === 0 ? -6 : 1 - currentDay; // Adjust when day is Sunday
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const mondayStr = monday.toISOString().split('T')[0];
    const sundayStr = sunday.toISOString().split('T')[0];

    const logs = await Habit.find({
        userId,
        date: { $gte: mondayStr, $lte: sundayStr }
    }).sort({ date: 1 });

    // Count unique days instead of total logs
    const uniqueDays = new Set(logs.map(l => l.date));

    const summary = {
        sleep: 0,
        study: 0,
        entertainment: 0,
        exercise: 0,
        mood: 0,
        stress: 0,
        count: uniqueDays.size,
    };

    logs.forEach(l => {
        summary.sleep += l.sleep;
        summary.study += l.study;
        summary.entertainment += l.entertainment;
        summary.exercise += l.exercise;
        summary.mood += l.mood;
        summary.stress += l.stress;
    });

    if (uniqueDays.size > 0) {
        Object.keys(summary).forEach(key => {
            if (key !== "count") summary[key] = Number((summary[key] / uniqueDays.size).toFixed(1));
        });
    }

    res.json(summary);
});

export default router;
