import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith("Bearer ")) {
            const token = authHeader.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select("_id");
            return next();
        }

        const deviceId = req.headers["x-device-id"];
        if (!deviceId) {
            return res.status(401).json({ message: "Missing device id" });
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
    } catch {
        res.status(401).json({ message: "Unauthorized" });
    }
};
