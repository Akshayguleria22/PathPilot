"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
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
} from "react-icons/fa";

export default function LandingPage() {
  const router = useRouter();

  const features = [
    {
      icon: <FaBrain className="text-5xl" />,
      title: "Smart Habit Tracking",
      description:
        "Monitor your sleep, study time, mood, and wellness metrics daily to build better habits.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: <FaChartLine className="text-5xl" />,
      title: "Advanced Analytics",
      description:
        "Get detailed insights with beautiful charts and AI-powered recommendations for improvement.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: <FaRocket className="text-5xl" />,
      title: "Course Management",
      description:
        "Organize your learning paths, track progress, and generate AI-powered roadmaps.",
      gradient: "from-green-500 to-teal-500",
    },
    {
      icon: <FaTrophy className="text-5xl" />,
      title: "Achievements & Badges",
      description:
        "Earn rewards for consistency, celebrate milestones, and stay motivated on your journey.",
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: <FaCalendarAlt className="text-5xl" />,
      title: "Activity Calendar",
      description:
        "Visualize your progress over time with an interactive calendar and streak tracking.",
      gradient: "from-yellow-500 to-amber-500",
    },
    {
      icon: <FaLightbulb className="text-5xl" />,
      title: "AI-Powered Insights",
      description:
        "Receive personalized recommendations based on your patterns to optimize performance.",
      gradient: "from-pink-500 to-rose-500",
    },
  ];

  const benefits = [
    "Track daily habits and activities effortlessly",
    "Visualize progress with interactive charts",
    "Get AI-powered insights and recommendations",
    "Manage courses and generate learning roadmaps",
    "Earn achievements and maintain streaks",
    "Monitor wellness metrics for better health",
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-50 via-zinc-100 to-zinc-200 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-800 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400 dark:bg-blue-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-purple-400 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-400 dark:bg-pink-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-32">
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
              <FaGraduationCap className="text-8xl text-zinc-700 dark:text-zinc-300 mb-6" />
            </motion.div>

            <h1 className="text-6xl md:text-7xl font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
              Your Path to
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Academic Excellence
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-zinc-600 dark:text-zinc-300 max-w-3xl mx-auto">
              PathPilot helps students track habits, manage courses, and achieve
              their goals with AI-powered insights and beautiful analytics.
            </p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
            >
              <Link href="/register">
                <Button
                  size="lg"
                  className="h-14 px-8 text-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  Get Started Free
                  <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-lg border-2 border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-900 hover:text-white dark:hover:bg-zinc-100 dark:hover:text-zinc-900 transition-all duration-300"
                >
                  Sign In
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-zinc-900 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto">
              Powerful features designed specifically for ambitious students
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <Card className="h-full bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
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

      {/* Benefits Section */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-50">
                Why Choose PathPilot?
              </h2>
              <p className="text-lg text-zinc-600 dark:text-zinc-300">
                Join thousands of students who are transforming their academic
                journey with data-driven insights and smart habit tracking.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-3"
                  >
                    <FaCheck className="text-green-500 text-xl mt-1 flex-shrink-0" />
                    <span className="text-lg text-zinc-700 dark:text-zinc-200">
                      {benefit}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 shadow-2xl">
                <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <FaRocket className="text-white text-xl" />
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                        Start Your Journey
                      </p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-300">
                        Free forever, no credit card required
                      </p>
                    </div>
                  </div>
                  <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                      initial={{ width: 0 }}
                      whileInView={{ width: "75%" }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                      viewport={{ once: true }}
                    />
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    75% of users report improved productivity within 2 weeks
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative max-w-4xl mx-auto text-center px-6"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Academic Life?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join PathPilot today and start building habits that lead to success
          </p>
          <Link href="/register">
            <Button
              size="lg"
              className="h-14 px-10 text-lg bg-white text-purple-600 hover:bg-zinc-100 shadow-xl hover:shadow-2xl transition-all duration-300 group"
            >
              Get Started Now
              <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-zinc-900 dark:bg-zinc-950 text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FaGraduationCap className="text-3xl" />
            <span className="text-2xl font-bold">PathPilot</span>
          </div>
          <p className="text-zinc-400 mb-4">
            Your personal academic companion for excellence
          </p>
          <p className="text-sm text-zinc-500">
            © {new Date().getFullYear()} PathPilot. All rights reserved.
          </p>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </main>
  );
}
