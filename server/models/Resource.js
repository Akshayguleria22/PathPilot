import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    title: String,
    url: { type: String, unique: true },
    type: {
        type: String,
        enum: ["video", "article", "practice", "book", "doc"],
        default: "video",
    },
    difficulty: {
        type: String,
        enum: ["beginner", "intermediate", "advanced"],
        default: "beginner",
    },
    qualityScore: { type: Number, default: 0 }, // ML-driven later
    clickCount: { type: Number, default: 0 },
    completionCount: { type: Number, default: 0 },
    avgWatchTime: { type: Number, default: 0 },
    source: String, // youtube, medium, etc.
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Resource", resourceSchema);
