"use client";

import { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import { getTodayHabit, fetchWeeklySummary, getCoursesList } from "@/lib/api";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  FaBook,
  FaBed,
  FaBrain,
  FaSmile,
  FaChartLine,
  FaTrophy,
  FaFire,
  FaRocket,
} from "react-icons/fa";
import { MdTrendingUp } from "react-icons/md";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { SkeletonCard, SkeletonStat } from "@/components/SkeletonCard";

export default function Home() {
  const [today, setToday] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [courseCount, setCourseCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const habits = await getTodayHabit();
    setToday(habits[0] ?? null);
    const weekly = await fetchWeeklySummary();
    setSummary(weekly);
    const courses = await getCoursesList();
    setCourseCount(courses.length);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  return (
    <Protected>
      <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-10 transition-colors duration-300">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="max-w-7xl mx-auto space-y-8"
        >
          <div className="text-center space-y-4 py-8">
            <motion.h1
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.2 }}
              className="text-5xl md:text-6xl font-bold text-zinc-800 dark:text-zinc-100"
            >
              Welcome to PathPilot 🚀
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.5 }}
              className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto"
            >
              Your personal journey to academic excellence starts here
            </motion.p>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <SkeletonStat key={i} />
              ))}
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <StatCard
                icon={<FaBook className="text-3xl" />}
                title="Active Courses"
                value={courseCount}
                color="bg-zinc-100 dark:bg-zinc-800"
                iconColor="text-zinc-700 dark:text-zinc-300"
                variants={itemVariants}
              />
              <StatCard
                icon={<FaBrain className="text-3xl" />}
                title="Study Hours"
                value={today ? `${today.study}h` : "0h"}
                color="bg-zinc-100 dark:bg-zinc-800"
                iconColor="text-zinc-700 dark:text-zinc-300"
                variants={itemVariants}
              />
              <StatCard
                icon={<FaFire className="text-3xl" />}
                title="Streak"
                value={summary?.count || 0}
                color="bg-zinc-100 dark:bg-zinc-800"
                iconColor="text-zinc-700 dark:text-zinc-300"
                variants={itemVariants}
              />
              <StatCard
                icon={<FaTrophy className="text-3xl" />}
                title="Weekly Avg"
                value={summary?.study ? `${summary.study}h` : "N/A"}
                color="bg-zinc-100 dark:bg-zinc-800"
                iconColor="text-zinc-700 dark:text-zinc-300"
                variants={itemVariants}
              />
            </motion.div>
          )}

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <motion.div variants={itemVariants}>
                <Card className="h-full hover:shadow-lg transition-all duration-500 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 group hover:scale-[1.02]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl text-zinc-800 dark:text-zinc-100">
                      <FaRocket className="text-zinc-600 dark:text-zinc-400" />
                      Today's Journey
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {today ? (
                      <div className="space-y-3">
                        <MetricRow
                          icon={<FaBed />}
                          label="Sleep"
                          value={`${today.sleep}h`}
                          target="8h"
                        />
                        <MetricRow
                          icon={<FaBrain />}
                          label="Study"
                          value={`${today.study}h`}
                          target="6h"
                        />
                        <MetricRow
                          icon={<FaSmile />}
                          label="Mood"
                          value={`${today.mood}/10`}
                        />
                        <div className="pt-2">
                          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                            Overall Progress
                          </p>
                          <Progress
                            value={(today.study / 6) * 100}
                            className="h-2"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-lg text-zinc-600 dark:text-zinc-400">
                          No entry for today yet
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-500">
                          Start tracking your habits!
                        </p>
                      </div>
                    )}
                    <Link href="/habits">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="w-full mt-4 bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold py-3 rounded-lg hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-all"
                      >
                        Update Today →
                      </motion.button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="h-full hover:shadow-lg transition-all duration-500 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 group hover:scale-[1.02]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl text-zinc-800 dark:text-zinc-100">
                      <FaBook className="text-zinc-600 dark:text-zinc-400" />
                      My Courses
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center py-4">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 150,
                          delay: 0.5,
                        }}
                        className="text-6xl font-bold mb-2 text-zinc-800 dark:text-zinc-100"
                      >
                        {courseCount}
                      </motion.div>
                      <p className="text-lg text-zinc-600 dark:text-zinc-400">
                        Active Learning Paths
                      </p>
                    </div>
                    {courseCount > 0 && (
                      <div className="flex flex-wrap gap-2 justify-center">
                        <Badge variant="outline">Academic</Badge>
                        <Badge variant="outline">Skills</Badge>
                        <Badge variant="outline">Growth</Badge>
                      </div>
                    )}
                    <Link href="/courses">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="w-full mt-4 bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold py-3 rounded-lg hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-all"
                      >
                        Manage Courses →
                      </motion.button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="h-full hover:shadow-lg transition-all duration-500 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 group hover:scale-[1.02]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl text-zinc-800 dark:text-zinc-100">
                      <FaChartLine className="text-zinc-600 dark:text-zinc-400" />
                      Weekly Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {summary && summary.count > 0 ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3">
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                              Avg Sleep
                            </p>
                            <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
                              {summary.sleep}h
                            </p>
                          </div>
                          <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3">
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                              Avg Study
                            </p>
                            <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
                              {summary.study}h
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3">
                          <MdTrendingUp className="text-2xl text-zinc-600 dark:text-zinc-400" />
                          <div>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                              Days Tracked
                            </p>
                            <p className="font-semibold text-zinc-800 dark:text-zinc-100">
                              {summary.count} days
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-lg text-zinc-600 dark:text-zinc-400">
                          No weekly data yet
                        </p>
                        <p className="text-sm text-zinc-500">
                          Start logging your habits
                        </p>
                      </div>
                    )}
                    <Link href="/analytics">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="w-full mt-4 bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold py-3 rounded-lg hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-all"
                      >
                        View Analytics →
                      </motion.button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}

          {/* About PathPilot Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-8"
          >
            <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-lg">
              <CardHeader>
                <CardTitle className="text-3xl text-zinc-800 dark:text-zinc-100 text-center">
                  What is PathPilot?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-lg text-zinc-600 dark:text-zinc-400 text-center max-w-3xl mx-auto">
                  PathPilot is your personal academic companion designed to help
                  students achieve excellence through data-driven insights and
                  habit tracking. We believe that success is built on consistent
                  daily habits and smart planning.
                </p>

                <div className="grid md:grid-cols-3 gap-6 mt-8">
                  <div className="text-center p-6 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                    <div className="text-4xl mb-3">📚</div>
                    <h3 className="font-bold text-zinc-800 dark:text-zinc-100 mb-2">
                      Track Courses
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Organize your learning paths and monitor progress for each
                      course
                    </p>
                  </div>
                  <div className="text-center p-6 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                    <div className="text-4xl mb-3">📊</div>
                    <h3 className="font-bold text-zinc-800 dark:text-zinc-100 mb-2">
                      Build Habits
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Log daily activities like sleep, study time, mood, and
                      wellness
                    </p>
                  </div>
                  <div className="text-center p-6 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                    <div className="text-4xl mb-3">🤖</div>
                    <h3 className="font-bold text-zinc-800 dark:text-zinc-100 mb-2">
                      Get AI Insights
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Receive personalized recommendations based on your
                      patterns
                    </p>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                  <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 mb-4 text-center">
                    ✨ Getting Started
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 text-zinc-700 dark:text-zinc-300">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">1️⃣</span>
                      <div>
                        <p className="font-semibold">Add Your Courses</p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          Start by adding all your current courses and set
                          weekly study goals
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">2️⃣</span>
                      <div>
                        <p className="font-semibold">Log Daily Habits</p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          Track your sleep, study time, mood, and other
                          important metrics each day
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">3️⃣</span>
                      <div>
                        <p className="font-semibold">Review Analytics</p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          Check your weekly summaries to identify trends and
                          patterns
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">4️⃣</span>
                      <div>
                        <p className="font-semibold">Get AI Feedback</p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          Use AI-powered insights to optimize your study routine
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="text-center py-8"
          >
            <Card className="max-w-3xl mx-auto bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
              <CardContent className="p-8">
                <p className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100 italic">
                  "The expert in anything was once a beginner."
                </p>
                <p className="text-zinc-600 dark:text-zinc-400 mt-2">
                  - Helen Hayes
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </Protected>
  );
}

function StatCard({ icon, title, value, color, iconColor, variants }: any) {
  return (
    <motion.div variants={variants}>
      <Card
        className={`${color} border-zinc-200 dark:border-zinc-800 hover:scale-[1.03] transition-all duration-500 shadow-sm hover:shadow-md`}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {title}
              </p>
              <p className="text-3xl font-bold mt-1 text-zinc-800 dark:text-zinc-100">
                {value}
              </p>
            </div>
            <div className={iconColor}>{icon}</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function MetricRow({ icon, label, value, target }: any) {
  return (
    <div className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3">
      <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
        {icon}
        <span>{label}</span>
      </div>
      <div className="font-semibold text-zinc-800 dark:text-zinc-100">
        {value}{" "}
        {target && <span className="text-sm text-zinc-500">/ {target}</span>}
      </div>
    </div>
  );
}
