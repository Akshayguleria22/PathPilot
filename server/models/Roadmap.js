import mongoose from "mongoose";

const roadmapStepSchema = new mongoose.Schema({
    title: String,
    description: String,
    resources: [
        {
            type: {
                type: String, // video | article | practice | book
            },
            title: String,
            url: String,
        },
    ],
    status: {
        type: String,
        enum: ["pending", "in-progress", "completed"],
        default: "pending",
    },
    aiGenerated: {
        type: Boolean,
        default: false,
    },
    originalStatus: String, // Store original status for reverting
});

const roadmapSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true,
        },
        steps: [roadmapStepSchema],
    },
    { timestamps: true }
);

export default mongoose.model("Roadmap", roadmapSchema);
