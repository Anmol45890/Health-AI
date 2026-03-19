"use client"

import { useState, useRef, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { EmergencyButton } from "@/components/emergency-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Bot,
  Send,
  User,
  Sparkles,
  Loader2,
  Heart,
  Stethoscope,
  Pill,
  Apple,
  AlertCircle,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Activity
} from "lucide-react"
import { cn } from "@/lib/utils"

const suggestedQuestions = [
  { icon: Stethoscope, text: "What could cause frequent headaches?" },
  { icon: Pill, text: "How can I improve my sleep quality?" },
  { icon: Heart, text: "What are signs of high blood pressure?" },
  { icon: Apple, text: "What foods boost immune system?" },
]

export default function ChatPage() {
  const [input, setInput] = useState("")
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'hi' | 'hinglish'>('en')
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([
    {
      role: 'assistant',
      content: 'Hello! I\'m HealthAI, your medical assistant. I can help answer your health questions, provide general wellness advice, and guide you on when to seek professional medical care. How can I help you today?'
    }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Voice states
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [voiceAnalysis, setVoiceAnalysis] = useState<{
    pitch?: number;
    volume?: number;
    stress?: 'low' | 'medium' | 'high';
    confidence?: number;
  } | null>(null)
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])

  // Voice refs
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Initialize voice recognition and synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Speech Recognition with multi-language support
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = false
        recognitionRef.current.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-US'
        recognitionRef.current.maxAlternatives = 3

        recognitionRef.current.onstart = () => {
          setIsListening(true)
          console.log('Voice recognition started')
        }

        recognitionRef.current.onresult = (event) => {
          const results = Array.from(event.results[0])
          const transcript = results[0].transcript
          const confidence = results[0].confidence

          console.log('Voice transcript:', transcript, 'Confidence:', confidence)

          // Auto-detect language and adjust
          if (transcript.match(/[\u0900-\u097F]/) || transcript.toLowerCase().includes('hai') || transcript.toLowerCase().includes('hai')) {
            setCurrentLanguage('hinglish')
          }

          setInput(transcript)
          setVoiceAnalysis(prev => ({ ...prev, confidence }))
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
          console.log('Voice recognition ended')
        }

        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event?.error || event)
          setIsListening(false)

          // Fallback messages
          if (event?.error === 'not-allowed') {
            alert('Microphone permission is required for voice input. Please allow microphone access and try again.')
          } else if (event?.error === 'no-speech') {
            console.log('No speech detected, try again')
          }
        }
      }

      // Speech Synthesis with voice loading
      synthRef.current = window.speechSynthesis

      const loadVoices = () => {
        const voices = synthRef.current!.getVoices()
        setAvailableVoices(voices)
        console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`))
      }

      loadVoices()
      if (synthRef.current.onvoiceschanged !== undefined) {
        synthRef.current.onvoiceschanged = loadVoices
      }

      // Audio Context for voice analysis
      try {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      } catch (e) {
        console.warn('Web Audio API not supported')
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (synthRef.current) {
        synthRef.current.cancel()
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [currentLanguage])

  // Update initial message when language changes
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === 'assistant') {
      const newWelcomeMessage = currentLanguage === 'hi' 
        ? 'नमस्ते! मैं HealthAI हूँ, आपका स्वास्थ्य सहायक। आप मुझसे लक्षणों, स्वास्थ्य सुझावों या सामान्य स्वास्थ्य प्रश्न पूछ सकते हैं।'
        : currentLanguage === 'hinglish'
        ? 'Hello! Main HealthAI hoon, aapka AI health assistant. Aap mujhse symptoms, wellness tips ya health questions pooch sakte hain.'
        : 'Hello! I\'m HealthAI, your medical assistant. I can help answer your health questions, provide general wellness advice, and guide you on when to seek professional medical care. How can I help you today?'
      
      setMessages([{
        role: 'assistant',
        content: newWelcomeMessage
      }])
    }
  }, [currentLanguage])

  // Voice analysis function
  const analyzeVoice = async (audioBlob: Blob) => {
    try {
      const arrayBuffer = await audioBlob.arrayBuffer()
      const audioBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer)
      const channelData = audioBuffer.getChannelData(0)

      // Basic voice analysis
      let sum = 0
      let maxAmplitude = 0
      for (let i = 0; i < channelData.length; i++) {
        const amplitude = Math.abs(channelData[i])
        sum += amplitude * amplitude
        if (amplitude > maxAmplitude) maxAmplitude = amplitude
      }

      const rms = Math.sqrt(sum / channelData.length)
      const volume = Math.round(rms * 100)

      // Simple stress detection based on volume and frequency
      let stress: 'low' | 'medium' | 'high' = 'low'
      if (volume > 70) stress = 'high'
      else if (volume > 40) stress = 'medium'

      setVoiceAnalysis({
        volume,
        stress,
        confidence: 0.8 // Placeholder confidence
      })

      return { volume, stress }
    } catch (error) {
      console.error('Voice analysis error:', error)
      return null
    }
  }

  // Start voice input
  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start()
      } catch (error) {
        console.error('Error starting voice recognition:', error)
      }
    }
  }

  // Stop voice input
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }

  // Speak text with multi-language support

  const speak = (text: string) => {
  if (typeof window === "undefined") return
  if (!window.speechSynthesis || !voiceEnabled) return

  const synth = window.speechSynthesis

  // Stop any ongoing speech safely
  if (synth.speaking || synth.pending) {
    synth.cancel()
  }

  const utterance = new SpeechSynthesisUtterance(text)

  utterance.onstart = () => setIsSpeaking(true)

  utterance.onend = () => setIsSpeaking(false)

  utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
    console.error("Speech error:", e?.error || e)
    setIsSpeaking(false)
  }

  // ✅ IMPORTANT: delay prevents "interrupted" error
  setTimeout(() => {
    synth.speak(utterance)
  }, 120)
}
 

  // Language switching functions
  const switchToEnglish = () => {
    setCurrentLanguage('en')
    if (recognitionRef.current) {
      recognitionRef.current.lang = 'en-US'
    }
  }

  const switchToHindi = () => {
    setCurrentLanguage('hi')
    if (recognitionRef.current) {
      recognitionRef.current.lang = 'hi-IN'
    }
  }

  const switchToHinglish = () => {
    setCurrentLanguage('hinglish')
    if (recognitionRef.current) {
      recognitionRef.current.lang = 'en-US' // Hinglish uses English recognition
    }
  }

  // Toggle voice output
  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled)
    if (isSpeaking) {
      synthRef.current?.cancel()
      setIsSpeaking(false)
    }
  }

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage = { role: 'user' as const, content: input }
    setMessages(prev => [...prev, userMessage])
    const currentInput = input
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          voiceAnalysis: voiceAnalysis,
          language: currentLanguage
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      const assistantMessage = { role: 'assistant' as const, content: data.response }
      setMessages(prev => [...prev, assistantMessage])

      // Auto-speak the response if voice is enabled
      if (voiceEnabled && data.response) {
        setTimeout(() => speak(data.response), 500) // Small delay for better UX
      }

    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = {
        role: 'assistant' as const,
        content: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment, or consider consulting a healthcare professional for urgent concerns.'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleSuggestedQuestion = (question: string) => {
    setInput(question)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage()
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navigation />
      
      <main className="flex flex-1 flex-col pt-16">
        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI Health Assistant</span>
            </div>
            <h1 className="mb-2 text-2xl font-bold tracking-tight">
              {currentLanguage === 'hi' 
                ? 'स्वास्थ्य चैटबॉट' 
                : currentLanguage === 'hinglish'
                ? 'Health Chatbot'
                : 'Health Chatbot'
              }
            </h1>
            <p className="text-sm text-muted-foreground">
              {currentLanguage === 'hi' 
                ? 'स्वास्थ्य, लक्षणों या कल्याण के बारे में कुछ भी पूछें'
                : currentLanguage === 'hinglish'
                ? 'Health, symptoms ya wellness ke baare mein kuch bhi poocho'
                : 'Ask me anything about health, symptoms, or wellness'
              }
            </p>
          </div>

          {/* Chat Area */}
          <Card className="flex flex-1 flex-col overflow-hidden">
            <ScrollArea ref={scrollRef} className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                      <Bot className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">
                      {currentLanguage === 'hi' 
                        ? 'नमस्ते! मैं HealthAI हूँ'
                        : currentLanguage === 'hinglish'
                        ? 'Hello! Main HealthAI hoon'
                        : 'Hello! I\'m HealthAI'
                      }
                    </h3>
                    <p className="mb-8 max-w-sm text-center text-sm text-muted-foreground">
                      {currentLanguage === 'hi' 
                        ? 'आपका AI स्वास्थ्य सहायक। लक्षणों, कल्याण सुझावों या सामान्य स्वास्थ्य प्रश्न पूछें।'
                        : currentLanguage === 'hinglish'
                        ? 'Aapka AI health assistant. Symptoms, wellness tips ya health questions poocho.'
                        : 'Your AI health assistant. Ask me about symptoms, wellness tips, or general health questions.'
                      }
                    </p>
                    
                    <div className="grid w-full max-w-md gap-2 sm:grid-cols-2">
                      {suggestedQuestions.map((question, index) => {
                        const Icon = question.icon
                        return (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(question.text)}
                            className="flex items-center gap-2 rounded-lg border bg-card p-3 text-left text-sm transition-colors hover:bg-muted"
                          >
                            <Icon className="h-4 w-4 shrink-0 text-primary" />
                            <span className="line-clamp-2">{question.text}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex gap-3",
                        message.role === "user" ? "flex-row-reverse" : ""
                      )}
                    >
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className={cn(
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-accent text-accent-foreground"
                        )}>
                          {message.role === "user" ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Bot className="h-4 w-4" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-4 py-2.5",
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  ))
                )}

                {isLoading && messages[messages.length - 1]?.role === "user" && (
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-accent text-accent-foreground">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-2.5">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <CardContent className="border-t p-4">
              {/* Voice Analysis Display */}
              {voiceAnalysis && (
                <div className="mb-3 flex items-center gap-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 p-2">
                  <Activity className="h-4 w-4 text-blue-600" />
                  <div className="flex-1 text-xs">
                    <span className="font-medium">Voice Analysis: </span>
                    <span>Volume: {voiceAnalysis.volume}% | </span>
                    <span>Stress: {voiceAnalysis.stress} | </span>
                    <span>Confidence: {Math.round((voiceAnalysis.confidence || 0) * 100)}%</span>
                  </div>
                </div>
              )}

              {/* Voice Controls */}
              <div className="mb-3 flex items-center gap-2">
                <Button
                  type="button"
                  variant={isListening ? "destructive" : "outline"}
                  size="sm"
                  onClick={isListening ? stopListening : startListening}
                  className={cn(
                    "flex items-center gap-2",
                    isListening && "animate-pulse"
                  )}
                >
                  {isListening ? (
                    <>
                      <MicOff className="h-4 w-4" />
                      {currentLanguage === 'hi' 
                        ? 'सुन रहा हूँ...'
                        : currentLanguage === 'hinglish'
                        ? 'Sun raha hoon...'
                        : 'Listening...'
                      }
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4" />
                      {currentLanguage === 'hi' 
                        ? 'आवाज़ इनपुट'
                        : currentLanguage === 'hinglish'
                        ? 'Voice Input'
                        : 'Voice Input'
                      }
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant={voiceEnabled ? "default" : "outline"}
                  size="sm"
                  onClick={toggleVoice}
                  className="flex items-center gap-2"
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="h-4 w-4 animate-pulse" />
                      {currentLanguage === 'hi' 
                        ? 'बोल रहा हूँ...'
                        : currentLanguage === 'hinglish'
                        ? 'Bol raha hoon...'
                        : 'Speaking...'
                      }
                    </>
                  ) : voiceEnabled ? (
                    <>
                      <Volume2 className="h-4 w-4" />
                      {currentLanguage === 'hi' 
                        ? 'आवाज़ चालू'
                        : currentLanguage === 'hinglish'
                        ? 'Voice On'
                        : 'Voice On'
                      }
                    </>
                  ) : (
                    <>
                      <VolumeX className="h-4 w-4" />
                      {currentLanguage === 'hi' 
                        ? 'आवाज़ बंद'
                        : currentLanguage === 'hinglish'
                        ? 'Voice Off'
                        : 'Voice Off'
                      }
                    </>
                  )}
                </Button>
              </div>

              {/* Language Controls */}
              <div className="mb-3 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {currentLanguage === 'hi' 
                    ? 'भाषा:'
                    : currentLanguage === 'hinglish'
                    ? 'Language:'
                    : 'Language:'
                  }
                </span>
                <Button
                  type="button"
                  variant={currentLanguage === 'en' ? "default" : "outline"}
                  size="sm"
                  onClick={switchToEnglish}
                  className="text-xs"
                >
                  English
                </Button>
                <Button
                  type="button"
                  variant={currentLanguage === 'hi' ? "default" : "outline"}
                  size="sm"
                  onClick={switchToHindi}
                  className="text-xs"
                >
                  हिंदी
                </Button>
                <Button
                  type="button"
                  variant={currentLanguage === 'hinglish' ? "default" : "outline"}
                  size="sm"
                  onClick={switchToHinglish}
                  className="text-xs"
                >
                  Hinglish
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    currentLanguage === 'hi' 
                      ? 'अपना स्वास्थ्य प्रश्न यहाँ लिखें या आवाज़ का उपयोग करें...' 
                      : currentLanguage === 'hinglish'
                      ? 'Apna health question yahan likhein ya voice ka use karein...'
                      : 'Type your health question or use voice input...'
                  }
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button type="submit" disabled={!input.trim() || isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
              
              {/* Disclaimer */}
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-muted/50 p-2">
                <AlertCircle className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  {currentLanguage === 'hi' 
                    ? 'यह AI केवल सामान्य स्वास्थ्य जानकारी प्रदान करता है। चिकित्सा सलाह के लिए हमेशा स्वास्थ्य पेशेवर से परामर्श करें।'
                    : currentLanguage === 'hinglish'
                    ? 'Ye AI sirf general health information deta hai. Medical advice ke liye hamesha healthcare professional se consult karein.'
                    : 'This AI provides general health information only. Always consult a healthcare professional for medical advice.'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <EmergencyButton />
    </div>
  )
}
