import express from "express";
import Habit from "../models/Habit.js";
import { protect } from "../middleware/auth.js";
import { calculateStreak } from "../services/streakService.js";
import { getBadges } from "../services/badgeService.js";
import { detectBurnout } from "../services/burnoutService.js";

const router = express.Router();

const getWeeklyAverages = async (userId) => {
    const last7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const logs = await Habit.find({
        userId,
        createdAt: { $gte: last7 }
    });

    if (logs.length === 0) {
        return { avgSleep: 0, avgStress: 0, avgStudy: 0 };
    }

    const totals = logs.reduce((acc, log) => ({
        sleep: acc.sleep + (log.sleep || 0),
        stress: acc.stress + (log.stress || 0),
        study: acc.study + (log.study || 0)
    }), { sleep: 0, stress: 0, study: 0 });

    return {
        avgSleep: Number((totals.sleep / logs.length).toFixed(1)),
        avgStress: Number((totals.stress / logs.length).toFixed(1)),
        avgStudy: Number((totals.study / logs.length).toFixed(1))
    };
};

router.get("/", protect, async (req, res) => {
    const habits = await Habit.find({ userId: req.user._id });
    const streak = calculateStreak(habits);
    res.json({ streak });
});

router.get("/badges", protect, async (req, res) => {
    const habits = await Habit.find({ userId: req.user._id });
    const streak = calculateStreak(habits);
    
    // Calculate total days logged
    const uniqueDates = new Set(habits.map(h => h.date));
    const totalDays = uniqueDates.size;
    
    // Calculate total study hours
    const totalStudyHours = habits.reduce((sum, h) => sum + (h.study || 0), 0);
    
    // Get courses completed (placeholder - update when you have course completion tracking)
    const coursesCompleted = 0; // TODO: Implement course completion tracking
    
    const badges = getBadges(streak, totalDays, totalStudyHours, coursesCompleted);

    res.json({ streak, badges, totalDays, totalStudyHours });
});

router.get("/burnout", protect, async (req, res) => {
    const week = await getWeeklyAverages(req.user._id);
    const burnout = detectBurnout(week);
    res.json(burnout);
});



export default router;
