import os
import json
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# ---------------- INIT ---------------- #

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ML model (resource ranking)
try:
    ranker = joblib.load("models/resource_ranker.pkl")
    print("✅ ML model loaded successfully")
except Exception as e:
    print(f"⚠️  Warning: Could not load ML model - {e}")
    ranker = None

# Groq LLM client
groq_api_key = os.getenv("GROQ_API_KEY")
if not groq_api_key:
    print("⚠️  Warning: GROQ_API_KEY not set - AI features will be limited")
    groq_client = None
else:
    try:
        groq_client = Groq(api_key=groq_api_key)
        print("✅ GROQ client initialized successfully")
    except Exception as e:
        print(f"⚠️  Warning: Could not initialize GROQ client - {e}")
        groq_client = None

# ---------------- HEALTH CHECK ---------------- #

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "groq_available": groq_client is not None,
        "ml_model_available": ranker is not None
    }


# ---------------- SCHEMAS ---------------- #

class WeeklyData(BaseModel):
    sleep: float
    study: float
    entertainment: float
    exercise: float
    mood: float
    stress: float


class RoadmapRequest(BaseModel):
    course_name: str
    user_level: str = "beginner"


class AdaptRequest(BaseModel):
    course_name: str
    completed_steps: int
    total_steps: int
    score: int
    confidence: int


class WeeklySummaryRequest(BaseModel):
    course_name: str
    progress: int
    completed_steps: int
    total_steps: int
    avg_study_hours: float
    avg_sleep_hours: float
    score: int
    confidence: int


class RankRequest(BaseModel):
    clicks: int
    completions: int
    score: int
    confidence: int


# ---------------- ANALYTICS ---------------- #

@app.post("/analyze")
def analyze(data: WeeklyData):
    insights = []

    if data.sleep < 7:
        insights.append("Increase sleep to at least 7 hours.")
    else:
        insights.append("Good sleep consistency detected.")

    if data.study < 3:
        insights.append("Increase structured learning time.")
    else:
        insights.append("Study rhythm is healthy.")

    if data.entertainment > 3:
        insights.append("Reduce screen time for better focus.")

    if data.exercise < 0.5:
        insights.append("Add light daily physical activity.")

    if data.stress > 6:
        insights.append("High stress detected. Try mindfulness.")

    return {"advice": insights}


# ---------------- AI ROADMAP (GROQ) ---------------- #

@app.post("/generate-roadmap")
def generate_roadmap(req: RoadmapRequest):
    try:
        prompt = f"""
You are an expert learning architect.

Create a structured learning roadmap for:
Course: {req.course_name}
Level: {req.user_level}

Return ONLY valid JSON:
{{
  "steps": [
    {{
      "title": "",
      "description": "",
      "difficulty": "beginner|intermediate|advanced",
      "estimatedHours": number,
      "topics": []
    }}
  ]
}}
No explanations. No markdown.
"""

        if not groq_client:
            print("❌ GROQ client not available")
            raise HTTPException(status_code=503, detail="AI service unavailable: GROQ_API_KEY not configured")

        print(f"🔄 Generating roadmap for: {req.course_name} ({req.user_level})")
        
        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )

        content = completion.choices[0].message.content
        print(f"✅ Received response from GROQ")
        
        # Parse and validate JSON
        result = json.loads(content)
        
        if "steps" not in result:
            print("⚠️  Invalid response format: missing 'steps' field")
            raise HTTPException(status_code=500, detail="Invalid AI response format")
        
        print(f"✅ Successfully generated roadmap with {len(result['steps'])} steps")
        return result
        
    except json.JSONDecodeError as e:
        print(f"❌ JSON parsing error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to parse AI response: {str(e)}")
    except Exception as e:
        print(f"❌ Error generating roadmap: {type(e).__name__}: {str(e)}")
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(status_code=500, detail=f"Failed to generate roadmap: {str(e)}")


# ---------------- ROADMAP ADAPTATION ---------------- #

@app.post("/adapt-roadmap")
def adapt_roadmap(req: AdaptRequest):
    actions = []
    recommendations = []

    progress_ratio = (
        req.completed_steps / req.total_steps if req.total_steps else 0
    )

    if req.score > 80 and req.confidence >= 4:
        actions.append("skip_intro")
        recommendations.append("Move to advanced topics.")

    if req.score < 50:
        actions.append("add_practice")
        recommendations.append("Revise fundamentals with practice.")

    if progress_ratio > 0.7:
        actions.append("increase_challenge")

    if progress_ratio < 0.3:
        actions.append("reduce_load")

    return {
        "actions": actions,
        "recommendations": recommendations,
    }


# ---------------- WEEKLY SUMMARY ---------------- #

@app.post("/weekly-summary")
def weekly_summary(req: WeeklySummaryRequest):
    summary = [
        f"You completed {req.completed_steps}/{req.total_steps} steps "
        f"({req.progress}% progress) in {req.course_name}."
    ]

    if req.avg_study_hours < 2:
        summary.append("Increase daily study time.")
    if req.avg_sleep_hours < 6:
        summary.append("Improve sleep for better learning.")

    if req.score < 50:
        summary.append("Focus on fundamentals.")
    elif req.score > 80:
        summary.append("Try advanced challenges.")

    return {"summary": summary}


# ---------------- ML RANKING ---------------- #

@app.post("/rank")
def rank(req: RankRequest):
    df = pd.DataFrame([{
        "clicks": req.clicks,
        "completions": req.completions,
        "score": req.score,
        "confidence": req.confidence,
    }])

    rank_score = ranker.predict(df)[0]
    return {"rankScore": float(rank_score)}

class ResourceQueryReq(BaseModel):
    topic: str


@app.post("/generate-resource-queries")
def generate_resource_queries(req: ResourceQueryReq):
    if not groq_client:
        raise HTTPException(status_code=503, detail="AI service unavailable: GROQ_API_KEY not configured")
    
    prompt = f"""
Generate 5 high-quality YouTube search queries
for the topic: {req.topic}

Focus on:
- tutorials
- explanations
- practice

Return ONLY a JSON array of strings.
"""

    completion = groq_client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
    )

    text = completion.choices[0].message.content

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {
            "error": "Invalid AI response",
            "raw": text
        }
