import express from "express";
import Habit from "../models/Habit.js";
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
    const habits = await Habit.find({ userId: req.user._id }).sort({ date: -1 }).limit(7);
    res.json(habits);
});

export default router;
