import express from "express";
import UserEvent from "../models/UserEvent.js";
import Resource from "../models/Resource.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/track", protect, async (req, res) => {
    const { eventType, courseId, resourceId, metadata } = req.body;

    try {
        await UserEvent.create({
            userId: req.user._id,
            courseId,
            resourceId,
            eventType,
            metadata,
        });

        // 🔥 update resource stats
        if (eventType === "resource_clicked" && resourceId) {
            await Resource.findOneAndUpdate(
                { url: resourceId },
                { $inc: { clickCount: 1 } }
            );
        }

        if (eventType === "resource_completed" && resourceId) {
            await Resource.findOneAndUpdate(
                { url: resourceId },
                { $inc: { completionCount: 1 } }
            );
        }

        res.json({ success: true });
    } catch (error) {
        console.error("Event tracking error:", error);
        res.status(500).json({ success: false });
    }
});

router.get("/", protect, async (req, res) => {
    const events = await UserEvent.find({ userId: req.user._id })
        .sort({ timestamp: -1 })
        .limit(100);

    res.json(events);
});

export default router;
