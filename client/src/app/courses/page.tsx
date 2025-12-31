"use client";

import { useState, useEffect } from "react";
import { addCourse, getCourses } from "@/lib/api";
import Protected from "@/components/Protected";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { FaBook, FaPlus, FaGraduationCap, FaTrophy, FaChartLine } from "react-icons/fa";
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

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({
    name: "",
    category: "Academic",
    targetHours: 5,
  });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadCourses = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const data = await getCourses();
    setCourses(data);
    setLoading(false);
  };

  const submit = async () => {
    if (!form.name.trim()) return alert("Enter course name");

    const res = await addCourse(form);
    alert(res.message);
    setForm({ name: "", category: "Academic", targetHours: 5 });
    setShowForm(false);
    loadCourses();
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

  return (
    <Protected>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-3">
                <FaBook className="text-zinc-600 dark:text-zinc-400" />
                My Courses
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-2 text-lg">Track and manage your learning journey</p>
            </div>
            
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.3 }}>
              <Button
                onClick={() => setShowForm(!showForm)}
                className="bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 shadow-md h-12 px-6 text-lg transition-all duration-300"
              >
                <FaPlus className="mr-2" />
                Add New Course
              </Button>
            </motion.div>
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
                    <CardTitle className="text-2xl text-zinc-800 dark:text-zinc-100">Add New Course</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="courseName" className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-semibold">
                          <FaBook />
                          Course Name
                        </Label>
                        <Input
                          id="courseName"
                          placeholder="e.g., Data Structures"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-semibold">
                          <MdCategory />
                          Category
                        </Label>
                        <Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value })}>
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
                        <Label htmlFor="targetHours" className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-semibold">
                          <MdTimer />
                          Target Hours/Week
                        </Label>
                        <Input
                          id="targetHours"
                          type="number"
                          value={form.targetHours}
                          onChange={(e) => setForm({ ...form, targetHours: Number(e.target.value) })}
                          className="h-11"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 justify-end pt-2">
                      <Button variant="outline" onClick={() => setShowForm(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={submit}
                        className="bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900"
                      >
                        <FaPlus className="mr-2" />
                        Add Course
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
              {[...Array(4)].map((_, i) => <SkeletonStat key={i} />)}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7 }}
              className="grid sm:grid-cols-2 md:grid-cols-4 gap-4"
            >
              <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.3 }} className="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-6 shadow-md border border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Courses</p>
                    <p className="text-4xl font-bold text-zinc-800 dark:text-zinc-100">{courses.length}</p>
                  </div>
                  <FaBook className="text-5xl text-zinc-400 dark:text-zinc-600" />
                </div>
              </motion.div>

              <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.3 }} className="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-6 shadow-md border border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Academic</p>
                    <p className="text-4xl font-bold text-zinc-800 dark:text-zinc-100">{courses.filter((c: any) => c.category === "Academic").length}</p>
                  </div>
                  <FaGraduationCap className="text-5xl text-zinc-400 dark:text-zinc-600" />
                </div>
              </motion.div>

              <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.3 }} className="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-6 shadow-md border border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Skills</p>
                    <p className="text-4xl font-bold text-zinc-800 dark:text-zinc-100">{courses.filter((c: any) => c.category === "Skill").length}</p>
                  </div>
                  <FaTrophy className="text-5xl text-zinc-400 dark:text-zinc-600" />
                </div>
              </motion.div>

              <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.3 }} className="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-6 shadow-md border border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Avg Progress</p>
                    <p className="text-4xl font-bold text-zinc-800 dark:text-zinc-100">
                      {courses.length > 0 ? Math.round(courses.reduce((acc: number, c: any) => acc + c.progress, 0) / courses.length) : 0}%
                    </p>
                  </div>
                  <FaChartLine className="text-5xl text-zinc-400 dark:text-zinc-600" />
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Tips Section */}
          {!loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.7 }}
            >
              <Card className="bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 shadow-md">
                <CardHeader>
                  <CardTitle className="text-2xl text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                    💡 Course Management Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 text-zinc-700 dark:text-zinc-300">
                    <div className="flex items-start gap-3 p-4 bg-white dark:bg-zinc-900 rounded-lg">
                      <span className="text-2xl">🎯</span>
                      <div>
                        <p className="font-semibold mb-1">Set Realistic Goals</p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">Start with achievable weekly hour targets and adjust based on your progress</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-white dark:bg-zinc-900 rounded-lg">
                      <span className="text-2xl">📅</span>
                      <div>
                        <p className="font-semibold mb-1">Categorize Wisely</p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">Use categories to prioritize - Academic for critical courses, Skills for development</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-white dark:bg-zinc-900 rounded-lg">
                      <span className="text-2xl">🔄</span>
                      <div>
                        <p className="font-semibold mb-1">Regular Updates</p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">Update your progress regularly to see meaningful trends in your analytics</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-white dark:bg-zinc-900 rounded-lg">
                      <span className="text-2xl">⚖️</span>
                      <div>
                        <p className="font-semibold mb-1">Balance Your Load</p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">Distribute study hours across courses to avoid burnout and maintain quality</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Course List */}
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : courses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="text-center py-20"
            >
              <FaBook className="text-zinc-300 dark:text-zinc-700 text-8xl mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-zinc-400 dark:text-zinc-600 mb-2">No courses yet</h3>
              <p className="text-zinc-500 dark:text-zinc-500">Click "Add New Course" to get started!</p>
            </motion.div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {courses.map((course: any, index: number) => (
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
                        <CardTitle className="text-2xl font-bold relative z-10 text-zinc-800 dark:text-zinc-100">{course.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                            <MdTimer className="text-xl" />
                            <span>Target</span>
                          </div>
                          <span className="font-bold text-lg text-zinc-800 dark:text-zinc-100">{course.targetHours} hrs/week</span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-zinc-600 dark:text-zinc-400">Progress</span>
                            <span className="font-bold text-lg text-zinc-800 dark:text-zinc-100">{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} className="h-3" />
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          transition={{ duration: 0.3 }}
                          className="w-full bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 rounded-lg py-3 font-semibold transition-all duration-300"
                        >
                          View Details
                        </motion.button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </Protected>
  );
}
