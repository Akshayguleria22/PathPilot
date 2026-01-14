"use client";

import { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import { getRecentHabits, getStreakAndBadges } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  FaTrophy,
  FaFire,
  FaBrain,
  FaBed,
  FaMedal,
  FaStar,
  FaCrown,
  FaGem,
  FaRocket,
  FaHeart,
  FaBolt,
  FaShieldAlt,
  FaDragon,
  FaMountain,
  FaBook,
  FaGraduationCap,
  FaCertificate,
  FaAward,
  FaDumbbell,
} from "react-icons/fa";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function BadgesPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [serverBadges, setServerBadges] = useState<string[]>([]);
  const [totalDays, setTotalDays] = useState(logs.length);
  const [totalStudyHours, setTotalStudyHours] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const [habitsData, streakData] = await Promise.all([
          getRecentHabits(),
          getStreakAndBadges(),
        ]);
        setLogs(Array.isArray(habitsData) ? habitsData : []);
        setStreak(streakData.streak || 0);
        setServerBadges(streakData.badges || []);
        setTotalDays(streakData.totalDays || 0);
        setTotalStudyHours(streakData.totalStudyHours || 0);
      } catch (error) {
        console.error("Error fetching logs:", error);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalStudy = logs.reduce((a, d) => a + (d.study || 0), 0);
  const avgStudy = totalDays ? totalStudy / totalDays : 0;
  const avgSleep =
    totalDays > 0
      ? logs.reduce((a, d) => a + (d.sleep || 0), 0) / totalDays
      : 0;
  const avgMood =
    totalDays > 0 ? logs.reduce((a, d) => a + (d.mood || 0), 0) / totalDays : 0;

  const baseBadges = [
    // STREAK ACHIEVEMENTS
    {
      name: "Week Warrior",
      description: "Maintain a 7-day streak",
      icon: <FaFire />,
      unlocked: serverBadges.includes("Week Warrior"),
      progress: Math.min((streak / 7) * 100, 100),
      gradient: "from-orange-500 to-red-500",
      category: "Streak Master",
    },
    {
      name: "Fortnight Fighter",
      description: "Achieve a 14-day streak",
      icon: <FaBolt />,
      unlocked: serverBadges.includes("Fortnight Fighter"),
      progress: Math.min((streak / 14) * 100, 100),
      gradient: "from-yellow-500 to-orange-500",
      category: "Streak Master",
    },
    {
      name: "Monthly Master",
      description: "Complete a 30-day streak",
      icon: <FaCrown />,
      unlocked: serverBadges.includes("Monthly Master"),
      progress: Math.min((streak / 30) * 100, 100),
      gradient: "from-purple-500 to-pink-500",
      category: "Streak Master",
    },
    {
      name: "Consistency Champion",
      description: "Reach a 60-day streak",
      icon: <FaTrophy />,
      unlocked: serverBadges.includes("Consistency Champion"),
      progress: Math.min((streak / 60) * 100, 100),
      gradient: "from-cyan-500 to-blue-500",
      category: "Streak Master",
    },
    {
      name: "Quarter Legend",
      description: "Achieve a 90-day streak",
      icon: <FaGem />,
      unlocked: serverBadges.includes("Quarter Legend"),
      progress: Math.min((streak / 90) * 100, 100),
      gradient: "from-emerald-500 to-teal-500",
      category: "Streak Master",
    },
    {
      name: "Century Achiever",
      description: "Reach 100-day streak milestone",
      icon: <FaMedal />,
      unlocked: serverBadges.includes("Century Achiever"),
      progress: Math.min((streak / 100) * 100, 100),
      gradient: "from-amber-500 to-yellow-500",
      category: "Streak Master",
    },
    {
      name: "Half Year Hero",
      description: "Maintain 180-day streak",
      icon: <FaShieldAlt />,
      unlocked: serverBadges.includes("Half Year Hero"),
      progress: Math.min((streak / 180) * 100, 100),
      gradient: "from-indigo-500 to-purple-500",
      category: "Elite Streaks",
    },
    {
      name: "Year Long Warrior",
      description: "Complete a full year streak (365 days)",
      icon: <FaDragon />,
      unlocked: serverBadges.includes("Year Long Warrior"),
      progress: Math.min((streak / 365) * 100, 100),
      gradient: "from-rose-500 to-pink-500",
      category: "Elite Streaks",
    },
    {
      name: "Unstoppable Force",
      description: "Achieve a legendary 500-day streak",
      icon: <FaMountain />,
      unlocked: serverBadges.includes("Unstoppable Force"),
      progress: Math.min((streak / 500) * 100, 100),
      gradient: "from-violet-500 to-fuchsia-500",
      category: "Elite Streaks",
    },
    {
      name: "Two Year Titan",
      description: "Master a 730-day streak",
      icon: <FaAward />,
      unlocked: serverBadges.includes("Two Year Titan"),
      progress: Math.min((streak / 730) * 100, 100),
      gradient: "from-red-500 to-orange-500",
      category: "Elite Streaks",
    },

    // TOTAL DAYS LOGGED
    {
      name: "30 Days Strong",
      description: "Log habits for 30 total days",
      icon: <FaFire />,
      unlocked: serverBadges.includes("30 Days Strong"),
      progress: Math.min((totalDays / 30) * 100, 100),
      gradient: "from-orange-400 to-red-400",
      category: "Milestone",
    },
    {
      name: "50 Days Dedicated",
      description: "Reach 50 days tracked",
      icon: <FaStar />,
      unlocked: serverBadges.includes("50 Days Dedicated"),
      progress: Math.min((totalDays / 50) * 100, 100),
      gradient: "from-yellow-400 to-amber-400",
      category: "Milestone",
    },
    {
      name: "100 Days Milestone",
      description: "Track 100 days of habits",
      icon: <FaMedal />,
      unlocked: serverBadges.includes("100 Days Milestone"),
      progress: Math.min((totalDays / 100) * 100, 100),
      gradient: "from-blue-400 to-cyan-400",
      category: "Milestone",
    },
    {
      name: "200 Days Legend",
      description: "Log 200 days of progress",
      icon: <FaCrown />,
      unlocked: serverBadges.includes("200 Days Legend"),
      progress: Math.min((totalDays / 200) * 100, 100),
      gradient: "from-purple-400 to-pink-400",
      category: "Milestone",
    },
    {
      name: "Year Tracker",
      description: "Track habits for 365 days",
      icon: <FaTrophy />,
      unlocked: serverBadges.includes("Year Tracker"),
      progress: Math.min((totalDays / 365) * 100, 100),
      gradient: "from-emerald-400 to-teal-400",
      category: "Milestone",
    },

    // STUDY HOURS ACHIEVEMENTS
    {
      name: "Study Starter",
      description: "Complete 50 hours of study",
      icon: <FaBook />,
      unlocked: serverBadges.includes("Study Starter"),
      progress: Math.min((totalStudyHours / 50) * 100, 100),
      gradient: "from-blue-500 to-indigo-500",
      category: "Study Progress",
    },
    {
      name: "Study Enthusiast",
      description: "Reach 100 hours of study",
      icon: <FaBrain />,
      unlocked: serverBadges.includes("Study Enthusiast"),
      progress: Math.min((totalStudyHours / 100) * 100, 100),
      gradient: "from-purple-500 to-violet-500",
      category: "Study Progress",
    },
    {
      name: "Study Master",
      description: "Achieve 250 hours of study",
      icon: <FaGraduationCap />,
      unlocked: serverBadges.includes("Study Master"),
      progress: Math.min((totalStudyHours / 250) * 100, 100),
      gradient: "from-cyan-500 to-blue-500",
      category: "Study Progress",
    },
    {
      name: "Study Legend",
      description: "Complete 500 hours of study",
      icon: <FaCertificate />,
      unlocked: serverBadges.includes("Study Legend"),
      progress: Math.min((totalStudyHours / 500) * 100, 100),
      gradient: "from-green-500 to-emerald-500",
      category: "Study Progress",
    },
    {
      name: "Study Titan",
      description: "Master 1000 hours of study",
      icon: <FaMountain />,
      unlocked: serverBadges.includes("Study Titan"),
      progress: Math.min((totalStudyHours / 1000) * 100, 100),
      gradient: "from-amber-500 to-orange-500",
      category: "Study Progress",
    },

    // WELLNESS ACHIEVEMENTS
    {
      name: "Sleep Champion",
      description: "Maintain 7+ hours average sleep",
      icon: <FaBed />,
      unlocked: avgSleep >= 7,
      progress: Math.min((avgSleep / 7) * 100, 100),
      gradient: "from-indigo-500 to-blue-500",
      category: "Wellness",
    },
    {
      name: "Positive Mindset",
      description: "Keep 7+ average mood rating",
      icon: <FaHeart />,
      unlocked: avgMood >= 7,
      progress: Math.min((avgMood / 7) * 100, 100),
      gradient: "from-pink-500 to-rose-500",
      category: "Wellness",
    },
    {
      name: "Balanced Life",
      description: "Achieve 8+ hours sleep & 7+ mood",
      icon: <FaDumbbell />,
      unlocked: avgSleep >= 8 && avgMood >= 7,
      progress: Math.min(((avgSleep / 8 + avgMood / 7) / 2) * 100, 100),
      gradient: "from-teal-500 to-cyan-500",
      category: "Wellness",
    },
  ];

  const baseUnlockedCount = baseBadges.filter((b) => b.unlocked).length;

  const badges = [
    ...baseBadges,
    {
      name: "Ultimate Champion",
      description: "Unlock all achievements",
      icon: <FaRocket />,
      unlocked: baseUnlockedCount === baseBadges.length,
      progress: (baseUnlockedCount / baseBadges.length) * 100,
      gradient: "from-violet-500 to-purple-500",
      category: "Ultimate",
    },
  ];

  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const categories = [
    "Streak Master",
    "Elite Streaks",
    "Milestone",
    "Study Progress",
    "Wellness",
    "Ultimate",
  ];

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
              <FaTrophy className="text-zinc-600 dark:text-zinc-400" />
              Achievements & Badges
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-2 text-lg">
              Celebrate your progress and unlock new milestones
            </p>
          </motion.div>

          {/* Overall Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-gradient-to-r from-purple-500 to-pink-500 border-none shadow-xl">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-3 gap-6 text-white">
                  <div className="text-center">
                    <FaMedal className="text-6xl mx-auto mb-3" />
                    <p className="text-sm opacity-90 mb-1">Badges Unlocked</p>
                    <p className="text-5xl font-bold">{unlockedCount}</p>
                    <p className="text-sm opacity-90">out of {badges.length}</p>
                  </div>
                  <div className="md:col-span-2 flex flex-col justify-center">
                    <div className="mb-3">
                      <p className="text-lg font-semibold mb-2">
                        Overall Achievement Progress
                      </p>
                      <Progress
                        value={(unlockedCount / badges.length) * 100}
                        className="h-4 bg-white/20"
                      />
                    </div>
                    <p className="text-sm opacity-90">
                      {Math.round((unlockedCount / badges.length) * 100)}%
                      Complete
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Badges by Category */}
          {categories.map((category, catIndex) => (
            <div key={category}>
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: catIndex * 0.1 }}
                className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-4 flex items-center gap-2"
              >
                <Badge className="bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900 px-3 py-1">
                  {category}
                </Badge>
              </motion.h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {badges
                  .filter((badge) => badge.category === category)
                  .map((badge, index) => (
                    <motion.div
                      key={badge.name}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.6,
                        delay: catIndex * 0.1 + index * 0.1,
                      }}
                      whileHover={{ scale: 1.03, y: -5 }}
                    >
                      <Card
                        className={`h-full border-2 shadow-lg transition-all duration-500 overflow-hidden relative ${
                          badge.unlocked
                            ? "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
                            : "bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 opacity-60"
                        }`}
                      >
                        {/* Gradient Background */}
                        <div
                          className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${
                            badge.gradient
                          } ${
                            badge.unlocked ? "opacity-20" : "opacity-10"
                          } rounded-full blur-3xl`}
                        ></div>

                        <CardHeader className="relative z-10">
                          <div className="flex items-start justify-between">
                            <div
                              className={`text-5xl bg-gradient-to-br ${badge.gradient} bg-clip-text text-transparent`}
                            >
                              {badge.icon}
                            </div>
                            {badge.unlocked && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                  type: "spring",
                                  stiffness: 200,
                                  delay: 0.3,
                                }}
                              >
                                <Badge className="bg-green-600 text-white px-3 py-1">
                                  <FaStar className="mr-1 inline" />
                                  Unlocked
                                </Badge>
                              </motion.div>
                            )}
                          </div>
                        </CardHeader>

                        <CardContent className="relative z-10 space-y-3">
                          <div>
                            <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 mb-1">
                              {badge.name}
                            </h3>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                              {badge.description}
                            </p>
                          </div>

                          {!badge.unlocked && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-zinc-600 dark:text-zinc-400">
                                  Progress
                                </span>
                                <span className="font-semibold text-zinc-800 dark:text-zinc-100">
                                  {Math.min(Math.round(badge.progress), 100)}%
                                </span>
                              </div>
                              <Progress
                                value={Math.min(badge.progress, 100)}
                                className="h-2"
                              />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
              </div>
            </div>
          ))}

          {/* Motivational Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <Card className="bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
              <CardContent className="p-8 text-center">
                {unlockedCount === badges.length ? (
                  <>
                    <FaCrown className="text-6xl text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-2">
                      Congratulations, Champion!
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400 text-lg">
                      You've unlocked all badges! Keep up the amazing work and
                      continue your journey to excellence.
                    </p>
                  </>
                ) : (
                  <>
                    <FaRocket className="text-6xl text-zinc-600 dark:text-zinc-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-2">
                      Keep Going!
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400 text-lg">
                      You're {badges.length - unlockedCount} badge
                      {badges.length - unlockedCount !== 1 ? "s" : ""} away from
                      completing your collection. Stay consistent!
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </Protected>
  );
}
