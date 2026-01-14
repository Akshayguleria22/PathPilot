"use client";

import { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { getRecentHabits, getStreak } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  FaCalendar,
  FaFire,
  FaBed,
  FaBrain,
  FaDumbbell,
  FaSmile,
} from "react-icons/fa";
import { Badge } from "@/components/ui/badge";

type Log = {
  date: string;
  sleep: number;
  study: number;
  exercise: number;
  mood: number;
};

export default function CalendarPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const [data, streakData] = await Promise.all([
          getRecentHabits(),
          getStreak(),
        ]);
        setLogs(Array.isArray(data) ? data : []);
        setStreak(streakData.streak || 0);
      } catch (error) {
        console.error("Error fetching logs:", error);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const loggedDates = logs.map((l) => l.date);

  const totalDays = logs.length;

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
              <FaCalendar className="text-zinc-600 dark:text-zinc-400" />
              Activity Calendar
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-2 text-lg">
              Track your consistency and view daily progress
            </p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="bg-gradient-to-br from-orange-500 to-red-500 border-none shadow-lg">
                <CardContent className="p-6 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <FaFire className="text-4xl" />
                    <div>
                      <p className="text-sm opacity-90">Current Streak</p>
                      <p className="text-4xl font-bold">{streak}</p>
                      <p className="text-sm opacity-90">days</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 border-none shadow-lg">
                <CardContent className="p-6 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <FaCalendar className="text-4xl" />
                    <div>
                      <p className="text-sm opacity-90">Total Days</p>
                      <p className="text-4xl font-bold">{totalDays}</p>
                      <p className="text-sm opacity-90">logged</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-purple-500 to-pink-500 border-none shadow-lg">
                <CardContent className="p-6 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <FaSmile className="text-4xl" />
                    <div>
                      <p className="text-sm opacity-90">Consistency</p>
                      <p className="text-4xl font-bold">
                        {totalDays > 0
                          ? Math.round((streak / totalDays) * 100)
                          : 0}
                        %
                      </p>
                      <p className="text-sm opacity-90">streak rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="lg:col-span-2"
            >
              <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl text-zinc-800 dark:text-zinc-100">
                    Your Activity Heatmap
                  </CardTitle>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Click on a date to view details
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="calendar-container">
                    <Calendar
                      locale="en-US"
                      tileContent={({ date }) => {
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(
                          2,
                          "0"
                        );
                        const day = String(date.getDate()).padStart(2, "0");
                        const dateStr = `${year}-${month}-${day}`;
                        const hasLog = loggedDates.includes(dateStr);
                        return hasLog ? (
                          <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mt-1" />
                        ) : null;
                      }}
                      tileClassName={({ date }) => {
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(
                          2,
                          "0"
                        );
                        const day = String(date.getDate()).padStart(2, "0");
                        const dateStr = `${year}-${month}-${day}`;
                        const hasLog = loggedDates.includes(dateStr);
                        return hasLog
                          ? "has-activity bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30"
                          : "hover:bg-zinc-100 dark:hover:bg-zinc-800";
                      }}
                      onClickDay={(date) => {
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(
                          2,
                          "0"
                        );
                        const day = String(date.getDate()).padStart(2, "0");
                        const dateStr = `${year}-${month}-${day}`;
                        const log = logs.find((l) => l.date === dateStr);
                        setSelectedLog(log || null);
                      }}
                      className="w-full border-none"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Selected Day Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-lg sticky top-6">
                <CardHeader>
                  <CardTitle className="text-xl text-zinc-800 dark:text-zinc-100">
                    {selectedLog ? "Daily Details" : "Select a Date"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedLog ? (
                    <div className="space-y-4">
                      <div className="text-center pb-4 border-b border-zinc-200 dark:border-zinc-700">
                        <Badge className="bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 text-base">
                          {new Date(selectedLog.date).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <MetricDisplay
                          icon={<FaBed className="text-blue-500" />}
                          label="Sleep"
                          value={`${selectedLog.sleep}h`}
                        />
                        <MetricDisplay
                          icon={<FaBrain className="text-purple-500" />}
                          label="Study"
                          value={`${selectedLog.study}h`}
                        />
                        <MetricDisplay
                          icon={<FaDumbbell className="text-orange-500" />}
                          label="Exercise"
                          value={`${selectedLog.exercise}h`}
                        />
                        <MetricDisplay
                          icon={<FaSmile className="text-pink-500" />}
                          label="Mood"
                          value={`${selectedLog.mood}/10`}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FaCalendar className="text-6xl text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
                      <p className="text-zinc-600 dark:text-zinc-400">
                        Click on a highlighted date to view your activity for
                        that day
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .calendar-container .react-calendar {
          width: 100%;
          border: none;
          font-family: inherit;
          background: transparent;
        }
        .calendar-container .react-calendar__tile {
          padding: 1.2em 0.5em;
          position: relative;
        }
        .calendar-container .react-calendar__tile--active {
          background: rgb(39 39 42 / 0.1);
          color: inherit;
        }
        .calendar-container .react-calendar__tile--now {
          background: rgb(34 197 94 / 0.1);
        }
        .calendar-container .react-calendar__month-view__days__day--weekend {
          color: #ef4444;
        }
        .dark .calendar-container .react-calendar {
          color: #fafafa;
        }
        .dark .calendar-container .react-calendar__month-view__weekdays {
          color: #a1a1aa;
        }
        .dark .calendar-container .react-calendar__navigation button {
          color: #fafafa;
        }
        .calendar-container .react-calendar__navigation button:hover {
          background: rgb(39 39 42 / 0.1);
        }
      `}</style>
    </Protected>
  );
}

function MetricDisplay({ icon, label, value }: any) {
  return (
    <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3">
      <div className="flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          {label}
        </span>
      </div>
      <span className="text-lg font-bold text-zinc-800 dark:text-zinc-100">
        {value}
      </span>
    </div>
  );
}
