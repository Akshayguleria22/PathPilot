import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import courseRoutes from "./routes/courseRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import habitRoutes from "./routes/habitRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import roadmapRoutes from "./routes/roadmapsRoutes.js";
import assessmentRoutes from "./routes/assessmentRoutes.js";
import dailyLogRoutes from "./routes/dailylogRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import streakRoutes from "./routes/streakRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "PathPilot Backend Running" });
});


app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/roadmap", roadmapRoutes);
app.use("/api/assessment", assessmentRoutes);
app.use("/api/daily-log", dailyLogRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/streak", streakRoutes);
app.use("/api/search", searchRoutes);

// Global error handler
app.use((err, req, res, next) => {
    console.error("Global error handler:", err);
    res.status(500).json({
        message: err.message || "Internal server error",
        error: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
