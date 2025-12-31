import express from "express";
import Course from "../models/Course.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Add a new course
router.post("/add", protect, async (req, res) => {
    const { name, category, targetHours } = req.body;

    try {
        const course = await Course.create({
            userId: req.user._id,
            name,
            category,
            targetHours,
        });

        res.json({ message: "Course added successfully", course });

    } catch (error) {
        res.status(500).json({ message: "Error adding course" });
    }
});

// Fetch all courses for logged-in user
router.get("/", protect, async (req, res) => {
    const courses = await Course.find({ userId: req.user._id });
    res.json(courses);
});

export default router;
