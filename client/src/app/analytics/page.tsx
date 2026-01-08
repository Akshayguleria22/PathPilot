"use client";
import { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import { fetchWeeklySummary, getAIAdvice, getRecentHabits } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  FaChartLine,
  FaBrain,
  FaRobot,
  FaBed,
  FaBook,
  FaGamepad,
  FaDumbbell,
  FaUtensils,
  FaSmile,
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

export default function Analytics() {
  const [summary, setSummary] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [advice, setAdvice] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

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

  const weeklyStudy = logs.reduce(
    (total, log) => total + (log.study || 0),
    0
  );

  const avgSleep =
    logs.length > 0
      ? logs.reduce((total, log) => total + (log.sleep || 0), 0) /
        logs.length
      : 0;

  const analyze = async () => {
    if (!summary) return;
    setLoading(true);
    const data = await getAIAdvice(summary);
    setAdvice(data.advice);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // Prepare chart data from logs - automatically filtered to current week by backend
  const chartData = logs.map((log: any) => {
    const date = new Date(log.date);
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
    return {
      day: dayName,
      sleep: log.sleep || 0,
      study: log.study || 0,
      exercise: log.exercise || 0,
      entertainment: log.entertainment || 0,
      mood: log.mood || 0,
      foodQuality: log.foodQuality || 0,
    };
  });

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
                        <FaBook className="text-3xl text-zinc-500 dark:text-zinc-600" />
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
                            This week's daily hours
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
                              parseFloat(metric.value) >= metric.target
                                ? "bg-green-600 dark:bg-green-500"
                                : "bg-orange-600 dark:bg-orange-500"
                            } text-white`}
                          >
                            Target: {metric.target}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <Progress
                            value={
                              (parseFloat(metric.value) / metric.target) * 100
                            }
                            className="h-2"
                          />
                          <p className="text-xs text-gray-500 text-right">
                            {(
                              (parseFloat(metric.value) / metric.target) *
                              100
                            ).toFixed(0)}
                            % of target
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* AI Feedback Section */}
              <Card className="bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3 text-zinc-800 dark:text-zinc-100">
                    <FaRobot className="text-3xl text-zinc-600 dark:text-zinc-400" />
                    AI-Powered Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-zinc-700 dark:text-zinc-300">
                    Get personalized recommendations based on your weekly habits
                  </p>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Button
                      onClick={analyze}
                      disabled={loading}
                      className="bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 h-12 px-8 text-lg shadow-md transition-all duration-300"
                    >
                      {loading ? (
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
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <FaBrain className="mr-2" />
                          Generate AI Feedback
                        </>
                      )}
                    </Button>
                  </motion.div>

                  {advice.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.6 }}
                      className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-md space-y-3 border border-zinc-200 dark:border-zinc-700"
                    >
                      <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                        <FaRobot className="text-zinc-600 dark:text-zinc-400" />
                        Your Personalized Recommendations
                      </h3>
                      <div className="space-y-2">
                        {advice.map((line, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.15, duration: 0.6 }}
                            className="flex items-start gap-3 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all duration-300"
                          >
                            <span className="text-zinc-600 dark:text-zinc-400 font-bold text-lg">
                              •
                            </span>
                            <p className="text-zinc-800 dark:text-zinc-200">
                              {line}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </Protected>
  );
}
