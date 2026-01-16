import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    oauthProvider: { type: String }, // 'google' or 'github'
    oauthProviderId: { type: String }, // Provider's user ID
    habitTargets: {
        type: {
            sleep: { type: Number, default: 8 },
            study: { type: Number, default: 6 },
            exercise: { type: Number, default: 1 },
            foodQuality: { type: Number, default: 7 },
            mood: { type: Number, default: 7 },
            stress: { type: Number, default: 5 },
        },
        default: {
            sleep: 8,
            study: 6,
            exercise: 1,
            foodQuality: 7,
            mood: 7,
            stress: 5,
        }
    }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
