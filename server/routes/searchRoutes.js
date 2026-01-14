import express from "express";
import { protect } from "../middleware/auth.js";
import { searchWeb, searchLearningResources, searchNews } from "../services/serpService.js";

const router = express.Router();

// General web search
router.get("/web", protect, async (req, res) => {
    try {
        const { q, limit = 10, type = "organic" } = req.query;

        if (!q) {
            return res.status(400).json({ message: "Search query (q) is required" });
        }

        const result = await searchWeb(q, { type, limit: parseInt(limit) });

        if (!result.success) {
            return res.status(503).json({ 
                message: "Search service unavailable",
                error: result.error 
            });
        }

        res.json(result);
    } catch (error) {
        console.error("Web search error:", error);
        res.status(500).json({ message: "Search failed", error: error.message });
    }
});

// Learning resources search (for courses)
router.get("/learning", protect, async (req, res) => {
    try {
        const { topic, includeVideos, includeArticles, includeDocs } = req.query;

        if (!topic) {
            return res.status(400).json({ message: "Topic is required" });
        }

        const result = await searchLearningResources(topic, {
            includeVideos: includeVideos !== "false",
            includeArticles: includeArticles !== "false",
            includeDocs: includeDocs !== "false"
        });

        if (!result.success) {
            return res.status(503).json({ 
                message: "Learning resources search unavailable",
                error: result.error 
            });
        }

        res.json(result);
    } catch (error) {
        console.error("Learning resources search error:", error);
        res.status(500).json({ message: "Search failed", error: error.message });
    }
});

// News search
router.get("/news", protect, async (req, res) => {
    try {
        const { topic, limit = 5 } = req.query;

        if (!topic) {
            return res.status(400).json({ message: "Topic is required" });
        }

        const result = await searchNews(topic, parseInt(limit));

        if (!result.success) {
            return res.status(503).json({ 
                message: "News search unavailable",
                error: result.error 
            });
        }

        res.json(result);
    } catch (error) {
        console.error("News search error:", error);
        res.status(500).json({ message: "Search failed", error: error.message });
    }
});

export default router;
