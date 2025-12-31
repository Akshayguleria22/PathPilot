"use client";

import { useState } from "react";
import { registerUser } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { FaGraduationCap, FaUser, FaEnvelope, FaLock, FaRocket } from "react-icons/fa";
import Link from "next/link";

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const res = await registerUser(form);
    
    if (res.token) {
      localStorage.setItem("token", res.token);
      router.push("/");
    } else {
      alert(res.message);
    }
    setLoading(false);
  };

  return (
    <main className="flex justify-center items-center min-h-screen bg-zinc-100 dark:bg-zinc-900 p-5 transition-colors duration-300">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-zinc-200 dark:bg-zinc-800 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-zinc-200 dark:bg-zinc-800 rounded-full blur-3xl opacity-40"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, duration: 0.8 }}
          >
            <FaGraduationCap className="text-zinc-800 dark:text-zinc-100 text-7xl mx-auto mb-4" />
          </motion.div>
          <h1 className="text-4xl font-bold text-zinc-800 dark:text-zinc-100 mb-2">Join PathPilot</h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg">Start your journey to success today!</p>
        </div>

        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-lg">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-3xl text-center text-zinc-800 dark:text-zinc-100">
              Create Account
            </CardTitle>
            <p className="text-center text-zinc-600 dark:text-zinc-400">Join thousands of successful students</p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-zinc-700 dark:text-zinc-300 font-semibold flex items-center gap-2">
                <FaUser className="text-zinc-600 dark:text-zinc-400" />
                Full Name
              </Label>
              <Input
                id="name"
                placeholder="John Doe"
                className="h-12 transition-all"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-700 dark:text-zinc-300 font-semibold flex items-center gap-2">
                <FaEnvelope className="text-zinc-600 dark:text-zinc-400" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="student@university.edu"
                className="h-12 transition-all"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-700 dark:text-zinc-300 font-semibold flex items-center gap-2">
                <FaLock className="text-zinc-600 dark:text-zinc-400" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                className="h-12 transition-all"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.3 }}>
              <Button
                className="w-full h-12 text-lg bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 shadow-md transition-all duration-300"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <FaRocket className="mr-2" />
                    Get Started
                  </>
                )}
              </Button>
            </motion.div>

            <div className="text-center pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <p className="text-zinc-600 dark:text-zinc-400">
                Already have an account?{" "}
                <Link href="/login" className="text-zinc-800 dark:text-zinc-100 font-semibold hover:underline">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 grid grid-cols-3 gap-4 text-center"
        >
          <div className="bg-zinc-200 dark:bg-zinc-800 rounded-lg p-3">
            <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">1000+</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Students</p>
          </div>
          <div className="bg-zinc-200 dark:bg-zinc-800 rounded-lg p-3">
            <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">50+</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Courses</p>
          </div>
          <div className="bg-zinc-200 dark:bg-zinc-800 rounded-lg p-3">
            <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">95%</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Success</p>
          </div>
        </motion.div>
        {/* Why PathPilot */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <Card className="bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 mt-6">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 mb-4 text-center">
                🌟 Why Students Choose PathPilot
              </h3>
              <div className="grid md:grid-cols-2 gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                <div className="flex items-start gap-2">
                  <span>✔️</span>
                  <p>Track all your courses in one place</p>
                </div>
                <div className="flex items-start gap-2">
                  <span>✔️</span>
                  <p>Build consistent study habits</p>
                </div>
                <div className="flex items-start gap-2">
                  <span>✔️</span>
                  <p>Get AI-powered recommendations</p>
                </div>
                <div className="flex items-start gap-2">
                  <span>✔️</span>
                  <p>Visualize your academic progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>      </motion.div>
    </main>
  );
}
