import express from "express";
import { registerUser, loginUser } from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// OAuth login/register endpoint
router.post("/oauth", async (req, res) => {
    try {
        const { email, name, provider, providerId } = req.body;

        if (!email || !name) {
            return res.status(400).json({ message: "Email and name are required" });
        }

        // Check if user exists
        let user = await User.findOne({ email });

        if (!user) {
            // Create new user
            user = await User.create({
                name,
                email,
                password: `${provider}_${providerId}_${Date.now()}`, // Random password for OAuth users
                oauthProvider: provider,
                oauthProviderId: providerId,
            });
        } else if (!user.oauthProvider) {
            // Update existing user with OAuth info
            user.oauthProvider = provider;
            user.oauthProviderId = providerId;
            await user.save();
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "30d",
        });

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("OAuth error:", error);
        res.status(500).json({ message: "Server error during OAuth" });
    }
});

// Get user habit targets
router.get("/habit-targets", protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Return habit targets with defaults if not set
        const habitTargets = user.habitTargets || {
            sleep: 8,
            study: 6,
            exercise: 1,
            foodQuality: 7,
            mood: 7,
            stress: 5,
        };

        res.json(habitTargets);
    } catch (error) {
        console.error("Error fetching habit targets:", error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
