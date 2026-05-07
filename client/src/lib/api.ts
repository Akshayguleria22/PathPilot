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

export const registerUser = async (data: any) => {
    const res = await fetchWithDevice(`${API_URL}/api/users/register`, {
        method: "POST",
        headers: buildHeaders(undefined, true),
        body: JSON.stringify(data),
    });
    return res.json();
};

export const loginUser = async (data: any) => {
    const res = await fetchWithDevice(`${API_URL}/api/users/login`, {
        method: "POST",
        headers: buildHeaders(undefined, true),
        body: JSON.stringify(data),
    });
    return res.json();
};

export const getHabitTargets = async () => {
    const res = await fetchWithDevice(`${API_URL}/api/users/habit-targets`, {
        headers: buildHeaders(),
    });
    return res.json();
};

export const getDailyReminder = async () => {
    const res = await fetchWithDevice(`${API_URL}/api/daily-log/reminder`, {
        headers: buildHeaders(),
    });
    return res.json();
};
export const trackEvent = async (data: {
    eventType: string;
    courseId?: string;
    resourceId?: string;
    metadata?: any;
}) => {
    try {
        const res = await fetchWithDevice(
            `${API_URL}/api/events/track`,
            {
                method: "POST",
                headers: {
                    ...buildHeaders(undefined, true),
                },
                body: JSON.stringify(data),
            }
        );
        const result = await res.json();
        console.log("Event tracked:", data.eventType, result);
        return result;
    } catch (error) {
        console.error("Failed to track event:", error);
    }
};

export const getUserEvents = async () => {
    try {
        const res = await fetchWithDevice(`${API_URL}/api/events`, {
            headers: buildHeaders(),
        });
        return res.json();
    } catch (error) {
        console.error("Failed to fetch events:", error);
        return [];
    }
};
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





export const addCourse = async (data: any) => {
    const res = await fetchWithDevice(`${API_URL}/api/courses/add`, {
        method: "POST",
        headers: buildHeaders(undefined, true),
        body: JSON.stringify(data),
    });
    return res.json();
};

export const getCourses = async () => {
    const res = await fetchWithDevice(`${API_URL}/api/courses`, {
        headers: buildHeaders(),
    });
    return res.json();
};

export const logCourseActivity = async (courseId: string, data: any) => {
    const res = await fetchWithDevice(`${API_URL}/api/courses/${courseId}/log-activity`, {
        method: "POST",
        headers: buildHeaders(undefined, true),
        body: JSON.stringify(data),
    });
    return res.json();
};

export const logHabit = async (data: any) => {
    const res = await fetchWithDevice(`${API_URL}/api/habits/log`, {
        method: "POST",
        headers: buildHeaders(undefined, true),
        body: JSON.stringify(data),
    });
    return res.json();
};

export const getRecentHabits = async () => {
    const res = await fetchWithDevice(`${API_URL}/api/habits/recent`, {
        headers: buildHeaders(),
    });
    return res.json();
};

export const fetchWeeklySummary = async () => {
    const res = await fetchWithDevice(`${API_URL}/api/analytics/weekly`, {
        headers: buildHeaders(),
    });
    return res.json();
};

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

export const getTodayHabit = async () => {
    const res = await fetchWithDevice(`${API_URL}/api/habits/recent`, {
        headers: buildHeaders(),
    });
    return res.json();
};



export const getCoursesList = async () => {
    return getCourses(); // reuse course fetch helper
};

export const wakeBackend = async () => {
    try {
        await fetch(`${API_URL}/health`, {
            headers: buildHeaders(),
            cache: "no-store",
        });
    } catch {
        // Best-effort wakeup only
    }
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

export const submitTodayLog = async (data: any) => {
    const res = await fetchWithDevice(
        `${API_URL}/api/daily-log/today`,
        {
            method: "POST",
            headers: buildHeaders(undefined, true),
            body: JSON.stringify(data),
        }
    );
    return res.json();
};

export const getWeeklyLogs = async () => {
    const res = await fetchWithDevice(
        `${API_URL}/api/daily-log/week`,
        {
            headers: buildHeaders(),
        }
    );
    return res.json();
};

export const getStreak = async () => {
    const res = await fetchWithDevice(`${API_URL}/api/streak`, {
        headers: buildHeaders(),
    });
    return res.json();
};

export const getStreakAndBadges = async () => {
    const res = await fetchWithDevice(`${API_URL}/api/streak/badges`, {
        headers: buildHeaders(),
    });
    return res.json();
};

export const getBurnoutRisk = async () => {
    const res = await fetchWithDevice(`${API_URL}/api/streak/burnout`, {
        headers: buildHeaders(),
    });
    return res.json();
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
