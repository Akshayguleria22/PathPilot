import { getLLMResponse } from "../services/llmService.js";
import { searchWeb, formatSearchContext } from "../services/webSearchService.js";

// ════════════════════════════════════════════════════════════════
//  HEALTH CHECK
// ════════════════════════════════════════════════════════════════

export function healthCheck(req, res) {
    res.json({
        status: "healthy",
        groq_available: !!process.env.GROQ_API_KEY,
        web_search_available: !!process.env.SERP_API_KEY,
        ml_model_available: true,
    });
}

// ════════════════════════════════════════════════════════════════
//  ANALYZE — LLM-enhanced wellness & productivity analysis
// ════════════════════════════════════════════════════════════════

export async function analyze(req, res) {
    try {
        const { sleep, study, entertainment, exercise, mood, stress } = req.body;

        const prompt = `You are an expert wellness and productivity coach for students.

Analyze this student's weekly behavioral data and provide 4-6 specific, actionable, personalized insights.

Weekly Data:
- Sleep: ${sleep} hours/night
- Study: ${study} hours/day
- Entertainment/Screen time: ${entertainment} hours/day
- Exercise: ${exercise} hours/day
- Mood: ${mood}/10
- Stress: ${stress}/10

Guidelines:
- Be specific (reference their actual numbers)
- Prioritize the most impactful changes first
- If sleep < 7h, address it. If stress > 6, address it.
- Include one encouraging insight about what they're doing well
- Keep each insight to 1-2 sentences

Respond with ONLY valid JSON (no markdown, no code blocks):
{
  "advice": [
    "insight 1",
    "insight 2",
    "insight 3"
  ]
}`;

        const content = await getLLMResponse(prompt);
        let cleaned = content.trim();
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replace(/```json\n?/g, "").replace(/```\n?/g, "");
        }
        const parsed = JSON.parse(cleaned);

        if (!Array.isArray(parsed.advice)) {
            throw new Error("Invalid format");
        }

        res.json(parsed);
    } catch (err) {
        console.error("❌ LLM analyze failed, using rule-based fallback:", err.message);
        // ── Fallback to rule-based logic ──
        const { sleep, study, entertainment, exercise, mood, stress } = req.body;
        const insights = [];
        if (sleep < 7) insights.push("Increase sleep to at least 7 hours for better memory consolidation.");
        else insights.push("Good sleep consistency detected — keep it up.");
        if (study < 3) insights.push("Try to increase structured learning time to at least 3 hours.");
        else insights.push("Your study rhythm is healthy.");
        if (entertainment > 3) insights.push("Consider reducing screen time for better focus.");
        if (exercise < 0.5) insights.push("Add at least 30 minutes of light daily physical activity.");
        if (stress > 6) insights.push("High stress detected. Try mindfulness, breathing exercises, or short walks.");
        res.json({ advice: insights });
    }
}

// ════════════════════════════════════════════════════════════════
//  GENERATE ROADMAP — RAG: Web Search + LLM
//  Searches for real curriculum info, then uses LLM to create
//  a grounded, up-to-date learning roadmap.
// ════════════════════════════════════════════════════════════════

export async function generateRoadmapHandler(req, res) {
    try {
        const { course_name, user_level = "beginner" } = req.body;

        if (!course_name) {
            return res.status(400).json({ message: "course_name is required" });
        }

        if (!process.env.GROQ_API_KEY) {
            return res.status(503).json({
                detail: "AI service unavailable: GROQ_API_KEY not configured",
            });
        }

        console.log(`🔄 [RAG] Generating roadmap for: ${course_name} (${user_level})`);

        // ── Step 1: Web Search for real curriculum context ──
        const [curriculumResults, resourceResults] = await Promise.all([
            searchWeb(`${course_name} complete learning roadmap curriculum ${user_level} 2025`),
            searchWeb(`best ${course_name} tutorials courses resources for ${user_level}`),
        ]);

        const searchContext = `
REAL-WORLD CURRICULUM REFERENCES (from web search):
${formatSearchContext(curriculumResults)}

RECOMMENDED LEARNING RESOURCES:
${formatSearchContext(resourceResults)}
`;

        // ── Step 2: LLM with grounded context ──
        const prompt = `You are an expert learning architect. You have access to real-world curriculum data from the web.

Create a structured, comprehensive learning roadmap for:
Course: ${course_name}
Level: ${user_level}

${searchContext}

INSTRUCTIONS:
- Use the web search results above to ground your roadmap in real, current curriculum standards
- Include 6-10 well-structured steps covering the full learning journey
- Each step should build on the previous one
- Incorporate real topics, tools, and frameworks mentioned in the search results
- Make descriptions actionable and specific, not generic

Return ONLY valid JSON (no markdown, no explanations):
{
  "steps": [
    {
      "title": "Step title",
      "description": "Detailed description of what to learn and why",
      "difficulty": "beginner|intermediate|advanced",
      "estimatedHours": number,
      "topics": ["topic1", "topic2"]
    }
  ]
}`;

        const content = await getLLMResponse(prompt);
        console.log("✅ Received RAG-enhanced response from GROQ");

        let cleaned = content.trim();
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replace(/```json\n?/g, "").replace(/```\n?/g, "");
        }

        const result = JSON.parse(cleaned);

        if (!result.steps || !Array.isArray(result.steps)) {
            console.log("⚠️  Invalid response format: missing 'steps' field");
            return res.status(500).json({ detail: "Invalid AI response format" });
        }

        console.log(`✅ Successfully generated RAG roadmap with ${result.steps.length} steps`);
        res.json(result);
    } catch (err) {
        console.error(`❌ Error generating roadmap: ${err.message}`);
        if (err instanceof SyntaxError) {
            return res.status(500).json({ detail: `Failed to parse AI response: ${err.message}` });
        }
        res.status(500).json({ detail: `Failed to generate roadmap: ${err.message}` });
    }
}

// ════════════════════════════════════════════════════════════════
//  ADAPT ROADMAP — LLM-enhanced with web search context
//  Uses LLM to make smarter adaptation decisions, constrained
//  to predefined actions for compatibility with roadmapsRoutes.
// ════════════════════════════════════════════════════════════════

/**
 * Core adaptation logic — called by both the endpoint handler and
 * roadmapsRoutes.js directly.
 * Returns { actions: string[], recommendations: string[] }
 */
export async function adaptRoadmapLogic({ course_name, completed_steps, total_steps, score, confidence }) {
    try {
        const progressRatio = total_steps ? completed_steps / total_steps : 0;
        const progressPercent = Math.round(progressRatio * 100);

        // ── Web search for study tips ──
        const searchResults = await searchWeb(
            `how to improve learning ${course_name || "programming"} study tips for students`
        );
        const searchContext = formatSearchContext(searchResults);

        const prompt = `You are an AI learning optimization coach. Analyze the student's learning progress and decide which adaptation actions to apply.

STUDENT PROGRESS DATA:
- Course: ${course_name || "Current Course"}
- Completed: ${completed_steps}/${total_steps} steps (${progressPercent}%)
- Assessment Score: ${score}/100
- Self-Confidence: ${confidence}/5

STUDY TIPS FROM WEB:
${searchContext}

AVAILABLE ACTIONS (choose ONLY from these exact strings):
- "skip_intro" — Skip introductory content (only when score > 80 AND confidence >= 4, meaning student clearly knows basics)
- "add_practice" — Add extra practice exercises (when score < 50, student is struggling)
- "increase_challenge" — Add advanced project (when progress > 70%, student is doing very well)
- "reduce_load" — Reduce workload and slow down (when progress < 30%, student is falling behind)

RULES:
- Only select actions that genuinely help based on the data
- A student can have 0 to 4 actions
- For each action selected, provide a specific recommendation explaining why
- Incorporate relevant tips from the web search results into your recommendations

Respond with ONLY valid JSON (no markdown):
{
  "actions": ["action_string_1"],
  "recommendations": [
    "Specific recommendation referencing the student's data"
  ]
}`;

        const content = await getLLMResponse(prompt);
        let cleaned = content.trim();
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replace(/```json\n?/g, "").replace(/```\n?/g, "");
        }

        const parsed = JSON.parse(cleaned);

        // Validate actions are from allowed set
        const allowedActions = ["skip_intro", "add_practice", "increase_challenge", "reduce_load"];
        const validActions = (parsed.actions || []).filter(a => allowedActions.includes(a));
        const recommendations = parsed.recommendations || [];

        return { actions: validActions, recommendations };
    } catch (err) {
        console.error("❌ LLM adapt failed, using rule-based fallback:", err.message);
        // ── Fallback to rule-based logic ──
        const actions = [];
        const recommendations = [];
        const progressRatio = total_steps ? completed_steps / total_steps : 0;

        if (score > 80 && confidence >= 4) {
            actions.push("skip_intro");
            recommendations.push("Your strong assessment score and high confidence suggest you can move to advanced topics.");
        }
        if (score < 50) {
            actions.push("add_practice");
            recommendations.push("Your assessment score indicates areas that need more practice. Revise fundamentals.");
        }
        if (progressRatio > 0.7) {
            actions.push("increase_challenge");
        }
        if (progressRatio < 0.3) {
            actions.push("reduce_load");
        }

        return { actions, recommendations };
    }
}

// Express endpoint handler
export async function adaptRoadmap(req, res) {
    try {
        const result = await adaptRoadmapLogic(req.body);
        res.json(result);
    } catch (err) {
        console.error("❌ Adapt roadmap error:", err.message);
        res.status(500).json({ message: "Failed to adapt roadmap", error: err.message });
    }
}

// ════════════════════════════════════════════════════════════════
//  WEEKLY SUMMARY — LLM-enhanced personalized summary
// ════════════════════════════════════════════════════════════════

/**
 * Core weekly summary logic — called by both the endpoint handler and
 * roadmapsRoutes.js directly.
 * Returns { summary: string[] }
 */
export async function weeklySummaryLogic({
    course_name,
    progress,
    completed_steps,
    total_steps,
    avg_study_hours,
    avg_sleep_hours,
    score,
    confidence,
}) {
    try {
        const prompt = `You are a motivational learning coach reviewing a student's weekly performance.

WEEKLY PERFORMANCE DATA:
- Course: ${course_name}
- Progress: ${completed_steps}/${total_steps} steps completed (${progress}%)
- Average Daily Study: ${avg_study_hours} hours
- Average Sleep: ${avg_sleep_hours} hours/night
- Assessment Score: ${score}/100
- Self-Confidence: ${confidence}/5

Generate a personalized weekly summary with 3-5 bullet points that:
1. Acknowledge their progress with specific numbers
2. Identify the #1 area for improvement (be specific)
3. Give a concrete, actionable tip for next week
4. End with encouragement

Respond with ONLY valid JSON (no markdown):
{
  "summary": [
    "summary point 1",
    "summary point 2",
    "summary point 3"
  ]
}`;

        const content = await getLLMResponse(prompt);
        let cleaned = content.trim();
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replace(/```json\n?/g, "").replace(/```\n?/g, "");
        }

        const parsed = JSON.parse(cleaned);
        if (!Array.isArray(parsed.summary)) throw new Error("Invalid format");

        return parsed;
    } catch (err) {
        console.error("❌ LLM weekly summary failed, using rule-based fallback:", err.message);
        // ── Fallback ──
        const summary = [
            `You completed ${completed_steps}/${total_steps} steps (${progress}% progress) in ${course_name}.`,
        ];
        if (avg_study_hours < 2) summary.push("Increase daily study time for faster progress.");
        if (avg_sleep_hours < 6) summary.push("Improve sleep for better learning retention.");
        if (score < 50) summary.push("Focus on fundamentals and revisit weaker areas.");
        else if (score > 80) summary.push("Great scores! Try advanced challenges to push further.");

        return { summary };
    }
}

// Express endpoint handler
export async function weeklySummary(req, res) {
    try {
        const result = await weeklySummaryLogic(req.body);
        res.json(result);
    } catch (err) {
        console.error("❌ Weekly summary error:", err.message);
        res.status(500).json({ message: "Failed to generate weekly summary", error: err.message });
    }
}

// ════════════════════════════════════════════════════════════════
//  RANK — Weighted scoring formula (fast, deterministic)
//  Kept as a formula because ranking must be fast and
//  deterministic. LLM latency would hurt UX here.
// ════════════════════════════════════════════════════════════════

export function rank(req, res) {
    try {
        const { clicks, completions, score, confidence } = req.body;

        const rankScore =
            clicks * 0.15 +
            completions * 0.35 +
            score * 0.30 +
            confidence * 0.20;

        res.json({ rankScore });
    } catch (err) {
        console.error("❌ Rank error:", err.message);
        res.status(400).json({ message: "Invalid request data", error: err.message });
    }
}

// ════════════════════════════════════════════════════════════════
//  GENERATE RESOURCE QUERIES — RAG: Web Search + LLM
//  Searches for trending content first, then uses LLM to
//  craft high-quality, targeted search queries.
// ════════════════════════════════════════════════════════════════

export async function generateResourceQueries(req, res) {
    try {
        const { topic } = req.body;

        if (!topic) {
            return res.status(400).json({ message: "topic is required" });
        }

        if (!process.env.GROQ_API_KEY) {
            return res.status(503).json({
                detail: "AI service unavailable: GROQ_API_KEY not configured",
            });
        }

        // ── Web search for context on what's currently popular ──
        const trendResults = await searchWeb(`best ${topic} tutorials 2025 beginner to advanced`);
        const searchContext = formatSearchContext(trendResults);

        const prompt = `You are an expert at finding the best educational content on YouTube.

Topic: ${topic}

CURRENT TRENDING RESOURCES (from web search):
${searchContext}

Using the trending resources above as context, generate 5 highly-specific YouTube search queries that would find the BEST educational content for "${topic}".

Requirements:
- Include queries for different skill levels (beginner, intermediate, advanced)
- Reference specific popular creators, tools, or frameworks from the search results when relevant
- Include queries for tutorials, crash courses, project-based learning, and deep dives
- Make queries specific enough to find high-quality results (not generic)

Return ONLY a JSON array of strings (no markdown):
["query 1", "query 2", "query 3", "query 4", "query 5"]`;

        const text = await getLLMResponse(prompt);
        let cleaned = text.trim();
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replace(/```json\n?/g, "").replace(/```\n?/g, "");
        }

        try {
            const parsed = JSON.parse(cleaned);
            res.json(parsed);
        } catch {
            res.json({ error: "Invalid AI response", raw: text });
        }
    } catch (err) {
        console.error("❌ Resource queries error:", err.message);
        res.status(500).json({ detail: `Failed to generate queries: ${err.message}` });
    }
}
