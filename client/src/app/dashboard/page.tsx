"use client";

import { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import {
  getTodayHabit,
  fetchWeeklySummary,
  getCoursesList,
  getRecentHabits,
  getDailyReminder,
  getStreak,
  getBurnoutRisk,
  getHabitTargets,
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
  const [showReminder, setShowReminder] = useState(true);
  const [showBurnout, setShowBurnout] = useState(true);
  const [showHabitAlert, setShowHabitAlert] = useState(true);
  const [habitTargets, setHabitTargets] = useState<any>({
    sleep: 8,
    study: 6,
    exercise: 1,
    foodQuality: 7,
    mood: 7,
    stress: 5,
  });

  const load = async () => {
    try {
      const habits = await getTodayHabit();

      const todayDate = new Date().toISOString().split("T")[0];
      const todayHabit = habits.find((h: any) => h.date === todayDate);

      setToday(todayHabit || null);

      const weekly = await fetchWeeklySummary();
      setSummary(weekly);
      const courses = await getCoursesList();
      setCourseCount(Array.isArray(courses) ? courses.length : 0);
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

      // Fetch habit targets
      const targets = await getHabitTargets();
      setHabitTargets(targets);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();

    // Auto-dismiss alerts after 10 seconds
    const reminderTimer = setTimeout(() => setShowReminder(false), 10000);
    const burnoutTimer = setTimeout(() => setShowBurnout(false), 15000);
    const habitTimer = setTimeout(() => setShowHabitAlert(false), 12000);

    // Listen for target updates from other pages
    const handleTargetUpdate = () => {
      console.log("Target updated, reloading dashboard data...");
      load();
    };
    window.addEventListener("targetUpdated", handleTargetUpdate);

    return () => {
      clearTimeout(reminderTimer);
      clearTimeout(burnoutTimer);
      clearTimeout(habitTimer);
      window.removeEventListener("targetUpdated", handleTargetUpdate);
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 },
    },
  };

  return (
    <Protected>
      <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-6 md:p-10 transition-colors duration-300">
        {/* Fixed Corner Alerts */}
        <div className="fixed top-20 right-4 z-40 space-y-3 max-w-sm">
          {/* Reminder */}
          {reminderMessage && showReminder && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-white dark:bg-zinc-900 border-l-4 border-blue-500 shadow-lg">
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <FaBell className="text-blue-500 text-sm mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-100 mb-0.5">
                        Daily Reminder
                      </p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-tight">
                        {reminderMessage}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowReminder(false)}
                      className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Burnout Alert */}
          {burnout && burnout.level !== "low" && showBurnout && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card
                className={`border-l-4 shadow-lg ${
                  burnout.level === "high"
                    ? "bg-white dark:bg-zinc-900 border-red-500"
                    : "bg-white dark:bg-zinc-900 border-yellow-500"
                }`}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <FaBell
                      className={`text-sm mt-0.5 flex-shrink-0 ${
                        burnout.level === "high"
                          ? "text-red-500"
                          : "text-yellow-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-100 mb-0.5">
                        {burnout.level === "high"
                          ? "⚠️ High Burnout Risk"
                          : "⚡ Burnout Warning"}
                      </p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-tight">
                        {burnout.message}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowBurnout(false)}
                      className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* No Habit Log Alert - Only show if today's habit is not logged */}
          {!today && showHabitAlert && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="bg-white dark:bg-zinc-900 border-l-4 border-purple-500 shadow-lg">
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <FaCalendar className="text-purple-500 text-sm mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-100 mb-0.5">
                        Log Today's Habits
                      </p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-tight mb-2">
                        Track your daily progress
                      </p>
                      <Link href="/habits">
                        <button className="text-xs bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded-md transition-colors">
                          Log Now →
                        </button>
                      </Link>
                    </div>
                    <button
                      onClick={() => setShowHabitAlert(false)}
                      className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto space-y-6 sm:space-y-8"
        >
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2 sm:gap-3">
              <FaRocket className="text-zinc-600 dark:text-zinc-400 text-2xl sm:text-3xl md:text-4xl" />
              Your Dashboard
            </h1>
            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400">
              Track your progress and stay on top of your goals
            </p>
          </div>

          {/* Quick Stats */}
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[...Array(4)].map((_, i) => (
                <SkeletonStat key={i} />
              ))}
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
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
            <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
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
                          target={`${habitTargets.sleep}h`}
                          progress={(today.sleep / habitTargets.sleep) * 100}
                        />
                        <MetricRow
                          icon={<FaBrain className="text-purple-500" />}
                          label="Study"
                          value={`${today.study}h`}
                          target={`${habitTargets.study}h`}
                          progress={(today.study / habitTargets.study) * 100}
                        />
                        <MetricRow
                          icon={<FaDumbbell className="text-orange-500" />}
                          label="Exercise"
                          value={`${today.exercise}h`}
                          target={`${habitTargets.exercise}h`}
                          progress={
                            (today.exercise / habitTargets.exercise) * 100
                          }
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
      <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition-all duration-300 shadow-md overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-zinc-800 dark:bg-zinc-100 rounded-lg">
              <div className="text-xl text-white dark:text-zinc-900">
                {icon}
              </div>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mb-1">
            {title}
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-zinc-800 dark:text-zinc-100">
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
    <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 border border-zinc-200 dark:border-zinc-700">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xl text-zinc-600 dark:text-zinc-400">{icon}</span>
        {trend !== undefined &&
          (trend ? (
            <MdTrendingUp className="text-green-600 dark:text-green-400" />
          ) : (
            <MdTrendingDown className="text-red-600 dark:text-red-400" />
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
        <Card className="h-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-md hover:shadow-xl transition-all duration-500 cursor-pointer overflow-hidden group">
          <CardContent className="p-4 sm:p-6">
            <div className="p-3 bg-zinc-800 dark:bg-zinc-100 rounded-lg inline-block mb-3">
              <div className="text-2xl sm:text-3xl text-white dark:text-zinc-900">
                {icon}
              </div>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-zinc-800 dark:text-zinc-100 mb-2">
              {title}
            </h3>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
              {description}
            </p>
            <motion.div
              className="mt-3 sm:mt-4 text-sm sm:text-base text-zinc-800 dark:text-zinc-100 font-semibold"
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
