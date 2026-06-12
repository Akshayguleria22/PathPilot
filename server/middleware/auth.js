import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    try {
        const deviceId = req.headers["x-device-id"];
        if (!deviceId) {
            return res.status(401).json({ message: "Missing device id. An anonymous session could not be established." });
        }

        let user = await User.findOne({ deviceId }).select("_id");
        if (!user) {
            user = await User.create({
                deviceId,
                isAnonymous: true,
                name: "Anonymous",
            });
        }

        req.user = user;
        return next();
    } catch (error) {
        console.error("MongoDB/Auth Error in protect middleware:", error.message);
        res.status(401).json({ message: "Unauthorized - Database connection failed", error: error.message });
    }
};
