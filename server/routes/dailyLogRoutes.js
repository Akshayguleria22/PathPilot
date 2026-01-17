import express from "express";
import DailyLog from "../models/DailyLogs.js";
import { protect } from "../middleware/auth.js";
import { getReminderMessage } from "../utils/reminderLogic.js";
const router = express.Router();

// Create / Update today's log
router.post("/today", protect, async (req, res) => {
    const today = new Date().toISOString().slice(0, 10);

    const log = await DailyLog.findOneAndUpdate(
        { userId: req.user._id, date: today },
        { ...req.body, userId: req.user._id, date: today },
        { upsert: true, new: true }
    );

    res.json(log);
});

// Get logs for current week
router.get("/week", protect, async (req, res) => {
    const now = new Date();
    const start = new Date(now.setDate(now.getDate() - now.getDay()));
    const startDate = start.toISOString().slice(0, 10);

    const logs = await DailyLog.find({
        userId: req.user._id,
        date: { $gte: startDate },
    }).sort({ date: 1 });

    res.json(logs);
});

router.get("/reminder", protect, async (req, res) => {
    const today = new Date().toISOString().slice(0, 10);

    const logs = await DailyLog.find({ userId: req.user._id }).sort({ date: 1 });

    const hasTodayLog = logs.some(l => l.date === today);

    // calculate streak
    let streak = 0;
    let current = new Date();

    for (let i = logs.length - 1; i >= 0; i--) {
        const d = logs[i].date;
        const currStr = current.toISOString().slice(0, 10);
        if (d === currStr) {
            streak++;
            current.setDate(current.getDate() - 1);
        } else break;
    }

    const message = getReminderMessage({ hasTodayLog, streak });

    res.json({ message });
});

// Get weekly summary (averages)
router.get("/week/summary", protect, async (req, res) => {
    try {
        const now = new Date();
        const currentDay = now.getDay();
        const diff = currentDay === 0 ? -6 : 1 - currentDay;
        const monday = new Date(now);
        monday.setDate(now.getDate() + diff);
        monday.setHours(0, 0, 0, 0);
        const startDate = monday.toISOString().slice(0, 10);

        const logs = await DailyLog.find({
            userId: req.user._id,
            date: { $gte: startDate },
        });

        if (logs.length === 0) {
            return res.json({
                sleep: 0,
                study: 0,
                exercise: 0,
                entertainment: 0,
                mood: 0,
                foodQuality: 0,
                count: 0
            });
        }

        const summary = {
            sleep: logs.reduce((sum, log) => sum + (log.sleep || 0), 0) / logs.length,
            study: logs.reduce((sum, log) => sum + (log.study || 0), 0) / logs.length,
            exercise: logs.reduce((sum, log) => sum + (log.exercise || 0), 0) / logs.length,
            entertainment: logs.reduce((sum, log) => sum + (log.entertainment || 0), 0) / logs.length,
            mood: logs.reduce((sum, log) => sum + (log.mood || 0), 0) / logs.length,
            foodQuality: logs.reduce((sum, log) => sum + (log.foodQuality || 0), 0) / logs.length,
            count: logs.length
        };

        // Round to 1 decimal place
        Object.keys(summary).forEach(key => {
            if (key !== 'count') {
                summary[key] = Math.round(summary[key] * 10) / 10;
            }
        });

        res.json(summary);
    } catch (error) {
        console.error("Error fetching weekly summary:", error);
        res.status(500).json({ message: "Failed to fetch weekly summary" });
    }
});

// Get recent habits (last 7 days)
router.get("/recent", protect, async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const startDate = sevenDaysAgo.toISOString().slice(0, 10);

        const logs = await DailyLog.find({
            userId: req.user._id,
            date: { $gte: startDate },
        }).sort({ date: 1 });

        res.json(logs);
    } catch (error) {
        console.error("Error fetching recent habits:", error);
        res.status(500).json({ message: "Failed to fetch recent habits" });
    }
});

export default router;
