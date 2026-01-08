import express from "express";
import DailyLog from "../models/DailyLogs.js";
import { protect } from "../middleware/auth.js";

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

export default router;
