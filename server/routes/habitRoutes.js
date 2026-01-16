import express from "express";
import Habit from "../models/Habit.js";
import Course from "../models/Course.js";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Add/Update habit for today
router.post("/log", protect, async (req, res) => {
    const { sleep, study, entertainment, exercise, foodQuality, mood, stress } = req.body;
    const userId = req.user._id;

    const today = new Date().toISOString().split("T")[0];

    const habitEntry = await Habit.findOneAndUpdate(
        { userId, date: today },
        { sleep, study, entertainment, exercise, foodQuality, mood, stress },
        { upsert: true, new: true }
    );

    res.json({ message: "Habit logged successfully", habitEntry });
});

// Get recent logs (last 7 days)
router.get("/recent", protect, async (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const habits = await Habit.find({
        userId: req.user._id,
        date: { $gte: sevenDaysAgo, $lte: today }
    }).sort({ date: -1 });
    res.json(habits);
});

// Apply AI goal adjustments
router.patch("/apply-goal", protect, async (req, res) => {
    try {
        const { type, payload } = req.body;

        if (type === "course") {
            await Course.findByIdAndUpdate(payload.courseId, {
                targetHours: payload.newTargetHours,
            });
        }

        if (type === "habit") {
            await User.findByIdAndUpdate(req.user._id, {
                habitTargets: payload,
            });
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: "Failed to apply goal adjustment", error: error.message });
    }
});

export default router;
