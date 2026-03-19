import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import MultiLabelBinarizer, StandardScaler
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, roc_auc_score
from sklearn.pipeline import Pipeline
import joblib
import json
import matplotlib.pyplot as plt
import seaborn as sns
from typing import Dict, List, Tuple

# Create comprehensive synthetic medical dataset
def create_comprehensive_dataset(num_samples_per_disease: int = 500) -> Tuple[List, List, List]:
    """
    Create a more comprehensive synthetic medical dataset with realistic symptom patterns
    """
    # Expanded symptoms list
    symptoms = [
        'fever', 'cough', 'headache', 'fatigue', 'nausea', 'vomiting',
        'diarrhea', 'sore_throat', 'body_aches', 'chills', 'runny_nose',
        'chest_pain', 'shortness_breath', 'dizziness', 'abdominal_pain',
        'joint_pain', 'rash', 'loss_appetite', 'sweating', 'confusion',
        'muscle_pain', 'back_pain', 'neck_pain', 'ear_pain', 'eye_pain',
        'skin_itching', 'swelling', 'bruising', 'bleeding', 'weight_loss',
        'weight_gain', 'insomnia', 'sleepiness', 'mood_changes', 'anxiety',
        'depression', 'memory_problems', 'concentration_difficulty'
    ]

    # Comprehensive disease profiles with symptom frequencies
    diseases_data = {
        'Flu': {
            'core_symptoms': ['fever', 'cough', 'body_aches', 'fatigue', 'headache', 'chills'],
            'common_symptoms': ['sore_throat', 'runny_nose', 'sweating'],
            'rare_symptoms': ['nausea', 'vomiting', 'dizziness']
        },
        'Common_Cold': {
            'core_symptoms': ['runny_nose', 'sore_throat', 'cough'],
            'common_symptoms': ['headache', 'fatigue', 'sneezing'],
            'rare_symptoms': ['fever', 'body_aches']
        },
        'Migraine': {
            'core_symptoms': ['headache', 'nausea'],
            'common_symptoms': ['dizziness', 'fatigue', 'sensitivity_to_light'],
            'rare_symptoms': ['vomiting', 'confusion']
        },
        'Gastroenteritis': {
            'core_symptoms': ['nausea', 'vomiting', 'diarrhea', 'abdominal_pain'],
            'common_symptoms': ['fever', 'fatigue', 'dehydration'],
            'rare_symptoms': ['headache', 'muscle_pain']
        },
        'COVID-19': {
            'core_symptoms': ['fever', 'cough', 'fatigue'],
            'common_symptoms': ['loss_appetite', 'body_aches', 'shortness_breath', 'sore_throat'],
            'rare_symptoms': ['nausea', 'diarrhea', 'confusion', 'rash']
        },
        'Pneumonia': {
            'core_symptoms': ['fever', 'cough', 'chest_pain', 'shortness_breath'],
            'common_symptoms': ['fatigue', 'sweating', 'chills'],
            'rare_symptoms': ['nausea', 'confusion', 'abdominal_pain']
        },
        'Bronchitis': {
            'core_symptoms': ['cough', 'chest_pain', 'fatigue'],
            'common_symptoms': ['fever', 'shortness_breath', 'sore_throat'],
            'rare_symptoms': ['body_aches', 'headache']
        },
        'Anxiety_Disorder': {
            'core_symptoms': ['anxiety', 'fatigue', 'insomnia'],
            'common_symptoms': ['headache', 'dizziness', 'sweating', 'trembling'],
            'rare_symptoms': ['chest_pain', 'shortness_breath', 'nausea']
        },
        'Depression': {
            'core_symptoms': ['fatigue', 'mood_changes', 'depression'],
            'common_symptoms': ['insomnia', 'loss_appetite', 'concentration_difficulty'],
            'rare_symptoms': ['headache', 'body_aches', 'weight_changes']
        },
        'Food_Poisoning': {
            'core_symptoms': ['nausea', 'vomiting', 'diarrhea', 'abdominal_pain'],
            'common_symptoms': ['fever', 'fatigue', 'headache'],
            'rare_symptoms': ['dizziness', 'sweating']
        },
        'Allergic_Reaction': {
            'core_symptoms': ['rash', 'itching'],
            'common_symptoms': ['runny_nose', 'sneezing', 'cough'],
            'rare_symptoms': ['swelling', 'shortness_breath', 'dizziness']
        },
        'Diabetes_Type_2': {
            'core_symptoms': ['fatigue', 'frequent_urination', 'increased_thirst'],
            'common_symptoms': ['weight_loss', 'slow_healing', 'blurred_vision'],
            'rare_symptoms': ['tingling', 'frequent_infections']
        },
        'Hypertension': {
            'core_symptoms': ['headache', 'dizziness'],
            'common_symptoms': ['fatigue', 'chest_pain', 'shortness_breath'],
            'rare_symptoms': ['nosebleeds', 'flushing']
        },
        'Asthma': {
            'core_symptoms': ['shortness_breath', 'cough', 'wheezing'],
            'common_symptoms': ['chest_tightness', 'fatigue'],
            'rare_symptoms': ['anxiety', 'sweating']
        },
        'Arthritis': {
            'core_symptoms': ['joint_pain', 'stiffness', 'swelling'],
            'common_symptoms': ['fatigue', 'reduced_range_of_motion'],
            'rare_symptoms': ['fever', 'weight_loss']
        }
    }

    data = []
    labels = []

    print(f"Generating {num_samples_per_disease} samples per disease...")

    for disease, symptom_profile in diseases_data.items():
        print(f"Generating data for {disease}...")

        # Generate positive examples
        for _ in range(num_samples_per_disease):
            patient_symptoms = set()

            # Always include core symptoms (with some probability of missing)
            for symptom in symptom_profile['core_symptoms']:
                if np.random.random() > 0.1:  # 90% chance of having core symptom
                    patient_symptoms.add(symptom)

            # Add common symptoms with lower probability
            for symptom in symptom_profile['common_symptoms']:
                if np.random.random() > 0.4:  # 60% chance
                    patient_symptoms.add(symptom)

            # Rarely add rare symptoms
            for symptom in symptom_profile['rare_symptoms']:
                if np.random.random() > 0.8:  # 20% chance
                    patient_symptoms.add(symptom)

            # Add some random noise (unrelated symptoms)
            num_noise = np.random.randint(0, 3)
            available_noise = [s for s in symptoms if s not in patient_symptoms]
            if available_noise and num_noise > 0:
                noise_symptoms = np.random.choice(available_noise, size=min(num_noise, len(available_noise)), replace=False)
                patient_symptoms.update(noise_symptoms)

            # Ensure at least one symptom
            if not patient_symptoms:
                patient_symptoms.add(np.random.choice(symptom_profile['core_symptoms']))

            data.append(list(patient_symptoms))
            labels.append(disease)

        # Generate negative examples (other diseases or healthy)
        for _ in range(num_samples_per_disease // 4):  # Fewer negative examples
            # Random symptoms not typical for this disease
            other_symptoms = []
            for d, profile in diseases_data.items():
                if d != disease:
                    other_symptoms.extend(profile['core_symptoms'] + profile['common_symptoms'])

            # Remove duplicates and limit
            other_symptoms = list(set(other_symptoms))[:20]  # Limit to prevent too many options

            num_symptoms = np.random.randint(1, 4)
            if other_symptoms:
                patient_symptoms = set(np.random.choice(other_symptoms, size=min(num_symptoms, len(other_symptoms)), replace=False))
                data.append(list(patient_symptoms))
                labels.append('Other')

    return data, labels, symptoms

def evaluate_models(X_train, X_test, y_train, y_test, models: Dict) -> Dict:
    """
    Evaluate multiple models and return comprehensive metrics
    """
    results = {}

    for name, model in models.items():
        print(f"\nEvaluating {name}...")

        # Train model
        model.fit(X_train, y_train)

        # Predictions
        y_pred = model.predict(X_test)
        y_pred_proba = model.predict_proba(X_test) if hasattr(model, 'predict_proba') else None

        # Metrics
        accuracy = accuracy_score(y_test, y_pred)
        report = classification_report(y_test, y_pred, output_dict=True)

        # Cross-validation score
        cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring='accuracy')

        results[name] = {
            'model': model,
            'accuracy': accuracy,
            'cv_mean': cv_scores.mean(),
            'cv_std': cv_scores.std(),
            'classification_report': report,
            'predictions': y_pred,
            'probabilities': y_pred_proba
        }

        print(f"Accuracy: {accuracy:.3f}")
        print(f"CV Mean: {cv_scores.mean():.3f} (+/- {cv_scores.std() * 2:.3f})")
        print(f"Macro F1: {report['macro avg']['f1-score']:.3f}")
    return results

def hyperparameter_tuning(X_train, y_train) -> RandomForestClassifier:
    """
    Perform hyperparameter tuning for Random Forest
    """
    print("\nPerforming hyperparameter tuning for Random Forest...")

    param_grid = {
        'n_estimators': [100, 200, 300],
        'max_depth': [10, 20, None],
        'min_samples_split': [2, 5, 10],
        'min_samples_leaf': [1, 2, 4],
        'max_features': ['sqrt', 'log2']
    }

    rf = RandomForestClassifier(random_state=42)
    grid_search = GridSearchCV(
        rf, param_grid, cv=3, scoring='accuracy', n_jobs=-1, verbose=1
    )

    grid_search.fit(X_train, y_train)

    print(f"Best parameters: {grid_search.best_params_}")
    print(f"Best CV score: {grid_search.best_score_:.3f}")
    return grid_search.best_estimator_

def plot_confusion_matrix(y_true, y_pred, classes, title):
    """
    Plot confusion matrix
    """
    cm = confusion_matrix(y_true, y_pred, labels=classes)
    plt.figure(figsize=(12, 10))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                xticklabels=classes, yticklabels=classes)
    plt.title(title)
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.xticks(rotation=45, ha='right')
    plt.yticks(rotation=45)
    plt.tight_layout()
    plt.savefig(f'{title.lower().replace(" ", "_")}_confusion_matrix.png', dpi=300, bbox_inches='tight')
    plt.close()

def train_improved_model():
    """
    Train an improved ML model with comprehensive evaluation
    """
    print("🚀 Starting improved ML model training...")

    # Create comprehensive dataset
    print("\n📊 Creating comprehensive synthetic dataset...")
    data, labels, symptoms = create_comprehensive_dataset(num_samples_per_disease=1000)

    # Convert to DataFrame
    df = pd.DataFrame({'symptoms': data, 'disease': labels})
    print(f"Dataset created with {len(df)} samples")
    print(f"Class distribution:\n{df['disease'].value_counts()}")

    # Multi-label binarization
    mlb = MultiLabelBinarizer()
    X = mlb.fit_transform(df['symptoms'])
    y = df['disease']

    print(f"Feature matrix shape: {X.shape}")
    print(f"Number of unique symptoms: {len(mlb.classes_)}")

    # Split data with stratification
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print(f"Training set: {X_train.shape[0]} samples")
    print(f"Test set: {X_test.shape[0]} samples")

    # Define models to compare
    models = {
        'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42),
        'SVM': Pipeline([
            ('scaler', StandardScaler()),
            ('svm', SVC(kernel='rbf', probability=True, random_state=42))
        ]),
        'Neural Network': MLPClassifier(
            hidden_layer_sizes=(100, 50),
            max_iter=500,
            random_state=42
        )
    }

    # Evaluate all models
    print("\n🔍 Evaluating models...")
    results = evaluate_models(X_train, X_test, y_train, y_test, models)

    # Find best model
    best_model_name = max(results.keys(), key=lambda x: results[x]['accuracy'])
    best_model = results[best_model_name]['model']

    print(f"\n🏆 Best model: {best_model_name} with {results[best_model_name]['accuracy']:.3f} accuracy")

    # Hyperparameter tuning for best model (if Random Forest)
    if best_model_name == 'Random Forest':
        print("\n⚙️ Performing hyperparameter tuning...")
        tuned_model = hyperparameter_tuning(X_train, y_train)

        # Evaluate tuned model
        tuned_pred = tuned_model.predict(X_test)
        tuned_accuracy = accuracy_score(y_test, tuned_pred)

        if tuned_accuracy > results[best_model_name]['accuracy']:
            best_model = tuned_model
            print(f"✅ Tuned model is better: {tuned_accuracy:.3f} accuracy")
        else:
            print(f"ℹ️ Original model is better: {results[best_model_name]['accuracy']:.3f} accuracy")
    # Plot confusion matrix for best model
    print("\n📈 Generating confusion matrix...")
    y_pred_best = best_model.predict(X_test)
    plot_confusion_matrix(y_test, y_pred_best, best_model.classes_,
                         f'Best Model ({best_model_name}) Confusion Matrix')

    # Feature importance (for Random Forest)
    if hasattr(best_model, 'feature_importances_'):
        feature_importance = pd.DataFrame({
            'symptom': mlb.classes_,
            'importance': best_model.feature_importances_
        }).sort_values('importance', ascending=False)

        print("\n🔥 Top 10 most important symptoms:")
        print(feature_importance.head(10))

        # Plot feature importance
        plt.figure(figsize=(12, 8))
        top_features = feature_importance.head(15)
        sns.barplot(x='importance', y='symptom', data=top_features)
        plt.title('Top 15 Most Important Symptoms')
        plt.xlabel('Feature Importance')
        plt.ylabel('Symptom')
        plt.tight_layout()
        plt.savefig('feature_importance.png', dpi=300, bbox_inches='tight')
        plt.close()

    # Save the best model and encoders
    print("\n💾 Saving improved model and encoders...")
    joblib.dump(best_model, 'disease_predictor_model_improved.pkl')
    joblib.dump(mlb, 'symptom_encoder_improved.pkl')

    # Save symptoms list
    with open('symptoms_list_improved.json', 'w') as f:
        json.dump(list(symptoms), f)

    # Save model metadata
    metadata = {
        'model_name': best_model_name,
        'accuracy': results[best_model_name]['accuracy'],
        'cv_mean': results[best_model_name]['cv_mean'],
        'cv_std': results[best_model_name]['cv_std'],
        'num_features': X.shape[1],
        'num_classes': len(best_model.classes_),
        'classes': list(best_model.classes_),
        'training_samples': len(X_train),
        'test_samples': len(X_test)
    }

    with open('model_metadata.json', 'w') as f:
        json.dump(metadata, f, indent=2)

    print("✅ Improved model training completed!")
    print(f"📊 Final model accuracy: {results[best_model_name]['accuracy']:.3f}")
    print(f"📁 Model saved as: disease_predictor_model_improved.pkl")

    return best_model, mlb, symptoms

if __name__ == "__main__":
    train_improved_model()