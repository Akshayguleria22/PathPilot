from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI()

# CORS: allow frontend -> backend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # use ["http://localhost:3000"] in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class WeeklyData(BaseModel):
    sleep: float
    study: float
    entertainment: float
    exercise: float
    mood: float
    stress: float

@app.post("/analyze")
def analyze(data: WeeklyData):
    insights = []

    if data.sleep < 7:
        insights.append("Increase sleep to at least 7 hours.")
    else:
        insights.append("Good sleep consistency detected.")

    if data.study < 3:
        insights.append("Increase structured learning time for better retention.")
    else:
        insights.append("Study rhythm is healthy. Keep consistency.")

    if data.entertainment > 3:
        insights.append("Screen time seems high. Try replacing 30 minutes with reading or walking.")

    if data.exercise < 0.5:
        insights.append("Add 20 minutes of physical activity to improve energy and focus.")

    if data.stress > 6:
        insights.append("High stress detected. Try journaling or deep breathing sessions.")

    return {"advice": insights}

class RoadmapRequest(BaseModel):
    course_name: str
    user_level: str  # beginner | intermediate | advanced

@app.post("/generate-roadmap")
def generate_roadmap(req: RoadmapRequest):
    """
    AI Roadmap Generator (Concept-wise)
    """

    roadmap = [
        {
            "title": "Fundamental Concepts",
            "description": f"Core foundations of {req.course_name}.",
            "resources": [
                {
                    "type": "video",
                    "title": "Introduction Video",
                    "url": "https://www.youtube.com/"
                },
                {
                    "type": "article",
                    "title": "Fundamentals Article",
                    "url": "https://medium.com/"
                },
                {
                    "type": "book",
                    "title": "Recommended Book Chapter",
                    "url": "https://books.google.com/"
                },
                {
                    "type": "practice",
                    "title": "Practice Exercises",
                    "url": "https://leetcode.com/"
                }
            ]
        },
        {
            "title": "Intermediate Concepts",
            "description": f"Build deeper understanding of {req.course_name}.",
            "resources": [
                {
                    "type": "video",
                    "title": "Intermediate Tutorial",
                    "url": "https://www.youtube.com/"
                },
                {
                    "type": "article",
                    "title": "Intermediate Reading",
                    "url": "https://medium.com/"
                },
                {
                    "type": "practice",
                    "title": "Hands-on Practice",
                    "url": "https://leetcode.com/"
                }
            ]
        },
        {
            "title": "Advanced & Application",
            "description": f"Real-world application and mastery of {req.course_name}.",
            "resources": [
                {
                    "type": "video",
                    "title": "Advanced Concepts Video",
                    "url": "https://www.youtube.com/"
                },
                {
                    "type": "book",
                    "title": "Advanced Book Reference",
                    "url": "https://books.google.com/"
                },
                {
                    "type": "practice",
                    "title": "Advanced Projects / Problems",
                    "url": "https://github.com/"
                }
            ]
        }
    ]

    return {"steps": roadmap}

class AdaptRequest(BaseModel):
    course_name: str
    completed_steps: int
    total_steps: int
    score: int
    confidence: int

@app.post("/adapt-roadmap")
def adapt_roadmap(req: AdaptRequest):
    """
    AI Roadmap Adaptation Engine
    Returns both recommendations (GET endpoint) and actionable changes (POST endpoint)
    """
    actions = []
    recommendations = []

    progress_ratio = req.completed_steps / req.total_steps if req.total_steps > 0 else 0

    # High performers
    if req.score > 80 and req.confidence >= 4:
        actions.append({"type": "skip_intro"})
        recommendations.append("Skip introductory content and move to advanced topics.")
    # Struggling learners
    elif req.score < 50:
        actions.append({"type": "add_practice"})
        recommendations.append("Add more practice problems and revise fundamentals.")

    # High progress
    if progress_ratio > 0.7:
        actions.append({"type": "increase_challenge"})
        recommendations.append("Increase challenge with real-world projects.")
    # Low progress
    elif progress_ratio < 0.3:
        actions.append({"type": "reduce_load"})
        recommendations.append("Reduce daily load to avoid burnout.")

    return {
        "actions": actions,
        "recommendations": recommendations
    }

class WeeklySummaryRequest(BaseModel):
    course_name: str
    progress: int
    completed_steps: int
    total_steps: int
    avg_study_hours: float
    avg_sleep_hours: float
    score: int
    confidence: int

@app.post("/weekly-summary")
def weekly_summary(req: WeeklySummaryRequest):
    summary = []

    summary.append(
        f"You completed {req.completed_steps} out of {req.total_steps} roadmap steps "
        f"and reached {req.progress}% progress in {req.course_name}."
    )

    if req.avg_study_hours < 2:
        summary.append("Your study time is low. Try blocking at least 2 focused hours daily.")
    else:
        summary.append("Your study consistency is good. Keep the momentum.")

    if req.avg_sleep_hours < 6:
        summary.append("Sleep is insufficient. Better rest will improve focus and retention.")
    else:
        summary.append("Your sleep schedule supports productive learning.")

    if req.score < 50:
        summary.append("Assessment scores indicate weak fundamentals. Focus on revision.")
    elif req.score > 80:
        summary.append("Strong performance detected. Consider tackling advanced challenges.")

    summary.append("Next week focus: consistency, deep work, and one measurable improvement.")

    return {
        "summary": summary
    }
