import joblib
import json

# Load the improved model
try:
    model = joblib.load('disease_predictor_model_improved.pkl')
    mlb = joblib.load('symptom_encoder_improved.pkl')
    with open('symptoms_list_improved.json', 'r') as f:
        symptoms_list = json.load(f)

    print("✅ Model loaded successfully!")
    print(f"Model type: {type(model)}")
    print(f"Has predict_proba: {hasattr(model, 'predict_proba')}")

    # Test prediction
    test_symptoms = ["fever", "cough", "fatigue"]
    print(f"Testing with symptoms: {test_symptoms}")

    # Convert to feature vector
    symptom_vector = mlb.transform([test_symptoms])
    print(f"Feature vector shape: {symptom_vector.shape}")

    # Get prediction
    if hasattr(model, 'predict_proba'):
        probabilities = model.predict_proba(symptom_vector)[0]
        disease_names = model.classes_
        predictions = [
            {"disease": disease, "confidence": float(prob)}
            for disease, prob in zip(disease_names, probabilities)
        ]
        predictions.sort(key=lambda x: x["confidence"], reverse=True)
        print("Top 3 predictions:")
        for pred in predictions[:3]:
            print(".3f")
    else:
        prediction = model.predict(symptom_vector)
        print(f"Prediction (no probabilities): {prediction}")

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()