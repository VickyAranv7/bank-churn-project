from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import os
import pandas as pd

app = Flask(__name__)
CORS(app)

base_dir = os.path.dirname(__file__)

# ✅ Load trained model (NOT dataset)
model = pickle.load(open(os.path.join(base_dir, "model.pkl"), "rb"))
columns = pickle.load(open(os.path.join(base_dir, "columns.pkl"), "rb"))

@app.route("/")
def home():
    return "API Running"

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json

    input_data = dict.fromkeys(columns, 0)

    input_data["CreditScore"] = data["credit_score"]
    input_data["Age"] = data["age"]
    input_data["Balance"] = data["balance"]
    input_data["EstimatedSalary"] = data["salary"]
    input_data["Tenure"] = data["tenure"]
    input_data["NumOfProducts"] = data["products"]

    input_data["Gender"] = 1 if data["gender"] == "Male" else 0

    if "Geography_Germany" in input_data:
        input_data["Geography_Germany"] = 1 if data["geography"] == "Germany" else 0
    if "Geography_Spain" in input_data:
        input_data["Geography_Spain"] = 1 if data["geography"] == "Spain" else 0

    df = pd.DataFrame([input_data])[columns]

    pred = model.predict(df)[0]
    prob = model.predict_proba(df)[0][1]

    result = "Customer will churn" if pred == 1 else "Customer will stay"

    return jsonify({
        "prediction": result,
        "probability": round(float(prob) * 100, 2)
    })

if __name__ == "__main__":
    app.run(debug=True)