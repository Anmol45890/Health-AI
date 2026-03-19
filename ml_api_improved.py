from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Union, Tuple
import joblib
import json
import numpy as np
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Advanced Disease Predictor API", version="2.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the improved trained model and encoders
try:
    model = joblib.load('disease_predictor_model_improved.pkl')
    mlb = joblib.load('symptom_encoder_improved.pkl')
    with open('symptoms_list_improved.json', 'r') as f:
        symptoms_list = json.load(f)
    with open('model_metadata.json', 'r') as f:
        metadata = json.load(f)
    print("✅ Improved model and encoders loaded successfully!")
    print(f"📊 Model: {metadata['model_name']}")
    print(f"🎯 Accuracy: {metadata['accuracy']:.3f}")
except FileNotFoundError as e:
    print(f"❌ Error loading improved model files: {e}")
    print("🔄 Falling back to basic model...")
    try:
        model = joblib.load('disease_predictor_model.pkl')
        mlb = joblib.load('symptom_encoder.pkl')
        with open('symptoms_list.json', 'r') as f:
            symptoms_list = json.load(f)
        metadata = {"model_name": "Random Forest (Basic)", "accuracy": 0.85}
        print("✅ Basic model loaded as fallback!")
    except FileNotFoundError:
        print("❌ No model files found!")
        model = None
        mlb = None
        symptoms_list = []
        metadata = {}

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
    model_info: Dict[str, Union[str, float, int]]

def predict_disease(symptoms: List[str]) -> Tuple[List[Dict[str, float]], Dict[str, Union[str, float, int]]]:
    """
    Predict disease with improved model
    """
    if model is None or mlb is None:
        raise HTTPException(status_code=500, detail="Model not loaded")

    # Validate and normalize symptoms
    normalized_symptoms = [s.lower().replace(' ', '_') for s in symptoms]
    invalid_symptoms = [s for s in normalized_symptoms if s not in symptoms_list]

    if invalid_symptoms:
        # Try to find close matches or suggest alternatives
        suggestions = []
        for invalid in invalid_symptoms:
            # Simple fuzzy matching - find symptoms that contain parts of the invalid symptom
            matches = [s for s in symptoms_list if invalid in s or any(word in s for word in invalid.split('_'))]
            if matches:
                suggestions.extend(matches[:2])  # Top 2 matches

        error_msg = f"Invalid symptoms: {invalid_symptoms}."
        if suggestions:
            error_msg += f" Did you mean: {list(set(suggestions))}?"
        error_msg += f" Valid symptoms: {symptoms_list[:10]}... (showing first 10)"

        raise HTTPException(status_code=400, detail=error_msg)

    # Convert symptoms to feature vector
    symptom_vector = mlb.transform([normalized_symptoms])

    # Get prediction probabilities
    probabilities = model.predict_proba(symptom_vector)[0]

    # Create response with disease names and probabilities
    disease_names = model.classes_
    predictions = [
        {"disease": disease.replace('_', ' '), "confidence": float(prob)}
        for disease, prob in zip(disease_names, probabilities)
    ]

    # Sort by confidence (highest first)
    predictions.sort(key=lambda x: x["confidence"], reverse=True)

    # Filter out very low confidence predictions
    predictions = [p for p in predictions if p["confidence"] > 0.01]

    return predictions, metadata

@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    predictions, model_info = predict_disease(request.symptoms)

    # Get top prediction
    top_prediction = predictions[0] if predictions else {"disease": "Unable to determine", "confidence": 0.0}

    # Ensure model_info is JSON serializable
    serializable_model_info = {
        "model_name": str(model_info.get("model_name", "Unknown")),
        "accuracy": float(model_info.get("accuracy", 0)),
        "cv_mean": float(model_info.get("cv_mean", 0)),
        "cv_std": float(model_info.get("cv_std", 0)),
        "num_features": int(model_info.get("num_features", 0)),
        "num_classes": int(model_info.get("num_classes", 0)),
        "training_samples": int(model_info.get("training_samples", 0)),
        "test_samples": int(model_info.get("test_samples", 0))
    }

    return PredictionResponse(
        predictions=predictions[:5],  # Return top 5 predictions
        top_prediction=top_prediction,
        model_info=serializable_model_info
    )

@app.get("/symptoms")
async def get_symptoms():
    return {
        "symptoms": symptoms_list,
        "count": len(symptoms_list),
        "categories": {
            "respiratory": [s for s in symptoms_list if any(word in s for word in ['cough', 'breath', 'lung', 'chest', 'throat'])],
            "gastrointestinal": [s for s in symptoms_list if any(word in s for word in ['nausea', 'vomit', 'diarrhea', 'abdominal', 'stomach'])],
            "neurological": [s for s in symptoms_list if any(word in s for word in ['headache', 'dizziness', 'confusion', 'memory'])],
            "musculoskeletal": [s for s in symptoms_list if any(word in s for word in ['pain', 'joint', 'muscle', 'back'])],
            "systemic": [s for s in symptoms_list if any(word in s for word in ['fever', 'fatigue', 'sweat', 'chills'])]
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "model_info": metadata,
        "api_version": "2.0.0"
    }

@app.get("/model-info")
async def get_model_info():
    """Get detailed information about the current model"""
    if not metadata:
        raise HTTPException(status_code=500, detail="Model metadata not available")

    return {
        "model_name": metadata.get("model_name", "Unknown"),
        "accuracy": metadata.get("accuracy", 0),
        "cross_validation_mean": metadata.get("cv_mean", 0),
        "cross_validation_std": metadata.get("cv_std", 0),
        "num_features": metadata.get("num_features", 0),
        "num_classes": metadata.get("num_classes", 0),
        "classes": metadata.get("classes", []),
        "training_samples": metadata.get("training_samples", 0),
        "test_samples": metadata.get("test_samples", 0)
    }

@app.post("/batch-predict")
async def batch_predict(requests: List[PredictionRequest]):
    """Predict for multiple symptom sets"""
    results = []
    for req in requests:
        try:
            predictions, _ = predict_disease(req.symptoms)
            results.append({
                "symptoms": req.symptoms,
                "predictions": predictions[:3],  # Top 3 for each
                "success": True
            })
        except Exception as e:
            results.append({
                "symptoms": req.symptoms,
                "error": str(e),
                "success": False
            })

    return {"results": results}

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Advanced Disease Predictor API v2.0...")
    uvicorn.run(app, host="0.0.0.0", port=8000)