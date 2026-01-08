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

export default router;
