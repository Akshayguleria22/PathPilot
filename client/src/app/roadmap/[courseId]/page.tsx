"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Protected from "@/components/Protected";
import {
  getRoadmap,
  updateRoadmapStep,
  submitAssessment,
  autoAdaptRoadmap,
  trackEvent,
  fetchResources,
} from "@/lib/api";
import RoadmapFlow from "@/components/RoadmapFlow";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { FaCheckCircle, FaClock, FaPlay } from "react-icons/fa";

export default function RoadmapPage() {
  const params = useParams();
  const courseId = params.courseId as string;

  const [roadmap, setRoadmap] = useState<any>(null);
  const [error, setError] = useState("");
  const [score, setScore] = useState<number>(0);
  const [confidence, setConfidence] = useState<number>(3);
  const [submittingAssessment, setSubmittingAssessment] = useState(false);
  const [adaptingRoadmap, setAdaptingRoadmap] = useState(false);
  const [updatingStep, setUpdatingStep] = useState<number | null>(null);
  const [fetchingResources, setFetchingResources] = useState<number | null>(
    null
  );
  const [resources, setResources] = useState<any>(null);
  const [resourcesForStepIndex, setResourcesForStepIndex] = useState<
    number | null
  >(null);

  /* ---------------- LOAD ROADMAP ---------------- */
  useEffect(() => {
    if (!courseId) {
      setError("Course ID missing");
      return;
    }

    const load = async () => {
      try {
        const data = await getRoadmap(courseId);
        setRoadmap(data);
      } catch {
        setError("Roadmap not found. Please generate it first.");
      }
    };

    load();
  }, [courseId]);

  /* ---------------- STEP STATUS ---------------- */
  const changeStatus = async (
    stepIndex: number,
    status: "pending" | "in-progress" | "completed"
  ) => {
    setUpdatingStep(stepIndex);
    const toastId = toast.loading("Updating step status...");

    try {
      const res = await updateRoadmapStep(courseId, stepIndex, status);
      setRoadmap(res.roadmap);
      toast.success("Step status updated!", { id: toastId });
    } catch {
      toast.error("Failed to update step status", { id: toastId });
    } finally {
      setUpdatingStep(null);
    }
  };

  /* ---------------- ASSESSMENT ---------------- */
  const handleSubmitAssessment = async () => {
    const toastId = toast.loading("Saving assessment...");

    try {
      await submitAssessment(courseId, score, confidence);

      trackEvent({
        eventType: "assessment_submitted",
        courseId,
        metadata: {
          score,
          confidence,
        },
      });

      toast.success("Assessment saved! AI will now adapt recommendations.", {
        id: toastId,
      });
      setSubmittingAssessment(false);
    } catch {
      toast.error("Failed to save assessment.", { id: toastId });
      setSubmittingAssessment(false);
    }
  };

  /* ---------------- AUTO ADAPT ---------------- */
  const handleAutoAdaptRoadmap = async () => {
    setAdaptingRoadmap(true);
    const toastId = toast.loading("AI is analyzing your progress...");

    try {
      const data = await autoAdaptRoadmap(courseId);

      if (!data.actionsApplied || data.actionsApplied.length === 0) {
        toast.success("Your roadmap is already optimized!", { id: toastId });
        return;
      }

      setRoadmap(data.roadmap);
      const actions = (data.actionsApplied || [])
        .filter((a: any) => a && typeof a === "string") // Filter out null/undefined
        .map((a: string) => a.replace(/_/g, " "))
        .join(", ");
      toast.success(`Roadmap adapted! Actions: ${actions}`, {
        id: toastId,
        duration: 5000,
      });
    } catch (err: any) {
      if (err.message.includes("Insufficient data")) {
        toast.error("Please submit a self-assessment first", { id: toastId });
      } else {
        toast.error(err.message || "Failed to adapt roadmap", { id: toastId });
      }
    } finally {
      setAdaptingRoadmap(false);
    }
  };

  /* ---------------- UI STATES ---------------- */
  if (error) {
    return (
      <Protected>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center p-8 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
            <p className="text-red-600 dark:text-red-400 text-lg">{error}</p>
          </div>
        </div>
      </Protected>
    );
  }

  if (!roadmap || !roadmap.steps || !Array.isArray(roadmap.steps)) {
    return (
      <Protected>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-zinc-600 dark:text-zinc-400 text-lg">
            Loading roadmap...
          </div>
        </div>
      </Protected>
    );
  }

  const completedCount = roadmap.steps.filter(
    (s: any) => s.status === "completed"
  ).length;

  const progressPercent = Math.round(
    (completedCount / roadmap.steps.length) * 100
  );

  const fetchResourcesForStep = async (
    stepTitle: string,
    stepIndex: number
  ) => {
    if (!stepTitle || stepTitle === "undefined") {
      toast.error("Invalid step title");
      return;
    }
    const toastId = toast.loading("Fetching resources...");
    try {
      const res = await fetchResources(stepTitle, courseId);
      console.log("Fetched resources:", res);

      if (res && res.resources && Array.isArray(res.resources)) {
        setResources(res.resources);
        setResourcesForStepIndex(stepIndex);
        toast.success(`Found ${res.resources.length} resources!`, {
          id: toastId,
        });
      } else {
        setResources([]);
        setResourcesForStepIndex(null);
        toast.error("No resources found", { id: toastId });
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
      toast.error("Failed to fetch resources", { id: toastId });
      setResources([]);
      setResourcesForStepIndex(null);
    }
  };

  /* ---------------- RENDER ---------------- */
  return (
    <Protected>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-zinc-950 dark:via-blue-950/20 dark:to-purple-950/10 p-6 md:p-10">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* HEADER */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-zinc-800 dark:text-zinc-100">
                Course Roadmap
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                Track your learning journey
              </p>
            </div>
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full border-4 border-zinc-200 dark:border-zinc-700"></div>
              <div
                className="absolute inset-0 rounded-full border-4 border-indigo-600 dark:border-indigo-500"
                style={{
                  clipPath: `inset(0 ${100 - progressPercent}% 0 0)`,
                  transition: "clip-path 0.5s ease",
                }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
                  {progressPercent}%
                </span>
              </div>
            </div>
          </motion.div>

          {/* VISUAL FLOW */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <RoadmapFlow steps={roadmap.steps} />
          </motion.div>

          {/* ASSESSMENT & AI */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* SELF ASSESSMENT */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-lg space-y-4"
            >
              <h3 className="font-bold text-xl text-zinc-800 dark:text-zinc-100">
                Self Assessment
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Rate your understanding to help AI adapt your roadmap
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Score (0–100)
                  </label>
                  <input
                    type="number"
                    placeholder="Enter score"
                    min="0"
                    max="100"
                    className="border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 p-3 w-full rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none"
                    onChange={(e) => setScore(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Confidence Level
                  </label>
                  <select
                    className="border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 p-3 w-full rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none"
                    onChange={(e) => setConfidence(Number(e.target.value))}
                  >
                    <option value={3}>Medium</option>
                    <option value={1}>Very Low</option>
                    <option value={2}>Low</option>
                    <option value={4}>High</option>
                    <option value={5}>Very High</option>
                  </select>
                </div>

                <button
                  onClick={handleSubmitAssessment}
                  disabled={submittingAssessment}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingAssessment ? "Saving..." : "Submit Assessment"}
                </button>
              </div>
            </motion.div>

            {/* AI ADAPT */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-purple-600 to-indigo-600 dark:from-purple-700 dark:to-indigo-700 p-6 rounded-2xl shadow-lg text-white space-y-4"
            >
              <h3 className="font-bold text-xl">AI-Powered Adaptation</h3>
              <p className="text-sm text-purple-100">
                Let AI analyze your progress and optimize your learning path
                automatically
              </p>

              <button
                onClick={handleAutoAdaptRoadmap}
                disabled={adaptingRoadmap}
                className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-semibold transition-all border border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adaptingRoadmap ? "Analyzing..." : "Auto-Adapt Roadmap"}
              </button>
            </motion.div>
          </div>

          {/* STEPS */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
              Learning Steps
            </h2>
            {roadmap.steps.map((step: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          step.status === "completed"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                            : step.status === "in-progress"
                            ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600"
                        }`}
                      >
                        {step.status === "completed" ? (
                          <FaCheckCircle />
                        ) : step.status === "in-progress" ? (
                          <FaPlay />
                        ) : (
                          <FaClock />
                        )}
                      </div>
                      <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
                        {step.title}
                      </h2>
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-400 ml-13">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* RESOURCES */}
                {step.resources && step.resources.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {step.resources.map((r: any, i: number) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 uppercase">
                          {r.type}
                        </span>
                        <a
                          href={r.url}
                          target="_blank"
                          className="text-blue-600 underline"
                          onClick={() => {
                            trackEvent({
                              eventType: "resource_clicked",
                              courseId,
                              resourceId: r.url, // or videoId later
                              metadata: {
                                type: r.type,
                                title: r.title,
                              },
                            });
                          }}
                        >
                          [{r.type}] {r.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}

                {/* STATUS BUTTONS */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <button
                    onClick={() => {
                      changeStatus(index, "in-progress");

                      trackEvent({
                        eventType: "step_started",
                        courseId,
                        metadata: {
                          stepIndex: index,
                          stepTitle: step.title,
                        },
                      });
                    }}
                    className="text-xs bg-yellow-500 text-white px-3 py-1 rounded"
                  >
                    In Progress
                  </button>

                  <button
                    onClick={() => {
                      changeStatus(index, "completed");

                      trackEvent({
                        eventType: "step_completed",
                        courseId,
                        metadata: {
                          stepIndex: index,
                          stepTitle: step.title,
                        },
                      });
                    }}
                    disabled={updatingStep === index}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Mark Completed
                  </button>
                  <button
                    onClick={async () => {
                      setFetchingResources(index);
                      const toastId = toast.loading("Fetching resources...");

                      try {
                        const query = step.title || "tutorial";
                        const res = await fetchResources(query, courseId);

                        if (res && (res.videos || res.articles || res.docs)) {
                          setResources(res);
                          setResourcesForStepIndex(index);
                          const total =
                            (res.videos?.length || 0) +
                            (res.articles?.length || 0) +
                            (res.docs?.length || 0);
                          toast.success(`Found ${total} resources!`, {
                            id: toastId,
                          });
                        } else {
                          toast.error("No resources found", { id: toastId });
                        }
                      } catch (error: any) {
                        console.error("Fetch resources error:", error);
                        toast.error(
                          error.message || "Failed to fetch resources",
                          { id: toastId }
                        );
                      } finally {
                        setFetchingResources(null);
                      }
                    }}
                    disabled={fetchingResources === index}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-all disabled:cursor-not-allowed"
                  >
                    {fetchingResources === index
                      ? "Fetching..."
                      : "Fetch Resources"}
                  </button>

                  <span className="ml-auto text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                    Status:{" "}
                    <span className="font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                      {step.status.replace("-", " ")}
                    </span>
                  </span>
                </div>
                {/* FETCHED RESOURCES */}
                {resourcesForStepIndex === index &&
                  resources?.videos &&
                  resources.videos.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-3 flex items-center gap-2">
                        🎥 Videos
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {resources.videos.map((v: any, i: number) => (
                          <a
                            key={i}
                            href={v.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white dark:bg-zinc-800"
                          >
                            <img
                              src={v.thumbnail}
                              alt={v.title}
                              className="w-full h-40 object-cover"
                            />
                            <div className="p-3">
                              <p className="text-sm font-semibold line-clamp-2 text-zinc-800 dark:text-zinc-200">
                                {v.title}
                              </p>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                {v.views
                                  ? `${Math.round(v.views / 1000)}K views`
                                  : "YouTube"}
                              </p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                {resourcesForStepIndex === index &&
                  resources?.articles &&
                  resources.articles.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-3 flex items-center gap-2">
                        📰 Articles
                      </h4>
                      <div className="space-y-3">
                        {resources.articles.map((a: any, i: number) => (
                          <a
                            key={i}
                            href={a.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors bg-white dark:bg-zinc-900"
                          >
                            <div className="flex gap-3">
                              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                                📄
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-zinc-800 dark:text-zinc-200 mb-1 line-clamp-2">
                                  {a.title}
                                </p>
                                {a.snippet && (
                                  <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                                    {a.snippet}
                                  </p>
                                )}
                                <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                                  {a.source || "Web"}
                                </p>
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                {resourcesForStepIndex === index &&
                  resources?.docs &&
                  resources.docs.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-3 flex items-center gap-2">
                        📚 Documentation
                      </h4>
                      <div className="space-y-3">
                        {resources.docs.map((d: any, i: number) => (
                          <a
                            key={i}
                            href={d.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-4 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors bg-white dark:bg-zinc-900"
                          >
                            <div className="flex gap-3">
                              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                                📖
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-zinc-800 dark:text-zinc-200 mb-1 line-clamp-2">
                                  {d.title}
                                </p>
                                {d.snippet && (
                                  <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                                    {d.snippet}
                                  </p>
                                )}
                                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                  Official Documentation
                                </p>
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Protected>
  );
}
