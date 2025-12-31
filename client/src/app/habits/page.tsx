"use client";
import Protected from "@/components/Protected";
import { logHabit, getRecentHabits } from "@/lib/api";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { FaBed, FaBrain, FaGamepad, FaDumbbell, FaUtensils, FaSmile, FaFire, FaSave, FaCalendarAlt } from "react-icons/fa";
import { MdMood } from "react-icons/md";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const defaultForm = {
  sleep: "",
  study: "",
  entertainment: "",
  exercise: "",
  foodQuality: 3,
  mood: 5,
  stress: 5,
};

const habitFields = [
  { key: "sleep", label: "Sleep (hours)", icon: <FaBed />, color: "from-blue-500 to-cyan-500", placeholder: "8" },
  { key: "study", label: "Study (hours)", icon: <FaBrain />, color: "from-purple-500 to-pink-500", placeholder: "6" },
  { key: "entertainment", label: "Entertainment (hours)", icon: <FaGamepad />, color: "from-green-500 to-teal-500", placeholder: "2" },
  { key: "exercise", label: "Exercise (hours)", icon: <FaDumbbell />, color: "from-orange-500 to-red-500", placeholder: "1" },
  { key: "foodQuality", label: "Food Quality (1-10)", icon: <FaUtensils />, color: "from-yellow-500 to-amber-500", placeholder: "7", max: 10, min: 1 },
  { key: "mood", label: "Mood (1-10)", icon: <FaSmile />, color: "from-pink-500 to-rose-500", placeholder: "8", max: 10, min: 1 },
  { key: "stress", label: "Stress Level (1-10)", icon: <FaFire />, color: "from-red-500 to-rose-500", placeholder: "5", max: 10, min: 1 },
];

export default function Habits() {
  const [form, setForm] = useState(defaultForm);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    const res = await logHabit(form);
    alert(res.message);
    setForm(defaultForm);
    loadHistory();
    setLoading(false);
  };

  const loadHistory = async () => {
    const data = await getRecentHabits();
    setHistory(data);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <Protected>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-10 transition-colors duration-300">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-3">
              <FaCalendarAlt className="text-zinc-600 dark:text-zinc-400" />
              Daily Habit Tracker
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-2 text-lg">Build better habits, one day at a time</p>
          </motion.div>

          <Tabs defaultValue="log" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2 h-12">
              <TabsTrigger value="log" className="text-lg">📝 Log Today</TabsTrigger>
              <TabsTrigger value="history" className="text-lg">📊 History</TabsTrigger>
            </TabsList>
            <TabsContent value="log" className="space-y-6">
              {/* Benefits Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                <Card className="bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 mb-3 flex items-center gap-2">
                      ✨ Why Track Daily Habits?
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-start gap-2">
                        <span>📈</span>
                        <p className="text-zinc-600 dark:text-zinc-400">Identify patterns that affect your academic performance</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span>🧠</span>
                        <p className="text-zinc-600 dark:text-zinc-400">Understand how sleep and mood impact your productivity</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span>🎯</span>
                        <p className="text-zinc-600 dark:text-zinc-400">Make data-driven decisions to improve your lifestyle</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                    <MdMood className="text-3xl text-zinc-600 dark:text-zinc-400" />
                    How was your day?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {habitFields.map((field, index) => (
                      <motion.div
                        key={field.key}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.6 }}
                        className="space-y-2"
                      >
                        <Label className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-semibold text-lg">
                          <div className="p-2 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                            {field.icon}
                          </div>
                          {field.label}
                        </Label>
                        <Input
                          type="number"
                          placeholder={field.placeholder}
                          value={form[field.key as keyof typeof form]}
                          onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                          className="h-12 text-lg"
                          min={field.min || 0}
                          max={field.max || 24}
                        />
                      </motion.div>
                    ))}
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Button
                      onClick={submit}
                      disabled={loading}
                      className="w-full h-14 text-lg bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 shadow-lg transition-all duration-300"
                    >
                      {loading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                        />
                      ) : (
                        <>
                          <FaSave className="mr-2" />
                          Save Today's Entry
                        </>
                      )}
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">Recent Logs</h2>
                  <Badge className="bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 text-lg">
                    {history.length} entries
                  </Badge>
                </div>

                {history.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.7 }}
                    className="text-center py-20"
                  >
                    <FaCalendarAlt className="text-zinc-300 dark:text-zinc-700 text-8xl mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-zinc-400 dark:text-zinc-600 mb-2">No entries yet</h3>
                    <p className="text-zinc-500">Start logging your daily habits!</p>
                  </motion.div>
                ) : (
                  <div className="grid gap-4">
                    {history.map((h: any, index: number) => (
                      <motion.div
                        key={h._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.6 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition-all duration-500">
                          <CardContent className="p-6">
                            <div className="flex flex-wrap items-center justify-between mb-4">
                              <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
                                {new Date(h.date).toLocaleDateString("en-US", {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </h3>
                              <div className="flex gap-2">
                                <Badge className="bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100">
                                  😴 {h.sleep}h
                                </Badge>
                                <Badge className="bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100">
                                  📚 {h.study}h
                                </Badge>
                                <Badge className="bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100">
                                  😊 {h.mood}/10
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                              <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-2">
                                <FaGamepad className="text-zinc-600 dark:text-zinc-400" />
                                <span>Entertainment: <b>{h.entertainment}h</b></span>
                              </div>
                              <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-2">
                                <FaDumbbell className="text-zinc-600 dark:text-zinc-400" />
                                <span className="text-zinc-700 dark:text-zinc-300">Exercise: <b>{h.exercise}h</b></span>
                              </div>
                              <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-2">
                                <FaUtensils className="text-zinc-600 dark:text-zinc-400" />
                                <span className="text-zinc-700 dark:text-zinc-300">Food: <b>{h.foodQuality}/10</b></span>
                              </div>
                              <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-2">
                                <FaFire className="text-zinc-600 dark:text-zinc-400" />
                                <span>Stress: <b>{h.stress}/10</b></span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Protected>
  );
}
