import toast from "react-hot-toast";

export const API_URL =
    process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:5000";

const DEVICE_ID_KEY = "pp_device_id";
const SERVER_STARTING_TOAST_ID = "server-starting";

export const getDeviceId = () => {
    if (typeof window === "undefined") return "server";
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
        deviceId =
            typeof crypto !== "undefined" && "randomUUID" in crypto
                ? crypto.randomUUID()
                : `pp_${Math.random().toString(36).slice(2, 10)}${Date.now()}`;
        localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
};

// LocalStorage Helpers
const getLocalData = (key: string, defaultVal: any) => {
    if (typeof window === "undefined") return defaultVal;
    try {
        const val = localStorage.getItem(`pp_${key}`);
        return val ? JSON.parse(val) : defaultVal;
    } catch {
        return defaultVal;
    }
};

const setLocalData = (key: string, val: any) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(`pp_${key}`, JSON.stringify(val));
};

const buildHeaders = (extra?: HeadersInit, includeJson = false) => {
    const base: Record<string, string> = {
        "X-Device-Id": getDeviceId(),
    };
    if (includeJson) base["Content-Type"] = "application/json";
    return { ...base, ...(extra || {}) };
};

const notifyServerStarting = () => {
    if (typeof window === "undefined") return;
    toast.loading("Server is starting, please wait...", {
        id: SERVER_STARTING_TOAST_ID,
    });
};

const clearServerStarting = () => {
    if (typeof window === "undefined") return;
    toast.dismiss(SERVER_STARTING_TOAST_ID);
};

const fetchWithDevice = async (
    url: string,
    options: RequestInit & { timeoutMs?: number; retry?: number } = {}
) => {
    const { timeoutMs = 12000, retry = 1, ...init } = options;
    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timeoutId = controller
        ? setTimeout(() => controller.abort(), timeoutMs)
        : null;

    try {
        const res = await fetch(url, { ...init, signal: controller?.signal });
        if ([502, 503, 504].includes(res.status)) {
            notifyServerStarting();
        } else if (res.ok) {
            clearServerStarting();
        }
        return res;
    } catch (error) {
        notifyServerStarting();
        if (retry > 0) {
            await new Promise((resolve) => setTimeout(resolve, 3000));
            return fetchWithDevice(url, { ...options, retry: retry - 1 });
        }
        throw error;
    } finally {
        if (timeoutId) clearTimeout(timeoutId);
    }
};

export const apiFetch = fetchWithDevice;
export const deviceHeaders = (includeJson = false, extra?: HeadersInit) =>
    buildHeaders(extra, includeJson);

export const wakeBackend = async () => {
    try {
        notifyServerStarting();
        const res = await fetch(`${API_URL}/health`, {
            headers: buildHeaders(),
            cache: "no-store",
        });
        if (res.ok) {
            clearServerStarting();
        }
    } catch {
        // Best-effort wakeup only
    }
};

// ==========================================
// LOCAL STORAGE MOCKS
// ==========================================

export const registerUser = async (data: any) => {
    setLocalData("userProfile", data);
    return { success: true, user: data, token: "local-mock-token", message: "Registered successfully" };
};

export const loginUser = async (data: any) => {
    const user = getLocalData("userProfile", null);
    if (!user) throw new Error("No user found locally");
    return { success: true, user, token: "local-mock-token", message: "Logged in successfully" };
};

export const getHabitTargets = async () => {
    return getLocalData("habitTargets", {
        sleep: 8,
        study: 6,
        exercise: 1,
        foodQuality: 7,
        mood: 7,
        stress: 5,
    });
};

export const getDailyReminder = async () => {
    return { message: "Stay consistent! You're doing great." };
};

export const trackEvent = async (data: {
    eventType: string;
    courseId?: string;
    resourceId?: string;
    metadata?: any;
}) => {
    const events = getLocalData("events", []);
    events.push({ ...data, timestamp: new Date().toISOString() });
    setLocalData("events", events);
    return { success: true };
};

export const getUserEvents = async () => {
    return getLocalData("events", []);
};

export const addCourse = async (data: any) => {
    const courses = getLocalData("courses", []);
    const newCourse = { ...data, _id: crypto.randomUUID() };
    courses.push(newCourse);
    setLocalData("courses", courses);
    return newCourse;
};

export const getCourses = async () => {
    return getLocalData("courses", []);
};

export const getCoursesList = async () => {
    return getLocalData("courses", []);
};

export const logCourseActivity = async (courseId: string, data: any) => {
    const courses = getLocalData("courses", []);
    const courseIndex = courses.findIndex((c: any) => c._id === courseId);
    if (courseIndex !== -1) {
        courses[courseIndex] = { ...courses[courseIndex], ...data };
        setLocalData("courses", courses);
        return courses[courseIndex];
    }
    return null;
};

export const logHabit = async (data: any) => {
    const habits = getLocalData("habits", []);
    const today = new Date().toISOString().split("T")[0];
    const existingIndex = habits.findIndex((h: any) => h.date === today);
    if (existingIndex !== -1) {
        habits[existingIndex] = { ...habits[existingIndex], ...data };
    } else {
        habits.push({ ...data, date: today });
    }
    setLocalData("habits", habits);
    return { success: true, message: "Habit logged successfully" };
};

export const submitTodayLog = async (data: any) => {
    return logHabit(data);
};

export const getRecentHabits = async () => {
    const habits = getLocalData("habits", []);
    // Return last 7 days sorted descending
    const today = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return habits
        .filter((h: any) => h.date >= sevenDaysAgo && h.date <= today)
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getTodayHabit = async () => {
    return getRecentHabits();
};

export const fetchWeeklySummary = async () => {
    const habits = await getRecentHabits();
    if (habits.length === 0) return {
        count: 0,
        sleep: 0,
        study: 0,
        exercise: 0,
        entertainment: 0,
        mood: 0,
        foodQuality: 0
    };

    const summary = habits.reduce((acc: any, h: any) => {
        acc.sleep += Number(h.sleep) || 0;
        acc.study += Number(h.study) || 0;
        acc.exercise += Number(h.exercise) || 0;
        acc.entertainment += Number(h.entertainment) || 0;
        acc.mood += Number(h.mood) || 0;
        acc.foodQuality += Number(h.foodQuality) || 0;
        return acc;
    }, { sleep: 0, study: 0, exercise: 0, entertainment: 0, mood: 0, foodQuality: 0, count: habits.length });

    return {
        sleep: Number((summary.sleep / summary.count).toFixed(1)),
        study: Number((summary.study / summary.count).toFixed(1)),
        exercise: Number((summary.exercise / summary.count).toFixed(1)),
        entertainment: Number((summary.entertainment / summary.count).toFixed(1)),
        mood: Number((summary.mood / summary.count).toFixed(1)),
        foodQuality: Number((summary.foodQuality / summary.count).toFixed(1)),
        count: summary.count
    };
};

export const getWeeklyLogs = async () => {
    return getRecentHabits();
};

export const getStreak = async () => {
    const habits = getLocalData("habits", []);
    return { streak: habits.length > 0 ? habits.length : 0 };
};

export const getStreakAndBadges = async () => {
    const habits = getLocalData("habits", []);
    let totalStudyHours = 0;
    habits.forEach((h: any) => {
        totalStudyHours += Number(h.study) || 0;
    });

    return {
        streak: habits.length > 0 ? habits.length : 0,
        badges: [],
        totalDays: habits.length,
        totalStudyHours
    };
};

export const getBurnoutRisk = async () => {
    return { level: "low", message: "You are doing great!" };
};

// ==========================================
// AI & BACKEND CALLS
// ==========================================

export async function fetchResources(query: string, courseId: string) {
    const res = await fetchWithDevice(
        `${API_URL}/api/resources/fetch?query=${encodeURIComponent(
            query
        )}&courseId=${courseId}`,
        {
            headers: buildHeaders(),
        }
    );

    if (!res.ok) throw new Error("Failed to fetch resources");

    return res.json();
}

export const getAIAdvice = async (data: any) => {
    const res = await fetch(`${API_URL}/api/ai-service/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return res.json();
};

export const getAnalyticsInsights = async (summary: any, logs: any[]) => {
    const res = await fetchWithDevice(`${API_URL}/api/ai/analytics-insights`, {
        method: "POST",
        headers: buildHeaders(undefined, true),
        body: JSON.stringify({ summary, logs }),
    });

    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }

    return res.json();
};

export const generateRoadmap = async (courseId: string) => {
    const courses = getLocalData("courses", []);
    const course = courses.find((c: any) => c._id === courseId);
    if (!course) throw new Error("Course not found");

    const res = await fetch(`${API_URL}/api/ai-service/generate-roadmap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            course_name: course.name,
            user_level: "beginner"
        })
    });

    if (!res.ok) throw new Error("Failed to generate roadmap from AI service");
    const roadmapData = await res.json();

    const roadmap = {
        _id: crypto.randomUUID ? crypto.randomUUID() : `pp_${Math.random()}`,
        courseId,
        steps: roadmapData.steps.map((s: any) => ({ ...s, status: "pending" }))
    };

    const roadmaps = getLocalData("roadmaps", []);
    roadmaps.push(roadmap);
    setLocalData("roadmaps", roadmaps);

    return roadmap;
};

export const getRoadmap = async (courseId: string) => {
    const roadmaps = getLocalData("roadmaps", []);
    const roadmap = roadmaps.find((r: any) => r.courseId === courseId);
    if (!roadmap) throw new Error("Roadmap not found");
    return roadmap;
};

export const updateRoadmapStep = async (
    courseId: string,
    stepIndex: number,
    status: "pending" | "in-progress" | "completed"
) => {
    const roadmaps = getLocalData("roadmaps", []);
    const roadmapIndex = roadmaps.findIndex((r: any) => r.courseId === courseId);
    if (roadmapIndex === -1) throw new Error("Roadmap not found");

    roadmaps[roadmapIndex].steps[stepIndex].status = status;
    setLocalData("roadmaps", roadmaps);

    const total = roadmaps[roadmapIndex].steps.length;
    const completed = roadmaps[roadmapIndex].steps.filter((s: any) => s.status === "completed").length;
    const progress = Math.round((completed / total) * 100);

    const courses = getLocalData("courses", []);
    const courseIndex = courses.findIndex((c: any) => c._id === courseId);
    if (courseIndex !== -1) {
        courses[courseIndex].progress = progress;
        setLocalData("courses", courses);
    }

    return { roadmap: roadmaps[roadmapIndex], progress };
};

export const submitAssessment = async (
    courseId: string,
    score: number,
    confidence: number
) => {
    const assessments = getLocalData("assessments", []);
    assessments.push({ courseId, score, confidence, createdAt: new Date().toISOString() });
    setLocalData("assessments", assessments);
    return { success: true };
};

export const getAIRoadmapAdvice = async (courseId: string) => {
    const roadmaps = getLocalData("roadmaps", []);
    const roadmap = roadmaps.find((r: any) => r.courseId === courseId);

    const assessments = getLocalData("assessments", []);
    const courseAssessments = assessments.filter((a: any) => a.courseId === courseId);
    const assessment = courseAssessments[courseAssessments.length - 1];

    if (!roadmap) throw new Error("No roadmap found");
    if (!assessment) throw new Error("No assessment found");

    const completed = roadmap.steps.filter((s: any) => s.status === "completed").length;

    const res = await fetch(`${API_URL}/api/ai-service/adapt-roadmap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            course_name: "Course",
            completed_steps: completed,
            total_steps: roadmap.steps.length,
            score: assessment.score,
            confidence: assessment.confidence
        })
    });

    if (!res.ok) throw new Error("AI needs more data to adapt the roadmap");
    return res.json();
};

export const autoAdaptRoadmap = async (courseId: string) => {
    const advice = await getAIRoadmapAdvice(courseId);
    const actions = advice.actions || [];

    const roadmaps = getLocalData("roadmaps", []);
    const roadmapIndex = roadmaps.findIndex((r: any) => r.courseId === courseId);
    if (roadmapIndex === -1) throw new Error("Roadmap not found");
    const roadmap = roadmaps[roadmapIndex];

    actions.forEach((actionType: string) => {
        if (actionType === "skip_intro" && roadmap.steps.length > 0 && roadmap.steps[0].status !== "completed") {
            roadmap.steps[0].status = "completed";
        }
        if (actionType === "add_practice") {
            roadmap.steps.push({
                title: "Extra Practice & Revision",
                description: "Additional exercises added due to low assessment score.",
                resources: [],
                status: "pending",
                aiGenerated: true,
            });
        }
        if (actionType === "increase_challenge") {
            roadmap.steps.push({
                title: "Advanced Application Project",
                description: "Real-world project to increase difficulty.",
                resources: [],
                status: "pending",
                aiGenerated: true,
            });
        }
    });

    setLocalData("roadmaps", roadmaps);
    return {
        message: "Roadmap adapted automatically",
        actionsApplied: actions,
        roadmap
    };
};

// Search API
export const searchWeb = async (query: string, type = "organic", limit = 10) => {
    const res = await fetchWithDevice(
        `${API_URL}/api/search/web?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`,
        {
            headers: buildHeaders(),
        }
    );
    return res.json();
};

export const searchLearningResources = async (topic: string) => {
    const res = await fetchWithDevice(
        `${API_URL}/api/search/learning?topic=${encodeURIComponent(topic)}`,
        {
            headers: buildHeaders(),
        }
    );
    return res.json();
};

export const searchNews = async (topic: string, limit = 5) => {
    const res = await fetchWithDevice(
        `${API_URL}/api/search/news?topic=${encodeURIComponent(topic)}&limit=${limit}`,
        {
            headers: buildHeaders(),
        }
    );
    return res.json();
};
