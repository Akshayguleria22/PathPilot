"use client";

import Protected from "@/components/Protected";
import { motion } from "framer-motion";
import { FaRocket, FaBook, FaChartLine, FaCalendarCheck } from "react-icons/fa";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function Dashboard() {
  const features = [
    {
      icon: <FaBook className="text-5xl" />,
      title: "Courses",
      description: "Track and manage all your learning paths",
      color: "from-blue-500 to-cyan-500",
      link: "/courses"
    },
    {
      icon: <FaCalendarCheck className="text-5xl" />,
      title: "Daily Habits",
      description: "Log your daily activities and build consistency",
      color: "from-purple-500 to-pink-500",
      link: "/habits"
    },
    {
      icon: <FaChartLine className="text-5xl" />,
      title: "Analytics",
      description: "Get AI-powered insights on your progress",
      color: "from-green-500 to-teal-500",
      link: "/analytics"
    },
  ];

  return (
    <Protected>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-10 transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="text-center mb-12"
          >
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
              className="inline-block"
            >
              <FaRocket className="text-8xl text-zinc-600 dark:text-zinc-400 mb-6" />
            </motion.div>
            <h1 className="text-6xl font-bold text-zinc-800 dark:text-zinc-100 mb-4">
              Welcome to PathPilot
            </h1>
            <p className="text-2xl text-zinc-600 dark:text-zinc-400">Your Journey to Excellence Starts Here</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.25, duration: 0.7 }}
                whileHover={{ scale: 1.03, y: -10 }}
              >
                <Link href={feature.link}>
                  <Card className="h-full bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 shadow-lg cursor-pointer overflow-hidden group hover:shadow-xl transition-all duration-500">
                    <CardContent className="p-8 relative">
                      <div className="absolute top-0 right-0 opacity-5 group-hover:opacity-10 transition-opacity text-zinc-600 dark:text-zinc-400">
                        <div className="text-9xl">{feature.icon}</div>
                      </div>
                      <div className="relative z-10">
                        <div className="mb-4 text-zinc-700 dark:text-zinc-300">{feature.icon}</div>
                        <h2 className="text-3xl font-bold mb-3 text-zinc-800 dark:text-zinc-100">{feature.title}</h2>
                        <p className="text-zinc-600 dark:text-zinc-400 text-lg">{feature.description}</p>
                        <motion.div
                          className="mt-6 text-lg font-semibold text-zinc-800 dark:text-zinc-100"
                          whileHover={{ x: 10 }}
                          transition={{ duration: 0.3 }}
                        >
                          Get Started →
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* About Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.8 }}
          >
            <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-6 text-center">
                  🚀 Your Academic Success Platform
                </h2>
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div className="p-4">
                    <div className="text-4xl mb-3">🎯</div>
                    <h3 className="font-bold text-zinc-800 dark:text-zinc-100 mb-2">Goal-Oriented</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Set clear objectives for each course and track your progress systematically</p>
                  </div>
                  <div className="p-4">
                    <div className="text-4xl mb-3">📈</div>
                    <h3 className="font-bold text-zinc-800 dark:text-zinc-100 mb-2">Data-Driven</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Make informed decisions based on your habit patterns and analytics</p>
                  </div>
                  <div className="p-4">
                    <div className="text-4xl mb-3">🤖</div>
                    <h3 className="font-bold text-zinc-800 dark:text-zinc-100 mb-2">AI-Powered</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Get personalized insights and recommendations tailored to your journey</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="text-center mt-12"
          >
            <p className="text-zinc-500 dark:text-zinc-400 text-lg italic">
              "Success is the sum of small efforts repeated day in and day out."
            </p>
          </motion.div>
        </div>
      </div>
    </Protected>
  );
}
