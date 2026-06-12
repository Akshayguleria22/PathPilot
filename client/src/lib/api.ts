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
    return { success: true, user: data };
};

export const loginUser = async (data: any) => {
    const user = getLocalData("userProfile", null);
    if (!user) throw new Error("No user found locally");
    return { success: true, user };
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
    return { success: true };
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
    if (habits.length === 0) return { count: 0 };
    
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
        sleep: (summary.sleep / summary.count).toFixed(1),
        study: (summary.study / summary.count).toFixed(1),
        exercise: (summary.exercise / summary.count).toFixed(1),
        entertainment: (summary.entertainment / summary.count).toFixed(1),
        mood: (summary.mood / summary.count).toFixed(1),
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
    return { streak: 0, badges: [] };
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
    const aiServiceUrl = process.env.NEXT_PUBLIC_AI_SERVICE_URL || API_URL;
    const res = await fetch(`${aiServiceUrl}/analyze`, {
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
    const res = await fetchWithDevice(
        `${API_URL}/api/roadmap/generate/${courseId}`,
        {
            method: "POST",
            headers: buildHeaders(),
        }
    );
    return res.json();
};

export const getRoadmap = async (courseId: string) => {
    const res = await fetchWithDevice(
        `${API_URL}/api/roadmap/${courseId}`,
        {
            headers: buildHeaders(),
        }
    );
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || "Failed to fetch roadmap");
    }
    return data;
};

export const updateRoadmapStep = async (
    courseId: string,
    stepIndex: number,
    status: "pending" | "in-progress" | "completed"
) => {
    const res = await fetchWithDevice(
        `${API_URL}/api/roadmap/${courseId}/step/${stepIndex}`,
        {
            method: "PATCH",
            headers: {
                ...buildHeaders(undefined, true),
            },
            body: JSON.stringify({ status }),
        }
    );

    return res.json();
};

export const submitAssessment = async (
    courseId: string,
    score: number,
    confidence: number
) => {
    const res = await fetchWithDevice(`${API_URL}/api/assessment/${courseId}`, {
        method: "POST",
        headers: buildHeaders(undefined, true),
        body: JSON.stringify({ score, confidence }),
    });
    return res.json();
};

export const getAIRoadmapAdvice = async (courseId: string) => {
    const res = await fetchWithDevice(`${API_URL}/api/roadmap/adapt/${courseId}`, {
        headers: buildHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || "AI needs more data to adapt the roadmap.");
    }
    return data;
};

export const autoAdaptRoadmap = async (courseId: string) => {
    const res = await fetchWithDevice(`${API_URL}/api/roadmap/adapt/${courseId}`, {
        method: "POST",
        headers: buildHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || "AI needs more data.");
    }
    return data;
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
