import pandas as pd
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split

# Load real data
data = pd.read_csv("data/resource_training.csv")

X = data[["clicks", "completions", "score", "confidence"]]
y = data["rank_score"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model = RandomForestRegressor(
    n_estimators=200,
    max_depth=8,
    random_state=42
)

model.fit(X_train, y_train)

joblib.dump(model, "models/resource_ranker.pkl")

print("Model trained on REAL data and saved")
