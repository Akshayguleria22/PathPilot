import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        name: { type: String, required: true },
        category: {
            type: String,
            enum: ["Academic", "Skill", "Hobby"],
            default: "Academic",
        },
        targetHours: { type: Number, default: 5 }, // weekly target
        progress: { type: Number, default: 0 }, // percentage
    },
    { timestamps: true }
);

export default mongoose.model("Course", courseSchema);
