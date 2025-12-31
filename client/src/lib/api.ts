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
