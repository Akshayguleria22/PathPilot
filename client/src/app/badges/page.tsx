"use client";

import { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import { getRecentHabits } from "@/lib/api";
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
} from "react-icons/fa";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function BadgesPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getRecentHabits();
        setLogs(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching logs:", error);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalDays = logs.length;
  const totalStudy = logs.reduce((a, d) => a + (d.study || 0), 0);
  const avgStudy = totalDays ? totalStudy / totalDays : 0;
  const avgSleep = totalDays > 0 ? logs.reduce((a, d) => a + (d.sleep || 0), 0) / totalDays : 0;
  const avgMood = totalDays > 0 ? logs.reduce((a, d) => a + (d.mood || 0), 0) / totalDays : 0;

  const baseBadges = [
    {
      name: "3-Day Streak",
      description: "Log habits for 3 consecutive days",
      icon: <FaFire />,
      unlocked: totalDays >= 3,
      progress: (totalDays / 3) * 100,
      gradient: "from-orange-500 to-red-500",
      category: "Consistency",
    },
    {
      name: "Week Warrior",
      description: "Complete 7 consecutive days",
      icon: <FaTrophy />,
      unlocked: totalDays >= 7,
      progress: (totalDays / 7) * 100,
      gradient: "from-yellow-500 to-amber-500",
      category: "Consistency",
    },
    {
      name: "Dedicated Learner",
      description: "Log 14 days of activities",
      icon: <FaCrown />,
      unlocked: totalDays >= 14,
      progress: (totalDays / 14) * 100,
      gradient: "from-purple-500 to-pink-500",
      category: "Consistency",
    },
    {
      name: "Study Master",
      description: "Maintain 3+ hours average study",
      icon: <FaBrain />,
      unlocked: avgStudy >= 3,
      progress: (avgStudy / 3) * 100,
      gradient: "from-blue-500 to-cyan-500",
      category: "Performance",
    },
    {
      name: "Sleep Champion",
      description: "Maintain 7+ hours average sleep",
      icon: <FaBed />,
      unlocked: avgSleep >= 7,
      progress: (avgSleep / 7) * 100,
      gradient: "from-indigo-500 to-blue-500",
      category: "Wellness",
    },
    {
      name: "Positive Vibes",
      description: "Maintain 7+ average mood rating",
      icon: <FaHeart />,
      unlocked: avgMood >= 7,
      progress: (avgMood / 7) * 100,
      gradient: "from-pink-500 to-rose-500",
      category: "Wellness",
    },
    {
      name: "Consistency King",
      description: "Log habits for 30 days",
      icon: <FaGem />,
      unlocked: totalDays >= 30,
      progress: (totalDays / 30) * 100,
      gradient: "from-cyan-500 to-teal-500",
      category: "Milestone",
    },
    {
      name: "High Achiever",
      description: "Study 5+ hours daily average",
      icon: <FaStar />,
      unlocked: avgStudy >= 5,
      progress: (avgStudy / 5) * 100,
      gradient: "from-green-500 to-emerald-500",
      category: "Performance",
    },
  ];

  const baseUnlockedCount = baseBadges.filter((b) => b.unlocked).length;

  const badges = [
    ...baseBadges,
    {
      name: "Rockstar",
      description: "Unlock all other badges",
      icon: <FaRocket />,
      unlocked: baseUnlockedCount === 8,
      progress: (baseUnlockedCount / 8) * 100,
      gradient: "from-violet-500 to-purple-500",
      category: "Milestone",
    },
  ];

  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const categories = ["Consistency", "Performance", "Wellness", "Milestone"];

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
                      {Math.round((unlockedCount / badges.length) * 100)}% Complete
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
                          className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${badge.gradient} ${
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
