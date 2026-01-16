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
        progress: { type: Number, default: 0 }, // overall percentage
        weeklyProgress: { type: Number, default: 0 }, // current week percentage
        hoursThisWeek: { type: Number, default: 0 }, // hours completed this week
        lastWeekReset: { type: Date, default: Date.now }, // track when weekly progress was last reset
        activityLog: [
            {
                date: { type: String, required: true }, // YYYY-MM-DD
                hoursSpent: { type: Number, default: 0 },
                tasksCompleted: { type: Number, default: 0 },
                note: { type: String },
            },
        ],
    },
    { timestamps: true }
);

export default mongoose.model("Course", courseSchema);
