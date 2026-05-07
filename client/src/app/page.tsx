"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FaGraduationCap,
  FaChartLine,
  FaBrain,
  FaRocket,
  FaCalendarAlt,
  FaLightbulb,
  FaTrophy,
  FaArrowRight,
  FaCheck,
  FaCog,
  FaExclamationTriangle,
  FaAdjust,
  FaBookOpen,
  FaStar,
  FaFire,
  FaRobot,
  FaEye,
  FaUserShield,
} from "react-icons/fa";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const howItWorksSteps = [
    {
      icon: <FaBookOpen className="text-4xl" />,
      title: "Log Habits & Learning Activity",
      description:
        "Track your study hours, sleep, mood, and course progress daily with our intuitive interface.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: <FaBrain className="text-4xl" />,
      title: "AI Analyzes Behavior & Progress",
      description:
        "Our AI engine processes your patterns, identifies trends, and detects burnout risks in real-time.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: <FaAdjust className="text-4xl" />,
      title: "Goals & Roadmaps Adapt Automatically",
      description:
        "Study targets adjust based on your capacity. Learning paths optimize for your performance.",
      gradient: "from-orange-500 to-red-500",
    },
  ];

  const smartFeatures = [
    {
      icon: <FaRocket className="text-5xl" />,
      title: "AI Goal Optimization",
      description:
        "Study targets that adjust based on your sleep, stress, and performance—never overwhelming, always challenging.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: <FaExclamationTriangle className="text-5xl" />,
      title: "Burnout Detection",
      description:
        "Real-time analysis of your habits alerts you before burnout happens, with actionable recovery suggestions.",
      gradient: "from-red-500 to-orange-500",
    },
    {
      icon: <FaChartLine className="text-5xl" />,
      title: "Dynamic Roadmaps",
      description:
        "AI-generated learning paths that evolve with your progress, connecting concepts intelligently.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: <FaStar className="text-5xl" />,
      title: "Intelligent Resource Ranking",
      description:
        "Machine learning ranks articles, videos, and docs by relevance and your learning style preferences.",
      gradient: "from-green-500 to-teal-500",
    },
    {
      icon: <FaFire className="text-5xl" />,
      title: "Streaks & Achievements",
      description:
        "Gamified progress tracking with smart badges that celebrate consistency and meaningful milestones.",
      gradient: "from-yellow-500 to-amber-500",
    },
    {
      icon: <FaTrophy className="text-5xl" />,
      title: "Behavioral Insights",
      description:
        "Weekly AI reports on your learning velocity, focus patterns, and personalized optimization tips.",
      gradient: "from-pink-500 to-rose-500",
    },
  ];

  const liveInsights = [
    {
      title: "Burnout Warning",
      subtitle: "High Risk Detected",
      content: "Sleep below 6h for 3 days, stress levels elevated",
      suggestion: "Recommendation: Reduce study goal from 6h to 4h this week",
      color: "border-red-500",
      icon: <FaExclamationTriangle className="text-red-500 text-2xl" />,
    },
    {
      title: "Goal Adjustment",
      subtitle: "AI Recommendation",
      content: "Current: 6h/week study target",
      suggestion: "Suggested: 8h/week (based on improved sleep & low stress)",
      color: "border-blue-500",
      icon: <FaAdjust className="text-blue-500 text-2xl" />,
    },
    {
      title: "Ranked Resources",
      subtitle: "ML-Powered Search",
      content: "Top Results for 'React Hooks'",
      suggestion:
        "1. Official Docs (98%) • 2. Video Tutorial (94%) • 3. Blog Post (87%)",
      color: "border-green-500",
      icon: <FaStar className="text-green-500 text-2xl" />,
    },
  ];

  const whyPathPilot = [
    {
      icon: <FaRobot className="text-5xl" />,
      title: "Real AI, Not Rule-Based",
      description:
        "We use actual machine learning models (Groq LLM, ML rankers) that learn from your data—not hardcoded if-else logic.",
      gradient: "from-blue-500 to-purple-500",
    },
    {
      icon: <FaEye className="text-5xl" />,
      title: "Explainable AI",
      description:
        "Every AI recommendation comes with clear reasoning: why the goal changed, what pattern triggered the alert.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: <FaUserShield className="text-5xl" />,
      title: "You Stay in Control",
      description:
        "AI proposes, you approve. No automatic changes to your goals—you always have the final say.",
      gradient: "from-green-500 to-teal-500",
    },
  ];

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-zinc-50 via-zinc-100 to-zinc-200 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-800">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400 dark:bg-blue-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-purple-400 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-400 dark:bg-pink-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-32 md:py-40">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="inline-block"
            >
              <FaBrain className="text-7xl md:text-8xl text-zinc-700 dark:text-zinc-300 mb-6" />
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-zinc-900 dark:text-zinc-50 leading-tight px-4">
              AI that adapts your learning,
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                not the other way around
              </span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-zinc-600 dark:text-zinc-300 max-w-4xl mx-auto px-4">
              PathPilot uses real AI to adjust your study goals based on sleep,
              stress, and performance. Detects burnout before it happens. Generates
              intelligent roadmaps that evolve with you.
            </p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 px-4"
            >
              {!mounted ? (
                <div className="h-14 w-full sm:w-64" />
              ) : (
                <>
                  <Link href="/dashboard" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto h-14 px-8 text-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-lg hover:shadow-xl transition-all duration-300 group"
                    >
                      Go to Dashboard
                      <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/dashboard" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto h-14 px-8 text-lg border-2 border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-900 hover:text-white dark:hover:bg-zinc-100 dark:hover:text-zinc-900 transition-all duration-300"
                    >
                      Explore Dashboard
                    </Button>
                  </Link>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-zinc-600 dark:text-zinc-300 max-w-3xl mx-auto">
              Three simple steps to adaptive, intelligent learning
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorksSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <Card className="h-full bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 shadow-lg hover:shadow-2xl transition-all duration-500">
                  <CardContent className="p-8 text-center">
                    <motion.div
                      className={`mb-6 mx-auto w-20 h-20 rounded-full bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {step.icon}
                    </motion.div>
                    <div className="mb-4 text-6xl font-bold text-zinc-300 dark:text-zinc-700">
                      {index + 1}
                    </div>
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Smart Features Section */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
              Smart Features
            </h2>
            <p className="text-xl text-zinc-600 dark:text-zinc-300 max-w-3xl mx-auto">
              AI-powered tools that work together to optimize your learning
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {smartFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <Card className="h-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
                  <CardContent className="p-8 relative">
                    <div
                      className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`}
                    ></div>
                    <div className="relative z-10">
                      <div
                        className={`mb-4 bg-gradient-to-br ${feature.gradient} bg-clip-text text-transparent inline-block`}
                      >
                        {feature.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Insight Preview Section */}
      <section className="py-20 bg-white dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
              Live Insight Preview
            </h2>
            <p className="text-xl text-zinc-600 dark:text-zinc-300 max-w-3xl mx-auto">
              See how PathPilot's AI provides actionable, real-time guidance
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {liveInsights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <Card
                  className={`h-full bg-zinc-50 dark:bg-zinc-800 border-2 ${insight.color} shadow-lg hover:shadow-xl transition-all duration-300`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      {insight.icon}
                      <div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                          {insight.title}
                        </h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          {insight.subtitle}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4 p-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700">
                      <p className="text-sm text-zinc-700 dark:text-zinc-300">
                        {insight.content}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                        {insight.suggestion}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why PathPilot Section */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
              Why PathPilot?
            </h2>
            <p className="text-xl text-zinc-600 dark:text-zinc-300 max-w-3xl mx-auto">
              Real AI with transparency and user control at its core
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {whyPathPilot.map((reason, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.03 }}
                className="group"
              >
                <Card className="h-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 shadow-lg hover:shadow-2xl transition-all duration-500">
                  <CardContent className="p-8 text-center">
                    <motion.div
                      className={`mb-6 mx-auto w-24 h-24 rounded-2xl bg-gradient-to-br ${reason.gradient} flex items-center justify-center text-white shadow-lg`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      {reason.icon}
                    </motion.div>
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                      {reason.title}
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      {reason.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-zinc-900 to-zinc-800 dark:from-zinc-950 dark:to-zinc-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative max-w-5xl mx-auto text-center px-4 sm:px-6"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            Ready to Learn Smarter?
          </h2>
          <p className="text-xl sm:text-2xl text-zinc-300 mb-8 max-w-3xl mx-auto">
            Join students who let AI handle the optimization while they focus on
            actual learning.
          </p>
          <Link href="/dashboard">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="h-16 px-12 text-xl bg-white text-zinc-900 hover:bg-zinc-100 shadow-2xl hover:shadow-3xl transition-all duration-300 group"
              >
                Go to Dashboard
                <FaArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </Link>
          <p className="mt-6 text-sm text-zinc-400">
            Don't think twice—your smarter learning journey starts now!
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-zinc-900 dark:bg-zinc-950 text-white border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FaBrain className="text-3xl" />
            <span className="text-2xl font-bold">PathPilot</span>
          </div>
          <p className="text-zinc-400 mb-4">
            AI-powered adaptive learning for the modern student
          </p>
          <p className="text-sm text-zinc-500">
            © {new Date().getFullYear()} PathPilot By Akshay Guleria. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
