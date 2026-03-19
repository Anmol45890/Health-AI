import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.metrics import accuracy_score, classification_report
import joblib
import json

# Create synthetic medical dataset
def create_synthetic_dataset():
    # Common symptoms
    symptoms = [
        'fever', 'cough', 'headache', 'fatigue', 'nausea', 'vomiting',
        'diarrhea', 'sore_throat', 'body_aches', 'chills', 'runny_nose',
        'chest_pain', 'shortness_breath', 'dizziness', 'abdominal_pain',
        'joint_pain', 'rash', 'loss_appetite', 'sweating', 'confusion'
    ]

    # Diseases and their typical symptoms
    diseases_data = {
        'Flu': ['fever', 'cough', 'body_aches', 'fatigue', 'headache', 'chills'],
        'Common_Cold': ['cough', 'runny_nose', 'sore_throat', 'headache', 'fatigue'],
        'Migraine': ['headache', 'nausea', 'dizziness', 'fatigue'],
        'Gastroenteritis': ['nausea', 'vomiting', 'diarrhea', 'abdominal_pain', 'fever'],
        'COVID-19': ['fever', 'cough', 'fatigue', 'loss_appetite', 'body_aches', 'shortness_breath'],
        'Pneumonia': ['fever', 'cough', 'chest_pain', 'shortness_breath', 'fatigue'],
        'Anxiety': ['fatigue', 'headache', 'dizziness', 'sweating', 'confusion'],
        'Food_Poisoning': ['nausea', 'vomiting', 'diarrhea', 'abdominal_pain', 'fever'],
        'Allergic_Reaction': ['rash', 'cough', 'runny_nose', 'dizziness'],
        'Bronchitis': ['cough', 'chest_pain', 'fatigue', 'fever']
    }

    # Generate training data
    data = []
    labels = []

    for disease, typical_symptoms in diseases_data.items():
        # Generate positive examples (with the disease)
        for _ in range(200):  # 200 examples per disease
            # Start with typical symptoms
            patient_symptoms = set(typical_symptoms.copy())

            # Add some random symptoms (noise)
            num_extra = np.random.randint(0, 3)
            available_symptoms = [s for s in symptoms if s not in patient_symptoms]
            if available_symptoms:
                extra_symptoms = np.random.choice(available_symptoms, size=min(num_extra, len(available_symptoms)), replace=False)
                patient_symptoms.update(extra_symptoms)

            # Remove some symptoms randomly (incomplete reporting)
            if len(patient_symptoms) > 1:
                num_remove = np.random.randint(0, 2)
                symptoms_list = list(patient_symptoms)
                for _ in range(min(num_remove, len(symptoms_list))):
                    symptoms_list.pop(np.random.randint(len(symptoms_list)))
                patient_symptoms = set(symptoms_list)

            data.append(list(patient_symptoms))
            labels.append(disease)

        # Generate negative examples (without the disease)
        for _ in range(50):  # 50 negative examples per disease
            # Random symptoms not typical for this disease
            other_symptoms = [s for s in symptoms if s not in typical_symptoms]
            num_symptoms = np.random.randint(1, 5)
            patient_symptoms = set(np.random.choice(other_symptoms, size=num_symptoms, replace=False))
            data.append(list(patient_symptoms))
            labels.append('Other')

    return data, labels, symptoms

# Train the model
def train_model():
    print("Creating synthetic dataset...")
    data, labels, symptoms = create_synthetic_dataset()

    # Convert to DataFrame for easier handling
    df = pd.DataFrame({'symptoms': data, 'disease': labels})

    # Multi-label binarization for symptoms
    mlb = MultiLabelBinarizer()
    X = mlb.fit_transform(df['symptoms'])
    y = df['disease']

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Train Random Forest model
    print("Training Random Forest model...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model Accuracy: {accuracy:.2f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))

    # Save model and encoders
    joblib.dump(model, 'disease_predictor_model.pkl')
    joblib.dump(mlb, 'symptom_encoder.pkl')

    # Save symptoms list
    with open('symptoms_list.json', 'w') as f:
        json.dump(symptoms, f)

    print("Model and encoders saved successfully!")
    return model, mlb, symptoms

if __name__ == "__main__":
    train_model()