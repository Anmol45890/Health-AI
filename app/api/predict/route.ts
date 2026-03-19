import { NextRequest, NextResponse } from 'next/server'

const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8000'

interface PredictionResult {
  disease: string
  confidence: number
}

interface DiseaseInfo {
  disease: string
  confidence: number
  description: string
  severity: "low" | "medium" | "high"
  recommendations: string[]
}

const diseaseDescriptions: Record<string, { description: string; severity: "low" | "medium" | "high"; recommendations: string[] }> = {
  'Flu': {
    description: "A contagious respiratory illness caused by influenza viruses that infect the nose, throat, and lungs.",
    severity: "medium",
    recommendations: ["Rest and stay hydrated", "Take over-the-counter fever reducers", "Consider antiviral medications if caught early", "Consult a doctor if symptoms worsen"]
  },
  'Common_Cold': {
    description: "A viral infection of your nose and throat (upper respiratory tract).",
    severity: "low",
    recommendations: ["Get plenty of rest", "Drink warm fluids", "Use saline nasal spray", "Take over-the-counter cold medications"]
  },
  'Migraine': {
    description: "A headache that can cause severe throbbing pain or a pulsing sensation, usually on one side of the head.",
    severity: "medium",
    recommendations: ["Rest in a dark, quiet room", "Apply cold or warm compresses", "Stay hydrated", "Consider preventive medications if frequent"]
  },
  'Gastroenteritis': {
    description: "An intestinal infection marked by diarrhea, cramps, nausea, vomiting, and fever.",
    severity: "medium",
    recommendations: ["Stay hydrated with clear fluids", "Eat bland foods when able", "Rest your stomach", "Seek medical care if symptoms persist"]
  },
  'COVID-19': {
    description: "A respiratory illness caused by the SARS-CoV-2 virus. Testing is recommended to confirm.",
    severity: "high",
    recommendations: ["Get tested for COVID-19", "Isolate until results are known", "Monitor oxygen levels", "Seek emergency care if breathing difficulties worsen"]
  },
  'Pneumonia': {
    description: "An infection that inflames air sacs in one or both lungs, which may fill with fluid.",
    severity: "high",
    recommendations: ["Seek immediate medical attention", "Rest and stay hydrated", "Take prescribed antibiotics", "Monitor breathing and oxygen levels"]
  },
  'Anxiety': {
    description: "A sudden episode of intense fear that triggers severe physical reactions when there is no real danger.",
    severity: "low",
    recommendations: ["Practice deep breathing exercises", "Ground yourself using the 5-4-3-2-1 technique", "Consider speaking with a mental health professional", "Regular exercise can help reduce anxiety"]
  },
  'Food_Poisoning': {
    description: "Illness caused by eating contaminated food, leading to digestive symptoms.",
    severity: "medium",
    recommendations: ["Stay hydrated with clear fluids", "Rest your stomach", "Avoid solid foods initially", "Seek medical care if symptoms are severe"]
  },
  'Allergic_Reaction': {
    description: "An immune system reaction to a substance that is normally harmless.",
    severity: "medium",
    recommendations: ["Avoid the allergen", "Take antihistamines if appropriate", "Seek immediate medical care for severe reactions", "Consider carrying an epinephrine auto-injector"]
  },
  'Bronchitis': {
    description: "Inflammation of the lining of bronchial tubes, which carry air to and from lungs.",
    severity: "medium",
    recommendations: ["Rest and stay hydrated", "Use a humidifier", "Take over-the-counter cough medications", "See a doctor if symptoms persist"]
  },
  'Other': {
    description: "Symptoms don't strongly match common conditions. Consider consulting a healthcare professional for proper diagnosis.",
    severity: "low",
    recommendations: ["Monitor your symptoms", "Keep a symptom diary", "Consult a healthcare professional", "Consider lifestyle factors that may contribute"]
  }
}

export async function POST(request: NextRequest) {
  try {
    const { symptoms } = await request.json()

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return NextResponse.json(
        { error: 'Symptoms array is required and cannot be empty' },
        { status: 400 }
      )
    }

    // Convert symptoms to lowercase for consistency
    const normalizedSymptoms = symptoms.map((s: string) => s.toLowerCase().replace(/\s+/g, '_'))

    // Call the ML API
    const response = await fetch(`${ML_API_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ symptoms: normalizedSymptoms }),
    })

    if (!response.ok) {
      // Fallback to basic logic if ML API is unavailable
      console.warn('ML API unavailable, using fallback logic')
      return NextResponse.json(
        { error: 'Prediction service temporarily unavailable' },
        { status: 503 }
      )
    }

    const mlResult = await response.json()

    // Transform ML results to include descriptions and recommendations
    const enhancedPredictions: DiseaseInfo[] = mlResult.predictions
      .slice(0, 3) // Top 3 predictions
      .map((pred: PredictionResult) => {
        const diseaseKey = pred.disease.replace(/\s+/g, '_')
        const info = diseaseDescriptions[diseaseKey] || diseaseDescriptions['Other']

        return {
          disease: pred.disease.replace(/_/g, ' '),
          confidence: Math.round(pred.confidence * 100),
          description: info.description,
          severity: info.severity,
          recommendations: info.recommendations
        }
      })

    return NextResponse.json({
      predictions: enhancedPredictions,
      success: true
    })

  } catch (error) {
    console.error('Prediction API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}