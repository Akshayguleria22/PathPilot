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
    try {
        const courses = await Course.find({ userId: req.user._id });

        // Check and reset weekly progress for each course if needed
        const now = new Date();
        const updatedCourses = await Promise.all(
            courses.map(async (course) => {
                const lastReset = new Date(course.lastWeekReset);
                const daysSinceReset = Math.floor((now - lastReset) / (1000 * 60 * 60 * 24));

                // Reset if it's been 7 or more days
                if (daysSinceReset >= 7) {
                    course.weeklyProgress = 0;
                    course.hoursThisWeek = 0;
                    course.lastWeekReset = now;
                    await course.save();
                }
                return course;
            })
        );

        res.json(updatedCourses);
    } catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).json({ message: "Error fetching courses" });
    }
});

// Log activity for a course
router.post("/:courseId/log-activity", protect, async (req, res) => {
    try {
        const { courseId } = req.params;
        const { hoursSpent, tasksCompleted, note } = req.body;

        const course = await Course.findOne({ _id: courseId, userId: req.user._id });

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const today = new Date().toISOString().split("T")[0];

        // Check if there's already an entry for today
        const existingEntry = course.activityLog.find(entry => entry.date === today);

        if (existingEntry) {
            existingEntry.hoursSpent += hoursSpent || 0;
            existingEntry.tasksCompleted += tasksCompleted || 0;
            if (note) existingEntry.note = note;
        } else {
            course.activityLog.push({
                date: today,
                hoursSpent: hoursSpent || 0,
                tasksCompleted: tasksCompleted || 0,
                note: note || "",
            });
        }

        // Update weekly hours
        course.hoursThisWeek += hoursSpent || 0;
        course.weeklyProgress = Math.min(100, Math.round((course.hoursThisWeek / course.targetHours) * 100));

        // Update overall progress (incremental)
        const progressIncrement = ((hoursSpent || 0) / course.targetHours) * 10; // 10% per week target
        course.progress = Math.min(100, course.progress + progressIncrement);

        await course.save();

        res.json({ message: "Activity logged successfully", course });
    } catch (error) {
        console.error("Error logging activity:", error);
        res.status(500).json({ message: "Error logging activity" });
    }
});

export default router;
