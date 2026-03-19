"use client"

import { Navigation } from "@/components/navigation"
import { EmergencyButton } from "@/components/emergency-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Activity,
  ArrowRight,
  Bot,
  Brain,
  CheckCircle,
  Code,
  Database,
  Globe,
  Heart,
  Lock,
  Mic,
  Shield,
  Sparkles,
  Stethoscope,
  Target,
  Users,
  Zap
} from "lucide-react"

const techStack = [
  { name: "Next.js", description: "React framework for production", icon: Globe },
  { name: "React Three Fiber", description: "3D graphics with Three.js", icon: Code },
  { name: "AI SDK", description: "Vercel AI for LLM integration", icon: Brain },
  { name: "Machine Learning", description: "Disease prediction models", icon: Database },
  { name: "Web Speech API", description: "Voice recognition & synthesis", icon: Mic },
  { name: "Tailwind CSS", description: "Modern styling framework", icon: Sparkles },
]

const features = [
  {
    icon: Stethoscope,
    title: "AI Disease Prediction",
    description: "Our machine learning model analyzes symptoms to predict possible diseases with confidence scores based on medical patterns and data."
  },
  {
    icon: Mic,
    title: "Voice Recognition",
    description: "Speak naturally to describe your symptoms. Our system uses Web Speech API for accurate voice-to-text conversion."
  },
  {
    icon: Bot,
    title: "AI Chatbot",
    description: "Powered by advanced language models, our chatbot provides professional health guidance and answers to your questions."
  },
  {
    icon: Brain,
    title: "3D Body Visualization",
    description: "Interactive 3D human body model allows you to explore conditions associated with different body parts."
  },
]

const principles = [
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your health data stays on your device. We don't store personal medical information."
  },
  {
    icon: Target,
    title: "Accuracy Focused",
    description: "Our models are trained on medical data to provide reliable preliminary assessments."
  },
  {
    icon: Heart,
    title: "User Wellbeing",
    description: "We prioritize clear communication and always recommend professional consultation."
  },
  {
    icon: Lock,
    title: "Transparent AI",
    description: "We explain how predictions are made and the confidence levels behind them."
  },
]

const team = [
  { role: "AI/ML Engineering", focus: "Disease prediction models and accuracy" },
  { role: "Frontend Development", focus: "3D visualization and user experience" },
  { role: "Medical Consultation", focus: "Content accuracy and recommendations" },
  { role: "Security & Privacy", focus: "Data protection and compliance" },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="mx-auto max-w-5xl px-4 pb-20 pt-24 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="mb-16 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">About HealthAI</span>
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            AI-Powered Healthcare
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              For Everyone
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground text-pretty">
            HealthAI Predictor combines advanced machine learning with intuitive design 
            to help you understand your symptoms and make informed health decisions.
          </p>
        </div>

        {/* Mission */}
        <Card className="mb-12">
          <CardContent className="p-8">
            <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                <Activity className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="mb-2 text-2xl font-bold">Our Mission</h2>
                <p className="text-muted-foreground">
                  To democratize access to preliminary health insights through AI technology. 
                  We believe everyone deserves quick, reliable information about their symptoms 
                  to make informed decisions about seeking professional medical care.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <section className="mb-16">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-2xl font-bold">How Our AI Works</h2>
            <p className="text-muted-foreground">
              Understanding the technology behind your health predictions
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index}>
                  <CardHeader>
                    <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Tech Stack */}
        <section className="mb-16">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-2xl font-bold">Technology Stack</h2>
            <p className="text-muted-foreground">
              Built with modern, reliable technologies
            </p>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {techStack.map((tech, index) => {
              const Icon = tech.icon
              return (
                <div
                  key={index}
                  className="flex items-center gap-4 rounded-lg border bg-card p-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{tech.name}</p>
                    <p className="text-sm text-muted-foreground">{tech.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Principles */}
        <section className="mb-16">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-2xl font-bold">Our Principles</h2>
            <p className="text-muted-foreground">
              The values that guide our platform
            </p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2">
            {principles.map((principle, index) => {
              const Icon = principle.icon
              return (
                <div key={index} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold">{principle.title}</h3>
                    <p className="text-sm text-muted-foreground">{principle.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Team */}
        <section className="mb-16">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-2xl font-bold">Our Expertise</h2>
            <p className="text-muted-foreground">
              Combining AI technology with medical knowledge
            </p>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member, index) => (
              <Card key={index}>
                <CardContent className="p-4 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <p className="font-medium">{member.role}</p>
                  <p className="text-sm text-muted-foreground">{member.focus}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Disclaimer */}
        <Card className="mb-12 border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="p-6">
            <h3 className="mb-3 flex items-center gap-2 font-semibold text-yellow-700 dark:text-yellow-400">
              <Shield className="h-5 w-5" />
              Important Medical Disclaimer
            </h3>
            <div className="space-y-2 text-sm text-yellow-700 dark:text-yellow-400">
              <p>
                HealthAI Predictor is designed to provide general health information and preliminary 
                symptom analysis. It is NOT a substitute for professional medical advice, diagnosis, or treatment.
              </p>
              <ul className="ml-4 list-disc space-y-1">
                <li>Always consult a qualified healthcare provider for medical concerns</li>
                <li>In case of emergency, call your local emergency services immediately</li>
                <li>Do not delay seeking medical attention based on AI predictions</li>
                <li>Our predictions are probabilistic and may not account for all factors</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-background to-accent/10 p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold">Ready to Get Started?</h2>
          <p className="mb-6 text-muted-foreground">
            Try our AI health prediction tools and take control of your wellness journey.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="gap-2">
              <Link href="/predictor">
                <Stethoscope className="h-4 w-4" />
                Start Prediction
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2">
              <Link href="/chat">
                <Bot className="h-4 w-4" />
                Talk to AI
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <EmergencyButton />
    </div>
  )
}
