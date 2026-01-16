"use client";

import { useState } from "react";
import { loginUser } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import {
  FaGraduationCap,
  FaEnvelope,
  FaLock,
  FaArrowRight,
} from "react-icons/fa";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    const res = await loginUser(form);
    if (res.token) {
      localStorage.setItem("token", res.token);
      router.push("/");
    } else {
      alert(res.message);
    }
    setLoading(false);
  };

  return (
    <main className="flex justify-center items-center min-h-screen bg-zinc-100 dark:bg-zinc-900 p-4 sm:p-5 transition-colors duration-300">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-60 h-60 sm:w-80 sm:h-80 bg-zinc-200 dark:bg-zinc-800 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-40 -left-40 w-60 h-60 sm:w-80 sm:h-80 bg-zinc-200 dark:bg-zinc-800 rounded-full blur-3xl opacity-50"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-6 sm:mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, duration: 0.8 }}
            className="inline-block"
          >
            <FaGraduationCap className="text-zinc-800 dark:text-zinc-100 text-6xl sm:text-7xl mb-3 sm:mb-4" />
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-bold text-zinc-800 dark:text-zinc-100 mb-2">
            Welcome Back!
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg">
            Continue your learning journey
          </p>
        </div>

        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-lg">
          <CardHeader className="space-y-1 pb-4 sm:pb-6">
            <CardTitle className="text-2xl sm:text-3xl text-center text-zinc-800 dark:text-zinc-100">
              Sign In
            </CardTitle>
            <p className="text-center text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
              Enter your credentials to access your account
            </p>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-zinc-700 dark:text-zinc-300 font-semibold flex items-center gap-2"
              >
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
              <Label
                htmlFor="password"
                className="text-zinc-700 dark:text-zinc-300 font-semibold flex items-center gap-2"
              >
                <FaLock className="text-zinc-600 dark:text-zinc-400" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="h-12 transition-all"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onKeyPress={(e) => e.key === "Enter" && submit()}
              />
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
              <Button
                className="w-full h-12 sm:h-12 text-base sm:text-lg bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 shadow-md transition-all duration-300"
                onClick={submit}
                disabled={loading}
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    Sign In
                    <FaArrowRight className="ml-2" />
                  </>
                )}
              </Button>
            </motion.div>

            <div className="text-center pt-3 sm:pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="text-zinc-800 dark:text-zinc-100 font-semibold hover:underline"
                >
                  Create one now
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
