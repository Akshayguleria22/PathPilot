from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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
