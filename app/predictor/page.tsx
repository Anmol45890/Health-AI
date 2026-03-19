"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { EmergencyButton } from "@/components/emergency-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { 
  AlertCircle, 
  ArrowRight, 
  CheckCircle, 
  Loader2, 
  Plus, 
  Stethoscope, 
  Trash2, 
  AlertTriangle,
  Activity,
  Sparkles,
  X,
  Mic,
  MicOff,
  Volume2,
  VolumeX
} from "lucide-react"

const symptomSuggestions = [
  "Headache", "Fever", "Cough", "Fatigue", "Nausea",
  "Dizziness", "Chest Pain", "Shortness of Breath", "Joint Pain",
  "Sore Throat", "Runny Nose", "Body Aches", "Chills", "Loss of Appetite",
  "Abdominal Pain", "Vomiting", "Diarrhea", "Skin Rash", "Sweating"
]

interface PredictionResult {
  disease: string
  confidence: number
  description: string
  severity: "low" | "medium" | "high"
  recommendations: string[]
}

// Simulated disease prediction based on symptoms
function predictDiseases(symptoms: string[]): PredictionResult[] {
  const symptomLower = symptoms.map(s => s.toLowerCase())
  const results: PredictionResult[] = []

  // Flu detection
  if (symptomLower.some(s => ["fever", "cough", "body aches", "fatigue", "chills"].includes(s))) {
    const matchCount = symptomLower.filter(s => ["fever", "cough", "body aches", "fatigue", "chills", "headache"].includes(s)).length
    results.push({
      disease: "Influenza (Flu)",
      confidence: Math.min(45 + matchCount * 12, 95),
      description: "A contagious respiratory illness caused by influenza viruses that infect the nose, throat, and lungs.",
      severity: "medium",
      recommendations: ["Rest and stay hydrated", "Take over-the-counter fever reducers", "Consider antiviral medications if caught early", "Consult a doctor if symptoms worsen"]
    })
  }

  // Common Cold
  if (symptomLower.some(s => ["runny nose", "sore throat", "cough", "sneezing"].includes(s))) {
    const matchCount = symptomLower.filter(s => ["runny nose", "sore throat", "cough", "sneezing", "congestion"].includes(s)).length
    results.push({
      disease: "Common Cold",
      confidence: Math.min(40 + matchCount * 10, 85),
      description: "A viral infection of your nose and throat (upper respiratory tract).",
      severity: "low",
      recommendations: ["Get plenty of rest", "Drink warm fluids", "Use saline nasal spray", "Take over-the-counter cold medications"]
    })
  }

  // Migraine
  if (symptomLower.some(s => ["headache", "nausea", "dizziness", "sensitivity to light"].includes(s))) {
    const matchCount = symptomLower.filter(s => ["headache", "nausea", "dizziness", "vomiting"].includes(s)).length
    results.push({
      disease: "Migraine",
      confidence: Math.min(35 + matchCount * 15, 88),
      description: "A headache that can cause severe throbbing pain or a pulsing sensation, usually on one side of the head.",
      severity: "medium",
      recommendations: ["Rest in a dark, quiet room", "Apply cold or warm compresses", "Stay hydrated", "Consider preventive medications if frequent"]
    })
  }

  // Gastroenteritis
  if (symptomLower.some(s => ["nausea", "vomiting", "diarrhea", "abdominal pain"].includes(s))) {
    const matchCount = symptomLower.filter(s => ["nausea", "vomiting", "diarrhea", "abdominal pain", "fever"].includes(s)).length
    results.push({
      disease: "Gastroenteritis",
      confidence: Math.min(38 + matchCount * 13, 90),
      description: "An intestinal infection marked by diarrhea, cramps, nausea, vomiting, and fever.",
      severity: "medium",
      recommendations: ["Stay hydrated with clear fluids", "Eat bland foods when able", "Rest your stomach", "Seek medical care if symptoms persist"]
    })
  }

  // COVID-19 consideration
  if (symptomLower.some(s => ["fever", "cough", "fatigue", "loss of taste", "shortness of breath"].includes(s))) {
    const matchCount = symptomLower.filter(s => ["fever", "cough", "fatigue", "shortness of breath", "body aches"].includes(s)).length
    if (matchCount >= 2) {
      results.push({
        disease: "COVID-19 (Consider Testing)",
        confidence: Math.min(30 + matchCount * 12, 75),
        description: "A respiratory illness caused by the SARS-CoV-2 virus. Testing is recommended to confirm.",
        severity: "high",
        recommendations: ["Get tested for COVID-19", "Isolate until results are known", "Monitor oxygen levels", "Seek emergency care if breathing difficulties worsen"]
      })
    }
  }

  // Anxiety/Stress
  if (symptomLower.some(s => ["dizziness", "chest pain", "shortness of breath", "sweating"].includes(s))) {
    const matchCount = symptomLower.filter(s => ["dizziness", "chest pain", "shortness of breath", "sweating", "rapid heartbeat"].includes(s)).length
    results.push({
      disease: "Anxiety/Panic Attack",
      confidence: Math.min(25 + matchCount * 10, 70),
      description: "A sudden episode of intense fear that triggers severe physical reactions when there is no real danger.",
      severity: "low",
      recommendations: ["Practice deep breathing exercises", "Ground yourself using the 5-4-3-2-1 technique", "Consider speaking with a mental health professional", "Regular exercise can help reduce anxiety"]
    })
  }

  // Sort by confidence
  results.sort((a, b) => b.confidence - a.confidence)
  
  // Return top 3
  return results.slice(0, 3)
}

export default function PredictorPage() {
  const searchParams = useSearchParams()
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [inputValue, setInputValue] = useState("")
  const [predictions, setPredictions] = useState<PredictionResult[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Voice states
  const [isListening, setIsListening] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [voiceAnalysis, setVoiceAnalysis] = useState<{
    pitch?: number;
    volume?: number;
    stress?: 'low' | 'medium' | 'high';
    confidence?: number;
  } | null>(null)

  // Voice refs
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  useEffect(() => {
    const condition = searchParams.get("condition")
    if (condition) {
      // Pre-populate with common symptoms for the condition
      const conditionSymptoms: Record<string, string[]> = {
        "Migraine": ["Headache", "Nausea", "Dizziness"],
        "Sinusitis": ["Headache", "Runny Nose", "Fatigue"],
        "Pneumonia": ["Cough", "Fever", "Shortness of Breath", "Chest Pain"],
        "Bronchitis": ["Cough", "Fatigue", "Chest Pain"],
        "Heart Disease": ["Chest Pain", "Shortness of Breath", "Fatigue"],
        "Asthma": ["Shortness of Breath", "Cough", "Chest Pain"],
        "Gastritis": ["Abdominal Pain", "Nausea", "Loss of Appetite"],
        "UTI": ["Abdominal Pain", "Fever"],
      }
      const preloadSymptoms = conditionSymptoms[condition] || []
      setSymptoms(preloadSymptoms)
    }
  }, [searchParams])

  const addSymptom = (symptom: string) => {
    const trimmed = symptom.trim()
    if (trimmed && !symptoms.includes(trimmed)) {
      setSymptoms([...symptoms, trimmed])
      setInputValue("")
      setPredictions(null)
    }
  }

  const removeSymptom = (symptom: string) => {
    setSymptoms(symptoms.filter(s => s !== symptom))
    setPredictions(null)
  }

  // Voice initialization
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Speech Recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = false
        recognitionRef.current.lang = 'en-US'

        recognitionRef.current.onstart = () => setIsListening(true)
        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript
          setInputValue(transcript)
          // Auto-add the symptom if it matches our suggestions
          const matchedSymptom = symptomSuggestions.find(s =>
            s.toLowerCase().includes(transcript.toLowerCase()) ||
            transcript.toLowerCase().includes(s.toLowerCase())
          )
          if (matchedSymptom && !symptoms.includes(matchedSymptom)) {
            setSymptoms(prev => [...prev, matchedSymptom])
            setPredictions(null)
          }
        }
        recognitionRef.current.onend = () => setIsListening(false)
        recognitionRef.current.onerror = () => setIsListening(false)
      }

      // Speech Synthesis
      synthRef.current = window.speechSynthesis
    }
  }, [symptoms])

  // Speak prediction results
  const speakResults = (results: PredictionResult[]) => {
    if (synthRef.current && voiceEnabled && results.length > 0) {
      const topResult = results[0]
      const speechText = `Based on your symptoms, you may have ${topResult.disease} with ${Math.round(topResult.confidence)}% confidence. ${topResult.description} I recommend: ${topResult.recommendations.slice(0, 2).join(', ')}.`
      const utterance = new SpeechSynthesisUtterance(speechText)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 0.8
      synthRef.current.speak(utterance)
    }
  }

  const handlePredict = async () => {
    if (symptoms.length === 0) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symptoms }),
      })

      if (!response.ok) {
        throw new Error('Prediction failed')
      }

      const data = await response.json()
      setPredictions(data.predictions)
      // Speak the results
      speakResults(data.predictions)
    } catch (error) {
      console.error('Prediction error:', error)
      // Fallback to old logic if API fails
      const results = predictDiseases(symptoms)
      setPredictions(results)
      // Speak the fallback results
      speakResults(results)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredSuggestions = symptomSuggestions.filter(
    s => s.toLowerCase().includes(inputValue.toLowerCase()) && !symptoms.includes(s)
  )

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low": return "bg-green-500/10 text-green-600 border-green-500/20"
      case "medium": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
      case "high": return "bg-red-500/10 text-red-600 border-red-500/20"
      default: return ""
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="mx-auto max-w-4xl px-4 pb-20 pt-24 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Analysis</span>
          </div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight">AI Disease Predictor</h1>
          <p className="text-muted-foreground">
            Enter your symptoms below and let our AI predict possible conditions
          </p>
        </div>

        {/* Symptom Input Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Stethoscope className="h-5 w-5 text-primary" />
              Enter Your Symptoms
            </CardTitle>
            <CardDescription>
              Add all symptoms you are experiencing for more accurate predictions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Input with suggestions */}
            <div className="relative">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="Type a symptom (e.g., headache, fever)..."
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value)
                      setShowSuggestions(true)
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        addSymptom(inputValue)
                        setShowSuggestions(false)
                      }
                    }}
                  />
                  {showSuggestions && inputValue && filteredSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-auto rounded-lg border bg-popover p-1 shadow-lg">
                      {filteredSuggestions.slice(0, 6).map((suggestion) => (
                        <button
                          key={suggestion}
                          className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
                          onClick={() => {
                            addSymptom(suggestion)
                            setShowSuggestions(false)
                          }}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <Button onClick={() => addSymptom(inputValue)} disabled={!inputValue.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Quick add suggestions */}
            <div>
              <p className="mb-2 text-sm text-muted-foreground">Quick add:</p>
              <div className="flex flex-wrap gap-2">
                {symptomSuggestions.slice(0, 10).filter(s => !symptoms.includes(s)).map((symptom) => (
                  <button
                    key={symptom}
                    onClick={() => addSymptom(symptom)}
                    className="rounded-full border px-3 py-1 text-sm transition-colors hover:border-primary hover:bg-primary/5"
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Controls */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={isListening ? "destructive" : "outline"}
                size="sm"
                onClick={() => {
                  if (recognitionRef.current) {
                    if (isListening) {
                      recognitionRef.current.stop()
                    } else {
                      recognitionRef.current.start()
                    }
                  }
                }}
                className={isListening ? "animate-pulse" : ""}
              >
                {isListening ? (
                  <>
                    <MicOff className="h-4 w-4 mr-2" />
                    Listening...
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    Voice Input
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant={voiceEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => setVoiceEnabled(!voiceEnabled)}
              >
                {voiceEnabled ? (
                  <>
                    <Volume2 className="h-4 w-4 mr-2" />
                    Voice On
                  </>
                ) : (
                  <>
                    <VolumeX className="h-4 w-4 mr-2" />
                    Voice Off
                  </>
                )}
              </Button>
            </div>

            <Separator />

            {/* Selected symptoms */}
            <div>
              <p className="mb-2 text-sm font-medium">
                Selected Symptoms ({symptoms.length})
              </p>
              {symptoms.length === 0 ? (
                <p className="text-sm text-muted-foreground">No symptoms added yet</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {symptoms.map((symptom) => (
                    <Badge
                      key={symptom}
                      variant="secondary"
                      className="gap-1 py-1.5 pl-3 pr-1.5"
                    >
                      {symptom}
                      <button
                        onClick={() => removeSymptom(symptom)}
                        className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Predict Button */}
            <Button 
              onClick={handlePredict} 
              disabled={symptoms.length === 0 || isLoading}
              className="w-full gap-2"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing Symptoms...
                </>
              ) : (
                <>
                  <Activity className="h-4 w-4" />
                  Predict Diseases
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Predictions Results */}
        {predictions && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Prediction Results</h2>
            
            {predictions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center py-8">
                  <AlertCircle className="mb-2 h-12 w-12 text-muted-foreground" />
                  <p className="text-center text-muted-foreground">
                    No strong disease matches found. Please add more symptoms or consult a healthcare professional.
                  </p>
                </CardContent>
              </Card>
            ) : (
              predictions.map((prediction, index) => (
                <Card 
                  key={prediction.disease}
                  className={index === 0 ? "border-primary/50 shadow-lg shadow-primary/5" : ""}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {index === 0 && (
                            <Badge className="bg-primary">Most Likely</Badge>
                          )}
                          <Badge 
                            variant="outline" 
                            className={getSeverityColor(prediction.severity)}
                          >
                            {prediction.severity.charAt(0).toUpperCase() + prediction.severity.slice(1)} Severity
                          </Badge>
                        </div>
                        <CardTitle className="text-xl">{prediction.disease}</CardTitle>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-primary">{prediction.confidence}%</p>
                        <p className="text-xs text-muted-foreground">Confidence</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Progress value={prediction.confidence} className="h-2" />
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{prediction.description}</p>
                    
                    <div>
                      <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Recommended Actions
                      </h4>
                      <ul className="space-y-1">
                        {prediction.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <ArrowRight className="mt-0.5 h-3 w-3 shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            {/* Disclaimer */}
            <Card className="border-yellow-500/30 bg-yellow-500/5">
              <CardContent className="flex gap-3 py-4">
                <AlertTriangle className="h-5 w-5 shrink-0 text-yellow-600" />
                <div className="text-sm text-yellow-700 dark:text-yellow-400">
                  <p className="font-medium">Medical Disclaimer</p>
                  <p className="mt-1 text-yellow-600 dark:text-yellow-500">
                    This AI prediction is for informational purposes only and should not be considered medical advice. 
                    Always consult a qualified healthcare professional for proper diagnosis and treatment.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <EmergencyButton />
    </div>
  )
}
