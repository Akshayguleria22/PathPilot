"use client";

import { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import SearchPanel from "@/components/SearchPanel";
import {
  getTodayHabit,
  fetchWeeklySummary,
  getCoursesList,
  getRecentHabits,
  getDailyReminder,
  getStreak,
  getBurnoutRisk,
} from "@/lib/api";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  FaBook,
  FaBed,
  FaBrain,
  FaSmile,
  FaChartLine,
  FaDumbbell,
  FaAppleAlt,
  FaCalendar,
  FaRocket,
  FaTrophy,
  FaFire,
  FaBell,
  FaUtensils,
  FaGamepad,
  FaMedal,
} from "react-icons/fa";
import { MdTrendingUp, MdTrendingDown } from "react-icons/md";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { SkeletonCard, SkeletonStat } from "@/components/SkeletonCard";

export default function Dashboard() {
  const [today, setToday] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [courseCount, setCourseCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [weekData, setWeekData] = useState<any[]>([]);
  const [reminderMessage, setReminderMessage] = useState<string>("");
  const [streak, setStreak] = useState<number>(0);
  const [burnout, setBurnout] = useState<any>(null);

  const load = async () => {
    try {
      const habits = await getTodayHabit();

      const todayDate = new Date().toISOString().split("T")[0];
      const todayHabit = habits.find((h: any) => h.date === todayDate);

      setToday(todayHabit || null);

      const weekly = await fetchWeeklySummary();
      setSummary(weekly);
      const courses = await getCoursesList();
      setCourseCount(courses.length);
      const recent = await getRecentHabits();
      setWeekData(Array.isArray(recent) ? recent : []);

      // Fetch reminder message
      const reminder = await getDailyReminder();
      setReminderMessage(reminder.message || "");

      // Fetch streak from server
      const streakData = await getStreak();
      setStreak(streakData.streak || 0);

      // Fetch burnout risk
      const burnoutData = await getBurnoutRisk();
      setBurnout(burnoutData);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
    },
  };

  return (
    <Protected>
      <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-10 transition-colors duration-300">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto space-y-8"
        >
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-3">
              <FaRocket className="text-zinc-600 dark:text-zinc-400" />
              Your Dashboard
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              Track your progress and stay on top of your goals
            </p>
          </div>

          {/* Reminder Banner */}
          {reminderMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-500/20 dark:via-purple-500/20 dark:to-pink-500/20 border-2 border-blue-500/30 dark:border-blue-400/30 shadow-lg">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-md">
                      <FaBell className="text-white text-xl" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-1">
                        Daily Reminder
                      </h3>
                      <p className="text-zinc-700 dark:text-zinc-300">
                        {reminderMessage}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Burnout Alert */}
          {burnout && burnout.level !== "low" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card
                className={`border-2 shadow-lg ${
                  burnout.level === "high"
                    ? "bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 dark:from-red-500/20 dark:via-orange-500/20 dark:to-yellow-500/20 border-red-500/30 dark:border-red-400/30"
                    : "bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-amber-500/10 dark:from-yellow-500/20 dark:via-orange-500/20 dark:to-amber-500/20 border-yellow-500/30 dark:border-yellow-400/30"
                }`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-xl shadow-md ${
                        burnout.level === "high"
                          ? "bg-gradient-to-br from-red-500 to-orange-600"
                          : "bg-gradient-to-br from-yellow-500 to-orange-600"
                      }`}
                    >
                      <FaBell className="text-white text-xl" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-1">
                        {burnout.level === "high"
                          ? "⚠️ High Burnout Risk"
                          : "⚡ Burnout Warning"}
                      </h3>
                      <p className="text-zinc-700 dark:text-zinc-300">
                        {burnout.message}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Search Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <SearchPanel />
          </motion.div>

          {/* Quick Stats */}
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
                icon={<FaBook />}
                title="Active Courses"
                value={courseCount}
                color="from-blue-500 to-cyan-500"
                variants={itemVariants}
              />
              <StatCard
                icon={<FaBrain />}
                title="Study Today"
                value={today ? `${today.study}h` : "0h"}
                subtitle={summary?.study ? `Avg: ${summary.study}h/day` : ""}
                color="from-purple-500 to-pink-500"
                variants={itemVariants}
              />
              <StatCard
                icon={<FaFire />}
                title="Current Streak"
                value={`${streak} days`}
                color="from-orange-500 to-red-500"
                variants={itemVariants}
              />
              <StatCard
                icon={<FaTrophy />}
                title="Days Tracked"
                value={summary?.count || 0}
                subtitle="This week"
                color="from-yellow-500 to-amber-500"
                variants={itemVariants}
              />
            </motion.div>
          )}

          {loading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid md:grid-cols-2 gap-6"
            >
              {/* Today's Summary */}
              <motion.div variants={itemVariants}>
                <Card className="h-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-lg hover:shadow-xl transition-all duration-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl text-zinc-800 dark:text-zinc-100">
                      <FaCalendar className="text-zinc-600 dark:text-zinc-400" />
                      Today's Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {today ? (
                      <>
                        <MetricRow
                          icon={<FaBed className="text-blue-500" />}
                          label="Sleep"
                          value={`${today.sleep}h`}
                          target="8h"
                          progress={(today.sleep / 8) * 100}
                        />
                        <MetricRow
                          icon={<FaBrain className="text-purple-500" />}
                          label="Study"
                          value={`${today.study}h`}
                          target="6h"
                          progress={(today.study / 6) * 100}
                        />
                        <MetricRow
                          icon={<FaDumbbell className="text-orange-500" />}
                          label="Exercise"
                          value={`${today.exercise}h`}
                          target="1h"
                          progress={(today.exercise / 1) * 100}
                        />
                        <MetricRow
                          icon={<FaUtensils className="text-yellow-500" />}
                          label="Food Quality"
                          value={`${today.foodQuality || 0}/10`}
                          progress={((today.foodQuality || 0) / 10) * 100}
                        />
                        <MetricRow
                          icon={<FaSmile className="text-pink-500" />}
                          label="Mood"
                          value={`${today.mood}/10`}
                          progress={(today.mood / 10) * 100}
                        />
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-4">
                          No entry for today yet
                        </p>
                        <Link href="/habits">
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold py-2 px-6 rounded-lg hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-all"
                          >
                            Log Today's Habits
                          </motion.button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Weekly Overview */}
              <motion.div variants={itemVariants}>
                <Card className="h-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-lg hover:shadow-xl transition-all duration-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl text-zinc-800 dark:text-zinc-100">
                      <FaChartLine className="text-zinc-600 dark:text-zinc-400" />
                      Weekly Averages
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {summary && summary.count > 0 ? (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <WeeklyStat
                            icon={<FaBed className="text-blue-500" />}
                            label="Sleep"
                            value={`${summary.sleep}h`}
                            trend={summary.sleep >= 7}
                          />
                          <WeeklyStat
                            icon={<FaBrain className="text-purple-500" />}
                            label="Study"
                            value={`${summary.study}h`}
                            trend={summary.study >= 5}
                          />
                          <WeeklyStat
                            icon={<FaDumbbell className="text-orange-500" />}
                            label="Exercise"
                            value={`${summary.exercise}h`}
                            trend={summary.exercise >= 0.5}
                          />
                          <WeeklyStat
                            icon={<FaGamepad className="text-green-500" />}
                            label="Entertainment"
                            value={`${summary.entertainment}h`}
                            trend={summary.entertainment <= 3}
                          />
                          <WeeklyStat
                            icon={<FaSmile className="text-pink-500" />}
                            label="Mood"
                            value={`${summary.mood}/10`}
                            trend={summary.mood >= 7}
                          />
                        </div>
                        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
                          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                            Weekly Consistency
                          </p>
                          <Progress
                            value={(summary.count / 7) * 100}
                            className="h-3"
                          />
                          <p className="text-xs text-zinc-500 mt-1">
                            {summary.count} out of 7 days logged
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-lg text-zinc-600 dark:text-zinc-400">
                          No weekly data yet
                        </p>
                        <p className="text-sm text-zinc-500 mt-2">
                          Start logging your habits to see weekly trends
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="grid md:grid-cols-3 gap-6"
          >
            <QuickLinkCard
              href="/courses"
              icon={<FaBook />}
              title="Manage Courses"
              description="View and update your learning paths"
              gradient="from-blue-500 to-cyan-500"
            />
            <QuickLinkCard
              href="/analytics"
              icon={<FaChartLine />}
              title="View Analytics"
              description="Get AI-powered insights on your progress"
              gradient="from-purple-500 to-pink-500"
            />
            <QuickLinkCard
              href="/badges"
              icon={<FaMedal />}
              title="Your Achievements"
              description="Check your badges and milestones"
              gradient="from-yellow-500 to-amber-500"
            />
          </motion.div>
        </motion.div>
      </main>
    </Protected>
  );
}

function StatCard({ icon, title, value, subtitle, color, variants }: any) {
  return (
    <motion.div variants={variants}>
      <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg overflow-hidden relative">
        <div
          className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${color} opacity-10 rounded-full blur-2xl`}
        ></div>
        <CardContent className="p-6 relative z-10">
          <div className="flex items-start justify-between mb-2">
            <div
              className={`text-3xl bg-gradient-to-br ${color} bg-clip-text text-transparent`}
            >
              {icon}
            </div>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">
            {value}
          </p>
          {subtitle && <p className="text-xs text-zinc-500 mt-1">{subtitle}</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function MetricRow({ icon, label, value, target, progress }: any) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
          <span className="text-xl">{icon}</span>
          <span className="font-medium">{label}</span>
        </div>
        <div className="font-semibold text-zinc-800 dark:text-zinc-100">
          {value}{" "}
          {target && <span className="text-sm text-zinc-500">/ {target}</span>}
        </div>
      </div>
      {progress !== undefined && (
        <Progress value={Math.min(progress, 100)} className="h-2" />
      )}
    </div>
  );
}

function WeeklyStat({ icon, label, value, trend }: any) {
  return (
    <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">{icon}</span>
        {trend !== undefined &&
          (trend ? (
            <MdTrendingUp className="text-green-500" />
          ) : (
            <MdTrendingDown className="text-red-500" />
          ))}
      </div>
      <p className="text-xs text-zinc-600 dark:text-zinc-400">{label}</p>
      <p className="text-lg font-bold text-zinc-800 dark:text-zinc-100">
        {value}
      </p>
    </div>
  );
}

function QuickLinkCard({ href, icon, title, description, gradient }: any) {
  return (
    <Link href={href}>
      <motion.div whileHover={{ scale: 1.02, y: -5 }} className="h-full">
        <Card className="h-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-md hover:shadow-xl transition-all duration-500 cursor-pointer overflow-hidden relative group">
          <div
            className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 rounded-full blur-2xl transition-opacity`}
          ></div>
          <CardContent className="p-6 relative z-10">
            <div
              className={`text-4xl mb-3 bg-gradient-to-br ${gradient} bg-clip-text text-transparent inline-block`}
            >
              {icon}
            </div>
            <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 mb-2">
              {title}
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400">{description}</p>
            <motion.div
              className="mt-4 text-zinc-800 dark:text-zinc-100 font-semibold"
              whileHover={{ x: 5 }}
            >
              View →
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}
