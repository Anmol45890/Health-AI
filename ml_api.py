from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Union
import joblib
import json
import numpy as np
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Disease Predictor API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the trained model and encoders
try:
    model = joblib.load('disease_predictor_model.pkl')
    mlb = joblib.load('symptom_encoder.pkl')
    with open('symptoms_list.json', 'r') as f:
        symptoms_list = json.load(f)
    print("Model and encoders loaded successfully!")
except FileNotFoundError as e:
    print(f"Error loading model files: {e}")
    model = None
    mlb = None
    symptoms_list = []

class PredictionRequest(BaseModel):
    symptoms: List[str]

class PredictionItem(BaseModel):
    disease: str
    confidence: float

class TopPrediction(BaseModel):
    disease: str
    confidence: float

class PredictionResponse(BaseModel):
    predictions: List[PredictionItem]
    top_prediction: TopPrediction

def predict_disease(symptoms: List[str]) -> List[Dict[str, float]]:
    if model is None or mlb is None:
        raise HTTPException(status_code=500, detail="Model not loaded")

    # Validate symptoms
    invalid_symptoms = [s for s in symptoms if s not in symptoms_list]
    if invalid_symptoms:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid symptoms: {invalid_symptoms}. Valid symptoms: {symptoms_list}"
        )

    # Convert symptoms to feature vector
    symptom_vector = mlb.transform([symptoms])

    # Get prediction probabilities
    probabilities = model.predict_proba(symptom_vector)[0]

    # Create response with disease names and probabilities
    disease_names = model.classes_
    predictions = [
        {"disease": disease, "confidence": float(prob)}
        for disease, prob in zip(disease_names, probabilities)
    ]

    # Sort by confidence (highest first)
    predictions.sort(key=lambda x: x["confidence"], reverse=True)

    return predictions

@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    predictions = predict_disease(request.symptoms)

    # Get top prediction
    top_prediction = predictions[0] if predictions else {"disease": "Unknown", "confidence": 0.0}

    return PredictionResponse(
        predictions=predictions,
        top_prediction=top_prediction
    )

@app.get("/symptoms")
async def get_symptoms():
    return {"symptoms": symptoms_list}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_loaded": model is not None}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)