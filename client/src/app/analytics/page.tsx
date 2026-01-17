"use client";
import { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import { fetchWeeklySummary, getRecentHabits } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  FaChartLine,
  FaBrain,
  FaBed,
  FaGamepad,
  FaDumbbell,
  FaUtensils,
  FaSmile,
  FaExclamationTriangle,
  FaRocket,
  FaRedo,
} from "react-icons/fa";
import { MdTrendingUp, MdTrendingDown } from "react-icons/md";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface DailyLog {
  date: string;
  sleep?: number;
  study?: number;
  exercise?: number;
  entertainment?: number;
  mood?: number;
  foodQuality?: number;
}

interface ChartDataPoint extends DailyLog {
  day: string;
  hasData: boolean;
}

interface WeeklySummary {
  sleep: number;
  study: number;
  exercise: number;
  entertainment: number;
  mood: number;
  foodQuality: number;
  count: number;
}

interface AIAnalytics {
  burnout_risk?: string;
  positive_trends?: string[];
  risk_factors?: string[];
  recommendations?: string[];
  overall_health_score?: number;
  next_week_focus?: string;
}

export default function Analytics() {
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [aiAnalytics, setAiAnalytics] = useState<AIAnalytics | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const loadAIAnalytics = async () => {
    setLoadingAI(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ai/analytics/behavior-insights`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            weeklySummary: summary,
            habits: logs,
          }),
        },
      );

      const data = await res.json();

      // Check if response is an error
      if (!res.ok || data.message) {
        console.error("AI analytics error:", data.message || data.error);
        setAiAnalytics(null);
        return;
      }

      // Validate response has required fields
      if (
        data &&
        data.burnout_risk &&
        data.positive_trends &&
        data.risk_factors
      ) {
        setAiAnalytics(data);
        localStorage.setItem("behavioral_insights", JSON.stringify(data));
      } else {
        console.error("Invalid AI analytics response:", data);
        setAiAnalytics(null);
      }
    } catch (error) {
      console.error("Failed to load AI analytics:", error);
      setAiAnalytics(null);
    } finally {
      setLoadingAI(false);
    }
  };

  const load = async () => {
    const data = await fetchWeeklySummary();
    setSummary(data);
    // Fetch recent habits (last 7 days)
    try {
      const habits = await getRecentHabits();
      console.log("Habits response:", habits);
      // API returns array directly
      setLogs(Array.isArray(habits) ? habits : []);
    } catch (error) {
      console.error("Error fetching habits:", error);
      setLogs([]);
    }
  };

  useEffect(() => {
    load();
    // Load cached behavioral insights with validation
    const cached = localStorage.getItem("behavioral_insights");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        // Validate cached data has required fields
        if (
          parsed &&
          parsed.burnout_risk &&
          parsed.positive_trends &&
          parsed.risk_factors
        ) {
          setAiAnalytics(parsed);
        } else {
          // Invalid cached data, remove it
          localStorage.removeItem("behavioral_insights");
        }
      } catch (error) {
        console.error("Failed to parse cached insights:", error);
        localStorage.removeItem("behavioral_insights");
      }
    }

    // Listen for target updates from other pages
    const handleTargetUpdate = () => {
      console.log("Target updated, reloading analytics data...");
      load();
    };
    window.addEventListener("targetUpdated", handleTargetUpdate);

    return () => {
      window.removeEventListener("targetUpdated", handleTargetUpdate);
    };
  }, []);

  // Prepare chart data from logs - automatically filtered to current week by backend
  const chartData = (() => {
    // Get current week (Monday to Sunday)
    const now = new Date();
    const currentDay = now.getDay();
    const diff = currentDay === 0 ? -6 : 1 - currentDay; // Adjust when day is Sunday
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);

    // Create array for all 7 days of the week
    const weekDays = [];
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(monday);
      currentDate.setDate(monday.getDate() + i);
      const dateStr = currentDate.toISOString().split("T")[0];

      // Find log for this date
      const log = logs.find((l: DailyLog) => l.date === dateStr);

      weekDays.push({
        day: dayNames[i],
        date: dateStr,
        sleep: log?.sleep || 0,
        study: log?.study || 0,
        exercise: log?.exercise || 0,
        entertainment: log?.entertainment || 0,
        mood: log?.mood || 0,
        foodQuality: log?.foodQuality || 0,
        hasData: !!log, // Track if this day has data
      });
    }

    return weekDays;
  })();

  const metrics = summary
    ? [
        {
          key: "sleep",
          label: "Sleep",
          value: summary.sleep,
          icon: <FaBed />,
          color: "from-blue-500 to-cyan-500",
          target: 8,
        },
        {
          key: "study",
          label: "Study",
          value: summary.study,
          icon: <FaBrain />,
          color: "from-purple-500 to-pink-500",
          target: 6,
        },
        {
          key: "entertainment",
          label: "Entertainment",
          value: summary.entertainment,
          icon: <FaGamepad />,
          color: "from-green-500 to-teal-500",
          target: 2,
        },
        {
          key: "exercise",
          label: "Exercise",
          value: summary.exercise,
          icon: <FaDumbbell />,
          color: "from-orange-500 to-red-500",
          target: 1,
        },
        {
          key: "mood",
          label: "Mood",
          value: summary.mood,
          icon: <FaSmile />,
          color: "from-pink-500 to-rose-500",
          target: 7,
          max: 10,
        },
      ]
    : [];

  return (
    <Protected>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-3">
              <FaChartLine className="text-zinc-600 dark:text-zinc-400" />
              Weekly Analytics
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-2 text-lg">
              Track your progress and get AI-powered insights
            </p>
          </motion.div>

          {!summary || summary.count === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="text-center py-20"
            >
              <Card className="max-w-2xl mx-auto bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-lg">
                <CardContent className="p-12">
                  <FaChartLine className="text-zinc-300 dark:text-zinc-700 text-8xl mx-auto mb-6" />
                  <h3 className="text-3xl font-bold text-zinc-400 dark:text-zinc-600 mb-4">
                    No Data Yet
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 text-lg">
                    Start logging your daily habits to see analytics and
                    insights!
                  </p>
                  <Button
                    onClick={() => (window.location.href = "/habits")}
                    className="mt-6 bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900 h-12 px-8 text-lg"
                  >
                    Log Your First Habit →
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                  whileHover={{ scale: 1.03 }}
                >
                  <Card className="bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          Days Tracked
                        </p>
                        <FaChartLine className="text-3xl text-zinc-500 dark:text-zinc-600" />
                      </div>
                      <p className="text-5xl font-bold text-zinc-800 dark:text-zinc-100">
                        {summary.count}
                      </p>
                      <p className="text-sm text-zinc-500 mt-1">This week</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15, duration: 0.6 }}
                  whileHover={{ scale: 1.03 }}
                >
                  <Card className="bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          Avg Study Time
                        </p>
                        <FaBrain className="text-3xl text-zinc-500 dark:text-zinc-600" />
                      </div>
                      <p className="text-5xl font-bold text-zinc-800 dark:text-zinc-100">
                        {summary.study}
                        <span className="text-2xl">h</span>
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {summary.study >= 6 ? (
                          <MdTrendingUp className="text-green-600 dark:text-green-400" />
                        ) : (
                          <MdTrendingDown className="text-red-600 dark:text-red-400" />
                        )}
                        <p className="text-sm text-zinc-500">per day</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  whileHover={{ scale: 1.03 }}
                >
                  <Card className="bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          Avg Mood
                        </p>
                        <FaSmile className="text-3xl text-zinc-500 dark:text-zinc-600" />
                      </div>
                      <p className="text-5xl font-bold text-zinc-800 dark:text-zinc-100">
                        {summary.mood}
                        <span className="text-2xl">/10</span>
                      </p>
                      <p className="text-sm text-zinc-500 mt-1">
                        Feeling good!
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/5 dark:to-teal-500/5 border-emerald-400/30 dark:border-emerald-600/30 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-zinc-800 dark:text-zinc-100">
                    <FaChartLine className="text-emerald-600 dark:text-emerald-400" />
                    AI Behavioral Insights
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  {!aiAnalytics && (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Button
                        onClick={loadAIAnalytics}
                        disabled={loadingAI}
                        className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white h-12 px-8 text-lg shadow-md transition-all duration-300"
                      >
                        {loadingAI ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                            />
                            Analyzing your habits...
                          </>
                        ) : (
                          <>
                            <FaBrain className="mr-2" />
                            Analyze Behavior
                          </>
                        )}
                      </Button>
                    </motion.div>
                  )}

                  {aiAnalytics && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      className="space-y-6"
                    >
                      {/* Burnout Risk */}
                      <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
                        <p className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                          <FaExclamationTriangle
                            className={`${
                              aiAnalytics.burnout_risk === "high"
                                ? "text-red-600 dark:text-red-400"
                                : aiAnalytics.burnout_risk === "medium"
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-green-600 dark:text-green-400"
                            }`}
                          />
                          Burnout Risk:
                          <span
                            className={`${
                              aiAnalytics.burnout_risk === "high"
                                ? "text-red-600 dark:text-red-400"
                                : aiAnalytics.burnout_risk === "medium"
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-green-600 dark:text-green-400"
                            }`}
                          >
                            {aiAnalytics.burnout_risk?.toUpperCase() ||
                              "UNKNOWN"}
                          </span>
                        </p>
                      </div>

                      {/* Positive Trends */}
                      <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
                        <h4 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-3 flex items-center gap-2">
                          <MdTrendingUp className="text-green-600 dark:text-green-400" />
                          Positive Trends
                        </h4>
                        <ul className="space-y-2">
                          {Array.isArray(aiAnalytics.positive_trends) &&
                            aiAnalytics.positive_trends.map(
                              (t: string, i: number) => (
                                <li
                                  key={i}
                                  className="flex items-start gap-2 text-zinc-700 dark:text-zinc-300"
                                >
                                  <span className="text-green-600 dark:text-green-400">
                                    •
                                  </span>
                                  {t}
                                </li>
                              ),
                            )}
                        </ul>
                      </div>

                      {/* Risk Factors */}
                      <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
                        <h4 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-3 flex items-center gap-2">
                          <MdTrendingDown className="text-red-600 dark:text-red-400" />
                          Risk Factors
                        </h4>
                        <ul className="space-y-2">
                          {Array.isArray(aiAnalytics.risk_factors) &&
                            aiAnalytics.risk_factors.map(
                              (r: string, i: number) => (
                                <li
                                  key={i}
                                  className="flex items-start gap-2 text-zinc-700 dark:text-zinc-300"
                                >
                                  <span className="text-red-600 dark:text-red-400">
                                    •
                                  </span>
                                  {r}
                                </li>
                              ),
                            )}
                        </ul>
                      </div>

                      {/* Next Week Focus */}
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-600 dark:to-teal-600 rounded-lg p-6 text-white shadow-md">
                        <p className="text-lg font-semibold flex items-center gap-2">
                          <FaRocket />
                          Next Week Focus:
                        </p>
                        <p className="mt-2 text-white/90">
                          {aiAnalytics.next_week_focus ||
                            "Focus on maintaining consistency in your studies."}
                        </p>
                      </div>

                      {/* Refresh Button */}
                      <Button
                        onClick={loadAIAnalytics}
                        disabled={loadingAI}
                        variant="outline"
                        className="w-full border-emerald-400 dark:border-emerald-600 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                      >
                        <FaRedo className="mr-2" />
                        Refresh Insights
                      </Button>
                    </motion.div>
                  )}
                </CardContent>
              </Card>

              {/* Debug info */}
              <div className="text-xs text-zinc-500 dark:text-zinc-400 p-2 bg-zinc-100 dark:bg-zinc-800 rounded">
                Logs fetched: {logs.length} | Chart data points:{" "}
                {chartData.length}
              </div>

              {/* Weekly Progress Overview - Full Width */}
              {chartData.length > 0 ? (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.7 }}
                  >
                    <Card className="bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 border-zinc-200 dark:border-zinc-700 shadow-xl">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-2xl flex items-center gap-3 text-zinc-800 dark:text-zinc-100">
                              <FaChartLine className="text-zinc-600 dark:text-zinc-400" />
                              Weekly Progress Overview
                            </CardTitle>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                              All key metrics for the current week
                            </p>
                          </div>
                          <Badge className="bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm px-4 py-2">
                            {chartData.length}{" "}
                            {chartData.length === 1 ? "Day" : "Days"} Logged
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={400}>
                          <LineChart data={chartData}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              className="stroke-zinc-300 dark:stroke-zinc-700"
                            />
                            <XAxis
                              dataKey="day"
                              className="text-sm text-zinc-700 dark:text-zinc-300"
                              stroke="#71717a"
                            />
                            <YAxis
                              className="text-sm text-zinc-700 dark:text-zinc-300"
                              stroke="#71717a"
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#18181b",
                                border: "1px solid #3f3f46",
                                borderRadius: "12px",
                                color: "#fafafa",
                                padding: "12px",
                              }}
                              cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
                            />
                            <Line
                              type="monotone"
                              dataKey="sleep"
                              stroke="#3b82f6"
                              strokeWidth={3}
                              name="Sleep (hrs)"
                              dot={{ fill: "#3b82f6", r: 6 }}
                              activeDot={{ r: 8 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="study"
                              stroke="#a855f7"
                              strokeWidth={3}
                              name="Study (hrs)"
                              dot={{ fill: "#a855f7", r: 6 }}
                              activeDot={{ r: 8 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="exercise"
                              stroke="#f97316"
                              strokeWidth={3}
                              name="Exercise (hrs)"
                              dot={{ fill: "#f97316", r: 6 }}
                              activeDot={{ r: 8 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="entertainment"
                              stroke="#10b981"
                              strokeWidth={3}
                              name="Entertainment (hrs)"
                              dot={{ fill: "#10b981", r: 6 }}
                              activeDot={{ r: 8 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>

                        {/* Legend */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                            <span className="text-sm text-zinc-700 dark:text-zinc-300">
                              Sleep
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                            <span className="text-sm text-zinc-700 dark:text-zinc-300">
                              Study
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                            <span className="text-sm text-zinc-700 dark:text-zinc-300">
                              Exercise
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-green-500"></div>
                            <span className="text-sm text-zinc-700 dark:text-zinc-300">
                              Entertainment
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Charts Section */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Study & Sleep Trend */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.7 }}
                    >
                      <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-lg">
                        <CardHeader>
                          <CardTitle className="text-xl flex items-center gap-2 text-zinc-800 dark:text-zinc-100">
                            <FaBrain className="text-purple-600 dark:text-purple-400" />
                            Study & Sleep Trends
                          </CardTitle>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            This week&apos;s daily hours
                          </p>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={chartData}>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                className="stroke-zinc-200 dark:stroke-zinc-700"
                              />
                              <XAxis
                                dataKey="day"
                                className="text-xs text-zinc-600 dark:text-zinc-400"
                              />
                              <YAxis className="text-xs text-zinc-600 dark:text-zinc-400" />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "#18181b",
                                  border: "1px solid #3f3f46",
                                  borderRadius: "8px",
                                }}
                              />
                              <Line
                                type="monotone"
                                dataKey="study"
                                stroke="#a855f7"
                                strokeWidth={3}
                                name="Study (hrs)"
                                dot={{ fill: "#a855f7", r: 5 }}
                              />
                              <Line
                                type="monotone"
                                dataKey="sleep"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                name="Sleep (hrs)"
                                dot={{ fill: "#3b82f6", r: 5 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Daily Activities */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.7 }}
                    >
                      <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-lg">
                        <CardHeader>
                          <CardTitle className="text-xl flex items-center gap-2 text-zinc-800 dark:text-zinc-100">
                            <FaGamepad className="text-green-600 dark:text-green-400" />
                            Daily Activities
                          </CardTitle>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            Exercise & Entertainment hours
                          </p>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={chartData}>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                className="stroke-zinc-200 dark:stroke-zinc-700"
                              />
                              <XAxis
                                dataKey="day"
                                className="text-xs text-zinc-600 dark:text-zinc-400"
                              />
                              <YAxis className="text-xs text-zinc-600 dark:text-zinc-400" />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "#18181b",
                                  border: "1px solid #3f3f46",
                                  borderRadius: "8px",
                                }}
                              />
                              <Bar
                                dataKey="exercise"
                                fill="#f97316"
                                name="Exercise (hrs)"
                                radius={[8, 8, 0, 0]}
                              />
                              <Bar
                                dataKey="entertainment"
                                fill="#10b981"
                                name="Entertainment (hrs)"
                                radius={[8, 8, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Mood & Food Quality */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6, duration: 0.7 }}
                    >
                      <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-lg">
                        <CardHeader>
                          <CardTitle className="text-xl flex items-center gap-2 text-zinc-800 dark:text-zinc-100">
                            <FaSmile className="text-pink-600 dark:text-pink-400" />
                            Mood Tracking
                          </CardTitle>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            Daily mood ratings (1-10)
                          </p>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={chartData}>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                className="stroke-zinc-200 dark:stroke-zinc-700"
                              />
                              <XAxis
                                dataKey="day"
                                className="text-xs text-zinc-600 dark:text-zinc-400"
                              />
                              <YAxis
                                domain={[1, 10]}
                                className="text-xs text-zinc-600 dark:text-zinc-400"
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "#18181b",
                                  border: "1px solid #3f3f46",
                                  borderRadius: "8px",
                                }}
                              />
                              <Bar
                                dataKey="mood"
                                fill="#ec4899"
                                name="Mood"
                                radius={[8, 8, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Food Quality */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7, duration: 0.7 }}
                    >
                      <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-lg">
                        <CardHeader>
                          <CardTitle className="text-xl flex items-center gap-2 text-zinc-800 dark:text-zinc-100">
                            <FaUtensils className="text-amber-600 dark:text-amber-400" />
                            Food Quality
                          </CardTitle>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            Daily nutrition ratings (1-10)
                          </p>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={chartData}>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                className="stroke-zinc-200 dark:stroke-zinc-700"
                              />
                              <XAxis
                                dataKey="day"
                                className="text-xs text-zinc-600 dark:text-zinc-400"
                              />
                              <YAxis
                                domain={[1, 10]}
                                className="text-xs text-zinc-600 dark:text-zinc-400"
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "#18181b",
                                  border: "1px solid #3f3f46",
                                  borderRadius: "8px",
                                }}
                              />
                              <Line
                                type="monotone"
                                dataKey="foodQuality"
                                stroke="#f59e0b"
                                strokeWidth={3}
                                name="Food Quality"
                                dot={{ fill: "#f59e0b", r: 5 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  <Card className="bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                    <CardContent className="p-8 text-center">
                      <FaChartLine className="text-zinc-300 dark:text-zinc-600 text-6xl mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-zinc-600 dark:text-zinc-400 mb-2">
                        No Daily Logs Yet
                      </h3>
                      <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                        Log your daily habits to see weekly progress charts!
                      </p>
                      <Button
                        onClick={() => (window.location.href = "/habits")}
                        className="bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900"
                      >
                        Go to Habits →
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Detailed Metrics */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {metrics.map((metric, index) => (
                  <motion.div
                    key={metric.key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.7 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition-all duration-500">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-3">
                          <div className="p-3 rounded-xl bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xl">
                            {metric.icon}
                          </div>
                          <div>
                            <p className="text-lg font-bold text-zinc-800 dark:text-zinc-100">
                              {metric.label}
                            </p>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                              Weekly Average
                            </p>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-end justify-between">
                          <span className="text-4xl font-bold text-zinc-800 dark:text-zinc-100">
                            {metric.value}
                            {metric.max ? (
                              <span className="text-xl text-zinc-500">
                                /{metric.max}
                              </span>
                            ) : (
                              <span className="text-xl text-zinc-500">h</span>
                            )}
                          </span>
                          <Badge
                            className={`${
                              metric.value >= metric.target
                                ? "bg-green-600 dark:bg-green-500"
                                : "bg-orange-600 dark:bg-orange-500"
                            } text-white`}
                          >
                            Target: {metric.target}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <Progress
                            value={(metric.value / metric.target) * 100}
                            className="h-2"
                          />
                          <p className="text-xs text-gray-500 text-right">
                            {((metric.value / metric.target) * 100).toFixed(0)}%
                            of target
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* AI Behavioral Insights */}
            </>
          )}
        </div>
      </div>
    </Protected>
  );
}
