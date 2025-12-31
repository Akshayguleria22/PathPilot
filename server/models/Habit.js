import mongoose from "mongoose";

const habitSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        date: { type: String, required: true }, // store as YYYY-MM-DD
        sleep: { type: Number, default: 0 }, // hours
        study: { type: Number, default: 0 }, // hours
        entertainment: { type: Number, default: 0 }, // hours
        exercise: { type: Number, default: 0 }, // hours
        foodQuality: { type: Number, min: 1, max: 5, default: 3 },
        mood: { type: Number, min: 1, max: 10, default: 5 },
        stress: { type: Number, min: 1, max: 10, default: 5 },
    },
    { timestamps: true }
);

export default mongoose.model("Habit", habitSchema);
