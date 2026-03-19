"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Navigation } from "@/components/navigation"
import { EmergencyButton } from "@/components/emergency-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Loader2, 
  Activity,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  RefreshCw
} from "lucide-react"

interface PredictionResult {
  disease: string
  confidence: number
  description: string
  severity: "low" | "medium" | "high"
  recommendations: string[]
}

// Voice waveform visualization component
function VoiceWaveform({ isActive }: { isActive: boolean }) {
  return (
    <div className="flex h-24 items-center justify-center gap-1">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className={`w-1 rounded-full transition-all duration-150 ${
            isActive ? "bg-primary" : "bg-muted"
          }`}
          style={{
            height: isActive 
              ? `${Math.random() * 60 + 20}%` 
              : "20%",
            animationDelay: `${i * 50}ms`,
          }}
        />
      ))}
    </div>
  )
}

// Simulated disease prediction based on symptoms
function predictDiseases(symptoms: string[]): PredictionResult[] {
  const symptomLower = symptoms.map(s => s.toLowerCase())
  const results: PredictionResult[] = []

  if (symptomLower.some(s => s.includes("fever") || s.includes("cough") || s.includes("tired"))) {
    results.push({
      disease: "Influenza (Flu)",
      confidence: 82,
      description: "A contagious respiratory illness caused by influenza viruses.",
      severity: "medium",
      recommendations: ["Rest and stay hydrated", "Take fever reducers", "Consult a doctor if symptoms worsen"]
    })
  }

  if (symptomLower.some(s => s.includes("headache") || s.includes("head"))) {
    results.push({
      disease: "Tension Headache",
      confidence: 75,
      description: "The most common type of headache, often related to stress or muscle tension.",
      severity: "low",
      recommendations: ["Take over-the-counter pain relievers", "Rest in a quiet room", "Apply cold or warm compress"]
    })
  }

  if (symptomLower.some(s => s.includes("stomach") || s.includes("nausea") || s.includes("sick"))) {
    results.push({
      disease: "Gastroenteritis",
      confidence: 68,
      description: "An intestinal infection marked by diarrhea, cramps, nausea, and vomiting.",
      severity: "medium",
      recommendations: ["Stay hydrated", "Eat bland foods", "Rest your stomach"]
    })
  }

  if (results.length === 0) {
    results.push({
      disease: "General Wellness Check",
      confidence: 50,
      description: "Based on your symptoms, a general health check-up is recommended.",
      severity: "low",
      recommendations: ["Monitor your symptoms", "Stay hydrated", "Get adequate rest", "Consult a doctor if symptoms persist"]
    })
  }

  return results.slice(0, 3)
}

export default function VoiceAssistantPage() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [predictions, setPredictions] = useState<PredictionResult[] | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [waveformKey, setWaveformKey] = useState(0)
  
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = "en-US"

        recognitionRef.current.onresult = (event) => {
          let finalTranscript = ""
          let interimTranscript = ""

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
            } else {
              interimTranscript += transcript
            }
          }

          setTranscript(prev => prev + finalTranscript + interimTranscript)
        }

        recognitionRef.current.onerror = (event) => {
          console.error("Speech recognition error:", event.error)
          setError("Speech recognition error. Please try again.")
          setIsListening(false)
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }
      }

      synthRef.current = window.speechSynthesis
    }
  }, [])

  // Animate waveform when listening
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isListening) {
      interval = setInterval(() => {
        setWaveformKey(prev => prev + 1)
      }, 150)
    }
    return () => clearInterval(interval)
  }, [isListening])

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      setTranscript("")
      setError(null)
      setIsListening(true)
      try {
        recognitionRef.current.start()
      } catch (e) {
        console.error("Error starting recognition:", e)
      }
    } else {
      setError("Speech recognition is not supported in your browser.")
    }
  }, [])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }, [])

  const analyzeSymptoms = useCallback(async () => {
    if (!transcript.trim()) return

    setIsAnalyzing(true)
    
    // Extract symptoms from transcript
    const extractedSymptoms = transcript
      .toLowerCase()
      .split(/[,.\n]/)
      .map(s => s.trim())
      .filter(s => s.length > 2)

    setSymptoms(extractedSymptoms)

    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const results = predictDiseases(extractedSymptoms)
    setPredictions(results)
    setIsAnalyzing(false)

    // Speak the results
    speakResults(results)
  }, [transcript])

  const speakResults = useCallback((results: PredictionResult[]) => {
    if (!synthRef.current || results.length === 0) return

    setIsSpeaking(true)
    
    const topResult = results[0]
    const text = `Based on your symptoms, the most likely condition is ${topResult.disease} with a confidence of ${topResult.confidence} percent. ${topResult.description}. I recommend the following: ${topResult.recommendations.join(". ")}. Please remember to consult a healthcare professional for proper diagnosis.`

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.onend = () => setIsSpeaking(false)

    synthRef.current.speak(utterance)
  }, [])

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel()
      setIsSpeaking(false)
    }
  }, [])

  const reset = useCallback(() => {
    setTranscript("")
    setSymptoms([])
    setPredictions(null)
    setError(null)
    stopSpeaking()
  }, [stopSpeaking])

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
            <span className="text-sm font-medium text-primary">Voice-Enabled</span>
          </div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight">Voice Health Assistant</h1>
          <p className="text-muted-foreground">
            Speak your symptoms naturally and receive AI-powered health predictions
          </p>
        </div>

        {/* Voice Input Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mic className="h-5 w-5 text-primary" />
              Voice Input
            </CardTitle>
            <CardDescription>
              Click the microphone and describe your symptoms. Speak clearly and naturally.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Waveform Visualization */}
            <div className="rounded-xl border bg-muted/30 p-6">
              <VoiceWaveform key={waveformKey} isActive={isListening} />
              <p className="mt-2 text-center text-sm text-muted-foreground">
                {isListening ? "Listening... speak now" : "Click the microphone to start"}
              </p>
            </div>

            {/* Microphone Button */}
            <div className="flex justify-center gap-4">
              <Button
                size="lg"
                variant={isListening ? "destructive" : "default"}
                className="h-16 w-16 rounded-full"
                onClick={isListening ? stopListening : startListening}
                disabled={isAnalyzing}
              >
                {isListening ? (
                  <MicOff className="h-6 w-6" />
                ) : (
                  <Mic className="h-6 w-6" />
                )}
              </Button>
              
              {isSpeaking && (
                <Button
                  size="lg"
                  variant="outline"
                  className="h-16 w-16 rounded-full"
                  onClick={stopSpeaking}
                >
                  <VolumeX className="h-6 w-6" />
                </Button>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-center text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Transcript */}
            {transcript && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Symptoms:</label>
                <div className="min-h-20 rounded-lg border bg-muted/30 p-4">
                  <p className="text-foreground">{transcript}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={analyzeSymptoms}
                disabled={!transcript.trim() || isAnalyzing || isListening}
                className="flex-1 gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Activity className="h-4 w-4" />
                    Analyze Symptoms
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={reset} disabled={isListening || isAnalyzing}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Predictions Results */}
        {predictions && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Voice Analysis Results</h2>
              {isSpeaking && (
                <Badge variant="outline" className="gap-1">
                  <Volume2 className="h-3 w-3" />
                  Speaking...
                </Badge>
              )}
            </div>
            
            {predictions.map((prediction, index) => (
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
                  <Progress value={prediction.confidence} className="h-2" />
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
            ))}

            {/* Disclaimer */}
            <Card className="border-yellow-500/30 bg-yellow-500/5">
              <CardContent className="flex gap-3 py-4">
                <AlertTriangle className="h-5 w-5 shrink-0 text-yellow-600" />
                <div className="text-sm text-yellow-700 dark:text-yellow-400">
                  <p className="font-medium">Medical Disclaimer</p>
                  <p className="mt-1 text-yellow-600 dark:text-yellow-500">
                    This voice-based AI prediction is for informational purposes only. 
                    Always consult a healthcare professional for proper diagnosis.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Instructions */}
        {!predictions && !transcript && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How to Use</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">1</span>
                  <span>Click the microphone button to start voice recording</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">2</span>
                  <span>Describe your symptoms naturally, such as "I have a headache and feel tired"</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">3</span>
                  <span>Click stop when finished, then analyze to get AI predictions</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">4</span>
                  <span>Listen to the AI read your results aloud</span>
                </li>
              </ol>
            </CardContent>
          </Card>
        )}
      </main>

      <EmergencyButton />
    </div>
  )
}
