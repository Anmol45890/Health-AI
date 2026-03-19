"use client"

import { Navigation } from "@/components/navigation"
import { EmergencyButton } from "@/components/emergency-button"
import { FloatingChat } from "@/components/floating-chat"
import { BodyModel } from "@/components/body-model"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Link from "next/link"
import { useState } from "react"
import { ArrowRight, Bot, Brain, Mic, Shield, Sparkles, Stethoscope, Activity, Heart, Zap } from "lucide-react"

const features = [
  {
    icon: Stethoscope,
    title: "AI Disease Prediction",
    description: "Enter symptoms and get instant AI-powered disease predictions with confidence scores.",
    href: "/predictor",
    color: "text-blue-500",
  },
  {
    icon: Mic,
    title: "Voice Assistant",
    description: "Speak your symptoms naturally and receive voice-enabled medical guidance.",
    href: "/voice",
    color: "text-green-500",
  },
  {
    icon: Bot,
    title: "Health Chatbot",
    description: "24/7 AI medical assistant to answer your health-related questions.",
    href: "/chat",
    color: "text-purple-500",
  },
  {
    icon: Brain,
    title: "Smart Dashboard",
    description: "Track your health predictions, symptoms history, and personalized tips.",
    href: "/dashboard",
    color: "text-orange-500",
  },
]

const stats = [
  { value: "98%", label: "Accuracy Rate", icon: Shield },
  { value: "50K+", label: "Predictions Made", icon: Activity },
  { value: "100+", label: "Diseases Covered", icon: Heart },
  { value: "<2s", label: "Response Time", icon: Zap },
]

export default function HomePage() {
  const [selectedPart, setSelectedPart] = useState<{ name: string; diseases: string[] } | null>(null)

  const handleBodyPartClick = (name: string, diseases: string[]) => {
    setSelectedPart({ name, diseases })
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
          
          <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
              {/* Left Content */}
              <div className="flex flex-col justify-center">
                <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">AI-Powered Healthcare</span>
                </div>
                
                <h1 className="mb-6 text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                  <span className="text-foreground">Predict Diseases with </span>
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Advanced AI
                  </span>
                </h1>
                
                <p className="mb-8 max-w-lg text-lg text-muted-foreground text-pretty">
                  Enter your symptoms and let our AI analyze them to predict possible diseases with accurate confidence scores. Get instant recommendations and take control of your health.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg" className="gap-2">
                    <Link href="/predictor">
                      Start Prediction
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="gap-2">
                    <Link href="/voice">
                      <Mic className="h-4 w-4" />
                      Voice Assistant
                    </Link>
                  </Button>
                </div>

                {/* Stats */}
                <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {stats.map((stat) => {
                    const Icon = stat.icon
                    return (
                      <div key={stat.label} className="text-center">
                        <div className="mb-1 flex items-center justify-center gap-1">
                          <Icon className="h-4 w-4 text-primary" />
                          <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{stat.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Right - 3D Body Model */}
              <div className="relative h-[500px] lg:h-[600px]">
                <div className="absolute inset-0 rounded-3xl border border-border/50 bg-gradient-to-br from-card/50 to-card shadow-2xl backdrop-blur-sm">
                  <BodyModel onBodyPartClick={handleBodyPartClick} />
                </div>
                <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-muted-foreground">
                  Click on body parts to explore common conditions
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t bg-muted/30 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-balance">
                Comprehensive Health AI Platform
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground text-pretty">
                Our platform combines cutting-edge AI with medical knowledge to provide you with accurate health insights and personalized recommendations.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <Link key={feature.title} href={feature.href}>
                    <Card className="group h-full transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                      <CardHeader>
                        <div className={`mb-2 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ${feature.color}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          {feature.title}
                          <ArrowRight className="h-4 w-4 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-sm">
                          {feature.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight">How It Works</h2>
              <p className="text-muted-foreground">Get health predictions in three simple steps</p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                { step: "01", title: "Enter Symptoms", description: "Type or speak your symptoms using our intuitive interface or voice assistant." },
                { step: "02", title: "AI Analysis", description: "Our advanced ML model analyzes your symptoms against thousands of medical patterns." },
                { step: "03", title: "Get Results", description: "Receive detailed predictions with confidence scores and recommended actions." },
              ].map((item) => (
                <div key={item.step} className="relative text-center">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                    <span className="text-2xl font-bold text-primary">{item.step}</span>
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-balance">
              Ready to Take Control of Your Health?
            </h2>
            <p className="mb-8 text-muted-foreground text-pretty">
              Start using our AI-powered health prediction platform today. No signup required.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="gap-2">
                <Link href="/predictor">
                  <Stethoscope className="h-4 w-4" />
                  Start Prediction
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link href="/about">
                  Learn About Our AI
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Activity className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-semibold">HealthAI Predictor</span>
              </div>
              <p className="text-sm text-muted-foreground">
                For informational purposes only. Always consult a healthcare professional.
              </p>
            </div>
          </div>
        </footer>
      </main>

      <EmergencyButton />
      <FloatingChat />

      {/* Body Part Dialog */}
      <Dialog open={!!selectedPart} onOpenChange={() => setSelectedPart(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              {selectedPart?.name} - Common Conditions
            </DialogTitle>
            <DialogDescription>
              These are common conditions associated with the {selectedPart?.name?.toLowerCase()}. Click below to check symptoms.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {selectedPart?.diseases.map((disease) => (
              <Link
                key={disease}
                href={`/predictor?condition=${encodeURIComponent(disease)}`}
                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted"
              >
                <span className="font-medium">{disease}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
          <Button asChild className="mt-4 w-full">
            <Link href="/predictor">Check All Symptoms</Link>
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
