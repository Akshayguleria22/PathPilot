import mongoose from "mongoose";
import dotenv from "dotenv";
import Resource from "../models/Resource.js";
import UserAssessment from "../models/Assessment.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get directory path in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server .env file
dotenv.config({ path: path.join(__dirname, "../.env") });

await mongoose.connect(process.env.MONGO_URI);

const resources = await Resource.find().populate('courseId');
const rows = [];

for (const r of resources) {
    // Find assessments from users who clicked this resource
    const assessments = await UserAssessment.find({
        courseId: r.courseId?._id
    }).limit(100);
    
    const avgScore = assessments.length > 0 
        ? assessments.reduce((sum, a) => sum + (a.score || 0), 0) / assessments.length
        : 60;
    
    const avgConfidence = assessments.length > 0
        ? assessments.reduce((sum, a) => sum + (a.confidenceLevel || 0), 0) / assessments.length
        : 3;
    
    // Target: effectiveness score based on completion rate and engagement
    const completionRate = r.clickCount > 0 ? r.completionCount / r.clickCount : 0;
    const engagementScore = Math.min(r.clickCount / 10, 1) * 0.3 + completionRate * 0.7;
    
    rows.push({
        clicks: r.clickCount,
        completions: r.completionCount,
        score: avgScore,
        confidence: avgConfidence,
        rank_score: engagementScore
    });
}

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, "../../ai/data");
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Write CSV file
const csvPath = path.join(dataDir, "resource_training.csv");
fs.writeFileSync(
    csvPath,
    [
        "clicks,completions,score,confidence,rank_score",
        ...rows.map(r => Object.values(r).join(","))
    ].join("\n")
);

console.log(`Training CSV generated with ${rows.length} rows at ${csvPath}`);
await mongoose.disconnect();
process.exit(0);
