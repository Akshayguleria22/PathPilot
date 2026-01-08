export const API_URL = "http://localhost:5000";

export const registerUser = async (data: any) => {
    const res = await fetch(`${API_URL}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return res.json();
};

export const loginUser = async (data: any) => {
    const res = await fetch(`${API_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return res.json();
};

export const getDailyReminder = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(
        `${API_URL}/api/daily-log/reminder`,
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    return res.json();
};


export const addCourse = async (data: any) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/courses/add`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    return res.json();
};

export const getCourses = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/courses`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
};

export const logHabit = async (data: any) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/habits/log`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    return res.json();
};

export const getRecentHabits = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/habits/recent`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
};


export const fetchWeeklySummary = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/analytics/weekly`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
};

export const getAIAdvice = async (data: any) => {
    const res = await fetch(`http://127.0.0.1:8000/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return res.json();
};

export const getTodayHabit = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/habits/recent`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
};

export const getCoursesList = async () => {
    return getCourses(); // reuse course fetch helper
};
export const generateRoadmap = async (courseId: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(
        `${API_URL}/api/roadmap/generate/${courseId}`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return res.json();
};

export const getRoadmap = async (courseId: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(
        `${API_URL}/api/roadmap/${courseId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
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
    const token = localStorage.getItem("token");

    const res = await fetch(
        `${API_URL}/api/roadmap/${courseId}/step/${stepIndex}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
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
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/assessment/${courseId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ score, confidence }),
    });
    return res.json();
};

export const getAIRoadmapAdvice = async (courseId: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/roadmap/adapt/${courseId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || "AI needs more data to adapt the roadmap.");
    }
    return data;
};

export const autoAdaptRoadmap = async (courseId: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/roadmap/adapt/${courseId}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || "AI needs more data.");
    }
    return data;
};

export const submitTodayLog = async (data: any) => {
    const token = localStorage.getItem("token");
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/daily-log/today`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        }
    );
    return res.json();
};

export const getWeeklyLogs = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/daily-log/week`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return res.json();
};
