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
import dailyLogRoutes from "./routes/dailyLogRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import streakRoutes from "./routes/streakRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import aiRoutes from "./routes/airoutes.js";
import aiAnalyticsRoutes from "./routes/aiAnalyticsRoutes.js";
import goalAIRoutes from "./routes/goalAiRoutes.js";
dotenv.config();
connectDB();

const app = express();

// CORS configuration for production
const allowedOrigins = [
    "http://localhost:3000",
    "https://path-pilot-one.vercel.app",
    process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Add payload size limit

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.get("/", (req, res) => {
    res.json({ message: "PathPilot Backend Running" });
});


app.use("/api/users", userRoutes);
app.use("/api/ai/goals", goalAIRoutes);
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
app.use("/api/ai", aiRoutes);
app.use("/api/ai/analytics", aiAnalyticsRoutes);

// Global error handler
app.use((err, req, res, next) => {
    console.error("Global error handler:", err);
    res.status(err.status || 500).json({
        message: err.message || "Internal server error",
        error: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});


const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
