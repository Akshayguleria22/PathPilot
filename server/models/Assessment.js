import mongoose from "mongoose";

const assessmentSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
        score: { type: Number, min: 0, max: 100 },
        confidence: { type: Number, min: 1, max: 5 }, // self confidence
    },
    { timestamps: true }
);

export default mongoose.model("Assessment", assessmentSchema);
