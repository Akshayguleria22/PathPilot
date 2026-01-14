import mongoose from "mongoose";

const userEventSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    resourceId: { type: String }, // videoId / articleId
    eventType: {
        type: String,
        enum: [
            "resource_clicked",
            "resource_completed",
            "step_started",
            "step_completed",
            "assessment_submitted",
            "daily_log_submitted"
        ],
        required: true,
    },
    metadata: { type: Object }, // duration, score, difficulty, etc.
    timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("UserEvent", userEventSchema);
