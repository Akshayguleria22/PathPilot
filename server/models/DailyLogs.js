import mongoose from "mongoose";

const dailyLogSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        date: { type: String }, // YYYY-MM-DD (IMPORTANT)
        studyHours: { type: Number, default: 0 },
        sleepHours: { type: Number, default: 0 },
        exerciseMinutes: { type: Number, default: 0 },
        mood: { type: Number, min: 1, max: 10 },
    },
    { timestamps: true }
);

dailyLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model("DailyLog", dailyLogSchema);
