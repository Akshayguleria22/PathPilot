"use client";

import { useState, useEffect } from "react";
import {
  addCourse,
  getCourses,
  generateRoadmap,
  logCourseActivity,
} from "@/lib/api";

interface Course {
  _id: string;
  name: string;
  category: string;
  progress: number;
  weeklyProgress: number;
  hoursThisWeek: number;
  weeklyTarget: number;
  targetHours: number;
  activityLog?: Activity[];
}

interface Activity {
  hoursSpent: number;
  tasksCompleted: number;
  note: string;
  timestamp: string;
  date: string;
}

interface AiInsights {
  message?: string;
  recommendations?: string[];
  focus_course?: string;
  learning_velocity?: string;
  burnout_risk?: string;
  insights?: string[];
}

interface CourseAdjustment {
  courseId: string;
  courseName: string;
  newTargetHours: number;
  oldTargetHours: number;
  adjustment: string;
  reason: string;
}

interface HabitAdjustments {
  sleepTarget?: number;
  studyTarget?: number;
  reason?: string;
}

interface GoalSuggestionResponse {
  overallAdvice?: string;
  courseAdjustments?: CourseAdjustment[];
  habitAdjustments?: HabitAdjustments;
}

interface GoalSuggestion {
  courseId: string;
  courseName: string;
  adjustment: string;
  reason: string;
  newTargetHours: number;
}
import Protected from "@/components/Protected";
import SearchPanel from "@/components/SearchPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBook,
  FaPlus,
  FaGraduationCap,
  FaTrophy,
  FaChartLine,
  FaTimes,
  FaBrain,
  FaRedo,
  FaLightbulb,
  FaRocket,
  FaTachometerAlt,
  FaExclamationTriangle,
  FaCheck,
  FaArrowRight,
  FaCalendarAlt,
  FaFire,
} from "react-icons/fa";
import { MdCategory, MdTimer } from "react-icons/md";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SkeletonCard, SkeletonStat } from "@/components/SkeletonCard";
import Link from "next/link";
import toast from "react-hot-toast";

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [form, setForm] = useState({
    name: "",
    category: "Academic",
    targetHours: 5,
  });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [generatingRoadmap, setGeneratingRoadmap] = useState<string | null>(
    null
  );
  const [aiInsights, setAiInsights] = useState<AiInsights | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const [goalSuggestions, setGoalSuggestions] =
    useState<GoalSuggestionResponse | null>(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [activityForm, setActivityForm] = useState({
    hoursSpent: 0,
    tasksCompleted: 0,
    note: "",
  });
  const [loggingActivity, setLoggingActivity] = useState(false);

  // Load cached AI insights on mount
  useEffect(() => {
    const cachedInsights = localStorage.getItem("ai_insights");
    if (cachedInsights) {
      try {
        setAiInsights(JSON.parse(cachedInsights));
      } catch (error) {
        console.error("Failed to parse cached insights:", error);
        localStorage.removeItem("ai_insights");
      }
    }
  }, []);

  const fetchGoalAdjustments = async () => {
    const toastId = toast.loading("Analyzing your goals...");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ai/goals/goal-adjustments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await res.json();
      setGoalSuggestions(data);
      setShowGoalModal(true);
      toast.success("Goal recommendations ready!", { id: toastId });
    } catch (error) {
      console.error("Failed to fetch goal adjustments:", error);
      toast.error("Failed to generate recommendations", { id: toastId });
    }
  };

  const applyCourseGoal = async (adjustment: GoalSuggestion) => {
    const toastId = toast.loading("Applying goal adjustment...");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/habits/apply-goal`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            type: "course",
            payload: {
              courseId: adjustment.courseId,
              newTargetHours: adjustment.newTargetHours,
            },
          }),
        }
      );

      if (res.ok) {
        toast.success(
          `Updated ${adjustment.courseName} to ${adjustment.newTargetHours} hrs/week`,
          { id: toastId }
        );
        await loadCourses(); // Reload courses to show updated targets
        // Dispatch event to notify other pages
        window.dispatchEvent(new CustomEvent("targetUpdated"));
      } else {
        throw new Error("Failed to apply adjustment");
      }
    } catch {
      toast.error("Failed to apply adjustment", { id: toastId });
    }
  };

  const applyAllCourseGoals = async () => {
    const toastId = toast.loading("Applying all adjustments...");
    try {
      if (!goalSuggestions?.courseAdjustments) {
        toast.error("No adjustments available", { id: toastId });
        return;
      }
      for (const adjustment of goalSuggestions.courseAdjustments) {
        await applyCourseGoal(adjustment);
      }
      setShowGoalModal(false);
      toast.success("All goals updated successfully!", { id: toastId });
      // Dispatch event to notify other pages
      window.dispatchEvent(new CustomEvent("targetUpdated"));
    } catch {
      toast.error("Failed to apply some adjustments", { id: toastId });
    }
  };

  const loadAIInsights = async () => {
    setLoadingAI(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ai/course-insights`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            courses,
            habits: [],
            streak: 0,
          }),
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setAiInsights(data);

      localStorage.setItem("ai_insights", JSON.stringify(data));
    } catch (error) {
      console.error("AI Insights Error:", error);
      toast.error("Failed to load AI insights");
    } finally {
      setLoadingAI(false);
    }
  };
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const loadCourses = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const data = await getCourses();
    setCourses(data);
    setLoading(false);
  };

  const submit = async () => {
    if (!form.name.trim()) {
      toast.error("Please enter a course name");
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading("Adding course...");

    try {
      const res = await addCourse(form);
      toast.success(res.message || "Course added successfully!", {
        id: toastId,
      });
      setForm({ name: "", category: "Academic", targetHours: 5 });
      setShowForm(false);
      loadCourses();
    } catch {
      toast.error("Failed to add course", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateRoadmap = async (courseId: string) => {
    setGeneratingRoadmap(courseId);
    const toastId = toast.loading("Generating roadmap...");

    try {
      await generateRoadmap(courseId);
      toast.success("Roadmap generated successfully!", { id: toastId });
    } catch (error) {
      console.error("Error generating roadmap:", error);
      toast.error("Failed to generate roadmap", { id: toastId });
    } finally {
      setGeneratingRoadmap(null);
    }
  };

  const handleLogActivity = async () => {
    if (!selectedCourse) return;

    if (activityForm.hoursSpent <= 0 && activityForm.tasksCompleted <= 0) {
      toast.error("Please enter hours spent or tasks completed");
      return;
    }

    setLoggingActivity(true);
    const toastId = toast.loading("Logging activity...");

    try {
      const res = await logCourseActivity(selectedCourse._id, activityForm);
      toast.success("Activity logged successfully!", { id: toastId });

      // Update the selected course with new data
      setSelectedCourse(res.course);

      // Reset form
      setActivityForm({ hoursSpent: 0, tasksCompleted: 0, note: "" });

      // Reload courses to update the list
      await loadCourses();
    } catch (error) {
      console.error("Error logging activity:", error);
      toast.error("Failed to log activity", { id: toastId });
    } finally {
      setLoggingActivity(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Academic":
        return <FaGraduationCap />;
      case "Skill":
        return <FaTrophy />;
      case "Hobby":
        return <FaBook />;
      default:
        return <FaBook />;
    }
  };

  const InsightCard = ({
    title,
    value,
    description,
    icon: Icon,
  }: {
    title: string;
    value: string;
    description: string;
    icon: React.ElementType;
  }) => (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.3 }}
      className="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-5 shadow-md border border-zinc-200 dark:border-zinc-700"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-zinc-800 dark:bg-zinc-100 rounded-lg">
          <Icon className="text-xl text-white dark:text-zinc-900" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide font-medium">
            {title}
          </p>
          <p className="text-xl font-bold text-zinc-800 dark:text-zinc-100 mt-1">
            {value}
          </p>
        </div>
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
    </motion.div>
  );

  return (
    <Protected>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-6 md:p-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2 sm:gap-3">
                <FaBook className="text-zinc-600 dark:text-zinc-400 text-2xl sm:text-3xl md:text-4xl" />
                My Courses
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-2 text-base sm:text-lg">
                Track and manage your learning journey
              </p>
            </div>

            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.3 }}
              className="w-full md:w-auto"
            >
              <Button
                onClick={() => setShowForm(!showForm)}
                className="w-full md:w-auto bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 shadow-md h-11 sm:h-12 px-5 sm:px-6 text-base sm:text-lg transition-all duration-300"
              >
                <FaPlus className="mr-2" />
                Add New Course
              </Button>
            </motion.div>
          </motion.div>

          {/* Search Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <SearchPanel />
          </motion.div>

          {/* Add Course Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl text-zinc-800 dark:text-zinc-100">
                      Add New Course
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="courseName"
                          className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-semibold"
                        >
                          <FaBook />
                          Course Name
                        </Label>
                        <Input
                          id="courseName"
                          placeholder="e.g., Data Structures"
                          value={form.name}
                          onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                          }
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-semibold">
                          <MdCategory />
                          Category
                        </Label>
                        <Select
                          value={form.category}
                          onValueChange={(value) =>
                            setForm({ ...form, category: value })
                          }
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Academic">Academic</SelectItem>
                            <SelectItem value="Skill">Skill</SelectItem>
                            <SelectItem value="Hobby">Hobby</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="targetHours"
                          className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-semibold"
                        >
                          <MdTimer />
                          Target Hours/Week
                        </Label>
                        <Input
                          id="targetHours"
                          type="number"
                          value={form.targetHours}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              targetHours: Number(e.target.value),
                            })
                          }
                          className="h-11"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 justify-end pt-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowForm(false)}
                        disabled={submitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={submit}
                        disabled={submitting}
                        className="bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200"
                      >
                        <FaPlus className="mr-2" />
                        {submitting ? "Adding..." : "Add Course"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Course Stats */}
          {loading ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <SkeletonStat key={i} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7 }}
              className="grid sm:grid-cols-2 md:grid-cols-4 gap-4"
            >
              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
                className="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-6 shadow-md border border-zinc-200 dark:border-zinc-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Total Courses
                    </p>
                    <p className="text-4xl font-bold text-zinc-800 dark:text-zinc-100">
                      {courses.length}
                    </p>
                  </div>
                  <FaBook className="text-5xl text-zinc-400 dark:text-zinc-600" />
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
                className="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-6 shadow-md border border-zinc-200 dark:border-zinc-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Academic
                    </p>
                    <p className="text-4xl font-bold text-zinc-800 dark:text-zinc-100">
                      {
                        courses.filter((c: Course) => c.category === "Academic")
                          .length
                      }
                    </p>
                  </div>
                  <FaGraduationCap className="text-5xl text-zinc-400 dark:text-zinc-600" />
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
                className="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-6 shadow-md border border-zinc-200 dark:border-zinc-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Skills
                    </p>
                    <p className="text-4xl font-bold text-zinc-800 dark:text-zinc-100">
                      {
                        courses.filter((c: Course) => c.category === "Skill")
                          .length
                      }
                    </p>
                  </div>
                  <FaTrophy className="text-5xl text-zinc-400 dark:text-zinc-600" />
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
                className="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-6 shadow-md border border-zinc-200 dark:border-zinc-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Avg Progress
                    </p>
                    <p className="text-4xl font-bold text-zinc-800 dark:text-zinc-100">
                      {courses.length > 0
                        ? Math.round(
                            courses.reduce(
                              (acc: number, c: Course) => acc + c.progress,
                              0
                            ) / courses.length
                          )
                        : 0}
                      %
                    </p>
                  </div>
                  <FaChartLine className="text-5xl text-zinc-400 dark:text-zinc-600" />
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* AI Learning Coach */}
          {!loading && courses.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
            >
              <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl text-zinc-800 dark:text-zinc-100 flex items-center gap-3">
                        <div className="p-2 bg-zinc-800 dark:bg-zinc-100 rounded-lg">
                          <FaBrain className="text-white dark:text-zinc-900 text-xl" />
                        </div>
                        AI Learning Coach
                      </CardTitle>
                      <p className="text-zinc-600 dark:text-zinc-400 mt-2">
                        {aiInsights
                          ? "Personalized insights from your learning behavior"
                          : "Get AI-powered analysis of your learning journey"}
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={loadAIInsights}
                      disabled={loadingAI}
                      className="p-3 bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Refresh AI Insights"
                    >
                      {loadingAI ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <FaRedo className="text-xl" />
                        </motion.div>
                      ) : (
                        <FaRedo className="text-xl" />
                      )}
                    </motion.button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingAI ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="mb-4 inline-block"
                        >
                          <FaBrain className="text-5xl text-zinc-400 dark:text-zinc-600" />
                        </motion.div>
                        <p className="text-sm text-zinc-500">
                          Analyzing your learning data...
                        </p>
                      </div>
                    </div>
                  ) : aiInsights ? (
                    <>
                      {/* AI Insights Grid */}
                      <div className="grid md:grid-cols-3 gap-4 mb-6">
                        <InsightCard
                          title="Next Focus"
                          value={aiInsights.focus_course || "N/A"}
                          description="Course needing immediate attention"
                          icon={FaRocket}
                        />
                        <InsightCard
                          title="Learning Velocity"
                          value={aiInsights.learning_velocity || "N/A"}
                          description="Based on progress & consistency"
                          icon={FaTachometerAlt}
                        />
                        <InsightCard
                          title="Burnout Risk"
                          value={aiInsights.burnout_risk || "Low"}
                          description="Monitor your learning balance"
                          icon={FaExclamationTriangle}
                        />
                      </div>

                      {/* AI Recommendations */}
                      {aiInsights?.insights && (
                        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-5 border border-zinc-200 dark:border-zinc-700">
                          <h4 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-3 flex items-center gap-2">
                            <FaLightbulb className="text-zinc-600 dark:text-zinc-400" />
                            Personalized Recommendations
                          </h4>
                          <ul className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                            {aiInsights.insights.map(
                              (i: string, idx: number) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2 pl-2"
                                >
                                  <span className="text-zinc-400 dark:text-zinc-600 mt-1">
                                    •
                                  </span>
                                  <span>{i}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 px-4">
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="mb-6"
                      >
                        <FaBrain className="text-6xl text-zinc-300 dark:text-zinc-700" />
                      </motion.div>
                      <h3 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100 mb-2">
                        AI Insights Not Loaded Yet
                      </h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center mb-6 max-w-md">
                        Click the refresh button above or the button below to
                        get personalized AI-powered insights about your learning
                        journey
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={loadAIInsights}
                        disabled={loadingAI}
                        className="px-6 py-3 bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 rounded-lg text-base font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                      >
                        <span className="flex items-center gap-2">
                          <FaBrain />
                          Get AI Insights
                        </span>
                      </motion.button>
                    </div>
                  )}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                    className="mt-6"
                  >
                    <Button
                      onClick={fetchGoalAdjustments}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white h-12 text-base font-semibold shadow-md"
                    >
                      <FaRocket className="mr-2" />
                      Optimize My Goals with AI
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Course List */}
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="text-center py-20"
            >
              <FaBook className="text-zinc-300 dark:text-zinc-700 text-8xl mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-zinc-400 dark:text-zinc-600 mb-2">
                No courses yet
              </h3>
              <p className="text-zinc-500 dark:text-zinc-500">
                Click &quot;Add New Course&quot; to get started!
              </p>
            </motion.div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {courses.map((course: Course, index: number) => (
                  <motion.div
                    key={course._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.15, duration: 0.6 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                  >
                    <Card className="h-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-lg hover:shadow-xl overflow-hidden group transition-all duration-500">
                      <CardHeader className="relative">
                        <div className="absolute top-0 right-0 text-8xl opacity-5 text-zinc-600 dark:text-zinc-400">
                          {getCategoryIcon(course.category)}
                        </div>
                        <Badge className="w-fit mb-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 border-zinc-300 dark:border-zinc-700">
                          {course.category}
                        </Badge>
                        <CardTitle className="text-2xl font-bold relative z-10 text-zinc-800 dark:text-zinc-100">
                          {course.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                            <MdTimer className="text-xl" />
                            <span>Target</span>
                          </div>
                          <span className="font-bold text-lg text-zinc-800 dark:text-zinc-100">
                            {course.targetHours} hrs/week
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-zinc-600 dark:text-zinc-400">
                              Progress
                            </span>
                            <span className="font-bold text-lg text-zinc-800 dark:text-zinc-100">
                              {course.progress}%
                            </span>
                          </div>
                          <Progress value={course.progress} className="h-3" />
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          transition={{ duration: 0.3 }}
                          onClick={() => setSelectedCourse(course)}
                          className="w-full bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 rounded-lg py-3 font-semibold transition-all duration-300"
                        >
                          View Details
                        </motion.button>
                        <button
                          className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => handleGenerateRoadmap(course._id)}
                          disabled={generatingRoadmap === course._id}
                        >
                          {generatingRoadmap === course._id
                            ? "Generating..."
                            : "Generate Roadmap"}
                        </button>
                        <Link
                          href={`/roadmap/${course._id}`}
                          className="text-green-600 dark:text-green-400 hover:underline mt-2 block text-sm"
                        >
                          View Roadmap →
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Course Details Modal */}
        <AnimatePresence>
          {selectedCourse && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedCourse(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors z-10"
                >
                  <FaTimes className="text-xl text-zinc-600 dark:text-zinc-400" />
                </button>

                <div className="space-y-6">
                  <div>
                    <Badge className="mb-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 border-zinc-300 dark:border-zinc-700">
                      {selectedCourse.category}
                    </Badge>
                    <h2 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100 mb-2">
                      {selectedCourse.name}
                    </h2>
                    <p className="text-zinc-600 dark:text-zinc-400">
                      Comprehensive progress tracking and activity history
                    </p>
                  </div>

                  {/* Weekly Progress Section */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                          <FaCalendarAlt className="text-blue-600 dark:text-blue-400" />
                          This Week&apos;s Progress
                        </h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                          Resets every 7 days
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                          {selectedCourse.weeklyProgress || 0}%
                        </p>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">
                          {selectedCourse.hoursThisWeek || 0}h /{" "}
                          {selectedCourse.targetHours}h
                        </p>
                      </div>
                    </div>
                    <Progress
                      value={selectedCourse.weeklyProgress || 0}
                      className="h-3 bg-blue-100 dark:bg-blue-900/50"
                    />
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 mb-2">
                        <FaChartLine className="text-lg" />
                        <span className="text-sm font-medium">
                          Overall Progress
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
                        {selectedCourse.progress}%
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        Total completion
                      </p>
                    </div>

                    <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 mb-2">
                        <MdTimer className="text-lg" />
                        <span className="text-sm font-medium">
                          Weekly Target
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
                        {selectedCourse.targetHours}h
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        Per week goal
                      </p>
                    </div>

                    <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 mb-2">
                        <FaFire className="text-lg text-orange-500" />
                        <span className="text-sm font-medium">
                          Total Activities
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
                        {selectedCourse.activityLog?.length || 0}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        Days tracked
                      </p>
                    </div>

                    <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 mb-2">
                        <FaTrophy className="text-lg text-yellow-500" />
                        <span className="text-sm font-medium">Tasks Done</span>
                      </div>
                      <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
                        {selectedCourse.activityLog?.reduce(
                          (sum: number, log: Activity) =>
                            sum + (log.tasksCompleted || 0),
                          0
                        ) || 0}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        All time
                      </p>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  {selectedCourse.activityLog &&
                    selectedCourse.activityLog.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                          <FaCalendarAlt className="text-zinc-600 dark:text-zinc-400" />
                          Recent Activity
                        </h3>
                        <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                          {selectedCourse.activityLog
                            .slice()
                            .reverse()
                            .slice(0, 10)
                            .map((log: Activity, index: number) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3 border border-zinc-200 dark:border-zinc-700"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                                      {new Date(log.date).toLocaleDateString(
                                        "en-US",
                                        {
                                          weekday: "short",
                                          month: "short",
                                          day: "numeric",
                                        }
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400">
                                    <span className="flex items-center gap-1">
                                      <MdTimer /> {log.hoursSpent}h
                                    </span>
                                    {log.tasksCompleted > 0 && (
                                      <span className="flex items-center gap-1">
                                        <FaCheck /> {log.tasksCompleted} tasks
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {log.note && (
                                  <p className="text-xs text-zinc-600 dark:text-zinc-400 italic">
                                    &quot;{log.note}&quot;
                                  </p>
                                )}
                              </motion.div>
                            ))}
                        </div>
                      </div>
                    )}

                  {/* Log Activity Form */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl p-6 border border-green-200 dark:border-green-800">
                    <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2 mb-4">
                      <FaPlus className="text-green-600 dark:text-green-400" />
                      Log Today&apos;s Activity
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="hoursSpent"
                            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                          >
                            Hours Spent
                          </Label>
                          <Input
                            id="hoursSpent"
                            type="number"
                            min="0"
                            step="0.5"
                            value={activityForm.hoursSpent}
                            onChange={(e) =>
                              setActivityForm({
                                ...activityForm,
                                hoursSpent: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="h-10"
                            placeholder="e.g., 2.5"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="tasksCompleted"
                            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                          >
                            Tasks Completed
                          </Label>
                          <Input
                            id="tasksCompleted"
                            type="number"
                            min="0"
                            value={activityForm.tasksCompleted}
                            onChange={(e) =>
                              setActivityForm({
                                ...activityForm,
                                tasksCompleted: parseInt(e.target.value) || 0,
                              })
                            }
                            className="h-10"
                            placeholder="e.g., 3"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="note"
                          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                        >
                          Note (Optional)
                        </Label>
                        <Input
                          id="note"
                          value={activityForm.note}
                          onChange={(e) =>
                            setActivityForm({
                              ...activityForm,
                              note: e.target.value,
                            })
                          }
                          className="h-10"
                          placeholder="What did you work on today?"
                        />
                      </div>
                      <Button
                        onClick={handleLogActivity}
                        disabled={loggingActivity}
                        className="w-full bg-green-600 hover:bg-green-700 text-white h-10"
                      >
                        {loggingActivity ? (
                          <>
                            <FaRedo className="mr-2 animate-spin" />
                            Logging...
                          </>
                        ) : (
                          <>
                            <FaCheck className="mr-2" />
                            Log Activity
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Overall Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-zinc-600 dark:text-zinc-400 font-medium">
                        Overall Course Progress
                      </span>
                      <span className="text-zinc-800 dark:text-zinc-100 font-bold">
                        {selectedCourse.progress}%
                      </span>
                    </div>
                    <Progress value={selectedCourse.progress} className="h-3" />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Link
                      href={`/roadmap/${selectedCourse._id}`}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 font-semibold text-center transition-all"
                    >
                      View Roadmap
                    </Link>
                    <button
                      onClick={() => {
                        handleGenerateRoadmap(selectedCourse._id);
                        setSelectedCourse(null);
                      }}
                      disabled={generatingRoadmap === selectedCourse._id}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-3 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {generatingRoadmap === selectedCourse._id
                        ? "Generating..."
                        : "Generate Roadmap"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Goal Adjustment Modal */}
        <AnimatePresence>
          {showGoalModal && goalSuggestions && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowGoalModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8 relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowGoalModal(false)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors z-10"
                >
                  <FaTimes className="text-xl text-zinc-600 dark:text-zinc-400" />
                </button>

                <div className="space-y-6">
                  {/* Header */}
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg">
                        <FaRocket className="text-white text-2xl" />
                      </div>
                      <h2 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">
                        AI Goal Recommendations
                      </h2>
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-400 mt-2">
                      {goalSuggestions.overallAdvice}
                    </p>
                  </div>

                  {/* Course Adjustments */}
                  {goalSuggestions.courseAdjustments &&
                    goalSuggestions.courseAdjustments.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                          <FaBook className="text-indigo-600 dark:text-indigo-400" />
                          Course Target Adjustments
                        </h3>
                        <div className="space-y-3">
                          {goalSuggestions.courseAdjustments.map(
                            (adjustment: CourseAdjustment, index: number) => (
                              <motion.div
                                key={adjustment.courseId}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-5 border border-zinc-200 dark:border-zinc-700"
                              >
                                <div className="flex items-start justify-between gap-4 mb-3">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-lg text-zinc-800 dark:text-zinc-100 mb-1">
                                      {adjustment.courseName}
                                    </h4>
                                    <div className="flex items-center gap-3 text-sm">
                                      <span className="text-zinc-500 dark:text-zinc-400 line-through">
                                        {adjustment.oldTargetHours} hrs/week
                                      </span>
                                      <FaArrowRight className="text-indigo-600 dark:text-indigo-400" />
                                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                        {adjustment.newTargetHours} hrs/week
                                      </span>
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    onClick={() => applyCourseGoal(adjustment)}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                  >
                                    <FaCheck className="mr-1" />
                                    Apply
                                  </Button>
                                </div>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 rounded-lg p-3">
                                  <FaLightbulb className="inline mr-2 text-amber-500" />
                                  {adjustment.reason}
                                </p>
                              </motion.div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Habit Adjustments */}
                  {goalSuggestions.habitAdjustments &&
                    (goalSuggestions.habitAdjustments.sleepTarget ||
                      goalSuggestions.habitAdjustments.studyTarget) && (
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                          <FaBrain className="text-purple-600 dark:text-purple-400" />
                          Habit Target Adjustments
                        </h3>
                        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-5 border border-zinc-200 dark:border-zinc-700">
                          <div className="space-y-3">
                            {goalSuggestions.habitAdjustments.sleepTarget && (
                              <div className="flex items-center justify-between">
                                <span className="text-zinc-700 dark:text-zinc-300">
                                  Sleep Target
                                </span>
                                <span className="font-bold text-purple-600 dark:text-purple-400">
                                  {goalSuggestions.habitAdjustments.sleepTarget}{" "}
                                  hours
                                </span>
                              </div>
                            )}
                            {goalSuggestions.habitAdjustments.studyTarget && (
                              <div className="flex items-center justify-between">
                                <span className="text-zinc-700 dark:text-zinc-300">
                                  Daily Study Target
                                </span>
                                <span className="font-bold text-purple-600 dark:text-purple-400">
                                  {goalSuggestions.habitAdjustments.studyTarget}{" "}
                                  hours
                                </span>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
                            <FaLightbulb className="inline mr-2 text-amber-500" />
                            {goalSuggestions.habitAdjustments.reason}
                          </p>
                        </div>
                      </div>
                    )}

                  {/* No Adjustments Message */}
                  {(!goalSuggestions.courseAdjustments ||
                    goalSuggestions.courseAdjustments.length === 0) &&
                    !goalSuggestions.habitAdjustments?.sleepTarget &&
                    !goalSuggestions.habitAdjustments?.studyTarget && (
                      <div className="text-center py-8">
                        <FaCheck className="text-6xl text-green-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-2">
                          You&apos;re on track!
                        </h3>
                        <p className="text-zinc-600 dark:text-zinc-400">
                          Your current goals are well-balanced. Keep up the
                          great work!
                        </p>
                      </div>
                    )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                    {goalSuggestions.courseAdjustments &&
                      goalSuggestions.courseAdjustments.length > 0 && (
                        <Button
                          onClick={applyAllCourseGoals}
                          className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white h-12"
                        >
                          <FaCheck className="mr-2" />
                          Apply All Adjustments
                        </Button>
                      )}
                    <Button
                      variant="outline"
                      onClick={() => setShowGoalModal(false)}
                      className="flex-1 h-12"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Protected>
  );
}
