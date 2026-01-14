import express from "express";
import { protect } from "../middleware/auth.js";
import Resource from "../models/Resource.js";
import { rankResources } from "../utils/resourceRanker.js";
import { searchYouTube } from "../services/youtubeService.js";
import { filterDocs } from "../services/docService.js";
import { searchWeb } from "../services/serpService.js";
const router = express.Router();

router.get("/youtube", protect, async (req, res) => {
    try {
        const { query, courseId } = req.query;

        if (!query || !courseId) {
            return res.status(400).json({ message: "query and courseId required" });
        }

        const videos = await searchYouTube(query);
        const storedResources = [];

        for (const v of videos) {
            let resource = await Resource.findOne({ url: v.url });

            if (!resource) {
                resource = await Resource.create({
                    courseId,
                    title: v.title,
                    url: v.url,
                    type: "video",
                    source: "youtube",
                });
            }

            storedResources.push(resource);
        }

        const ranked = await rankResources(storedResources, {
            score: req.user.latestScore,
            confidence: req.user.latestConfidence,
        });

        res.json({ resources: ranked });
    } catch (err) {
        console.error("YouTube fetch error:", err);
        res.status(500).json({ message: "Failed to fetch resources" });
    }
});


router.get("/:courseId/ranked", protect, async (req, res) => {
    try {
        const resources = await Resource.find({ courseId: req.params.courseId });
        const ranked = rankResources(resources);
        res.json({ resources: ranked });
    } catch (err) {
        res.status(500).json({ message: "Failed to load resources" });
    }
});

router.get("/fetch", protect, async (req, res) => {
    try {
        const { query, courseId } = req.query;

        if (!query || !courseId) {
            return res.status(400).json({ message: "query and courseId required" });
        }

        // 1️⃣ Fetch Videos from YouTube
        const videos = await searchYouTube(query);

        // 2️⃣ Fetch Articles from SERP API
        const serpResult = await searchWeb(`${query} tutorial guide`, { limit: 10 });
        const allArticles = serpResult.success && serpResult.results ? serpResult.results : [];

        // 3️⃣ Separate Docs (from trusted domains) and regular Articles
        const docs = filterDocs(allArticles);
        const articles = allArticles
            .filter(a => !docs.some(d => d.url === a.url))
            .slice(0, 5)
            .map(a => ({
                title: a.title,
                url: a.url,
                snippet: a.snippet,
                type: "article",
                source: "web"
            }));

        // 4️⃣ Store everything in database
        const save = async (item) => {
            try {
                const exists = await Resource.findOne({ url: item.url });
                if (!exists) {
                    await Resource.create({ ...item, courseId });
                }
            } catch (e) {
                console.error("Save resource error:", e.message);
            }
        };

        await Promise.all([
            ...videos.map(save),
            ...articles.map(save),
            ...docs.map(save)
        ]);

        res.json({
            videos,
            articles,
            docs
        });

    } catch (err) {
        console.error("Resource fetch error:", err);
        res.status(500).json({ message: "Failed to fetch resources", error: err.message });
    }
});

export default router;
