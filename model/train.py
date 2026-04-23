import pandas as pd
import pickle
import os

from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.compose import ColumnTransformer

df = pd.read_csv("dataset/Churn_Modelling.csv")

df.drop(["RowNumber", "CustomerId", "Surname"], axis=1, inplace=True)
df.fillna(0, inplace=True)

df["Gender"] = df["Gender"].map({"Male": 1, "Female": 0})
df = pd.get_dummies(df, columns=["Geography"], drop_first=True)

X = df.drop("Exited", axis=1)
y = df["Exited"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

num_cols = ["CreditScore", "Age", "Tenure", "Balance",
            "NumOfProducts", "EstimatedSalary",
            "HasCrCard", "IsActiveMember"]

preprocessor = ColumnTransformer([
    ("num", StandardScaler(), num_cols)
], remainder="passthrough")

pipeline = Pipeline([
    ("preprocess", preprocessor),
    ("model", LogisticRegression(max_iter=1000))
])

pipeline.fit(X_train, y_train)

os.makedirs("backend", exist_ok=True)

with open("backend/model.pkl", "wb") as f:
    pickle.dump(pipeline, f)

with open("backend/columns.pkl", "wb") as f:
    pickle.dump(X.columns.tolist(), f)

print("✅ Model created successfully")