import express from "express";
import {
    healthCheck,
    analyze,
    generateRoadmapHandler,
    adaptRoadmap,
    weeklySummary,
    rank,
    generateResourceQueries,
} from "../controllers/aiServiceController.js";

const router = express.Router();

// Health check (no auth required — used by monitoring / deployment probes)
router.get("/health", healthCheck);

// Rule-based analytics
router.post("/analyze", analyze);

// LLM-powered roadmap generation
router.post("/generate-roadmap", generateRoadmapHandler);

// Rule-based roadmap adaptation
router.post("/adapt-roadmap", adaptRoadmap);

// Rule-based weekly summary
router.post("/weekly-summary", weeklySummary);

// JS-based resource ranking (replaces sklearn model)
router.post("/rank", rank);

// LLM-powered resource query generation
router.post("/generate-resource-queries", generateResourceQueries);

export default router;
