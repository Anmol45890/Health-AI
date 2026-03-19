"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { EmergencyButton } from "@/components/emergency-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import {
  Activity,
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  CheckCircle,
  Clock,
  Heart,
  Lightbulb,
  PieChart,
  Plus,
  Shield,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Droplets,
  Apple,
  Moon,
  Footprints
} from "lucide-react"

// Mock data for dashboard
const recentPredictions = [
  {
    id: 1,
    date: "Today, 2:30 PM",
    symptoms: ["Headache", "Fatigue", "Dizziness"],
    topPrediction: "Tension Headache",
    confidence: 78,
    severity: "low"
  },
  {
    id: 2,
    date: "Yesterday, 10:15 AM",
    symptoms: ["Cough", "Fever", "Body Aches"],
    topPrediction: "Influenza",
    confidence: 85,
    severity: "medium"
  },
  {
    id: 3,
    date: "Mar 10, 4:45 PM",
    symptoms: ["Stomach Pain", "Nausea"],
    topPrediction: "Gastritis",
    confidence: 72,
    severity: "medium"
  },
]

const healthTips = [
  {
    icon: Droplets,
    title: "Stay Hydrated",
    description: "Drink at least 8 glasses of water daily to maintain optimal health.",
    color: "text-blue-500"
  },
  {
    icon: Moon,
    title: "Quality Sleep",
    description: "Aim for 7-9 hours of sleep each night for better immune function.",
    color: "text-indigo-500"
  },
  {
    icon: Apple,
    title: "Balanced Diet",
    description: "Include fruits, vegetables, and whole grains in every meal.",
    color: "text-green-500"
  },
  {
    icon: Footprints,
    title: "Regular Exercise",
    description: "30 minutes of moderate exercise daily improves overall health.",
    color: "text-orange-500"
  },
]

const precautions = [
  "Wash hands frequently for at least 20 seconds",
  "Get vaccinated and keep immunizations up to date",
  "Avoid touching your face, especially eyes, nose, and mouth",
  "Maintain a healthy diet rich in vitamins and minerals",
  "Get regular health check-ups and screenings",
  "Practice stress management techniques",
]

const stats = [
  { label: "Total Predictions", value: "12", icon: Activity, trend: "+3 this week" },
  { label: "Accuracy Rate", value: "94%", icon: Shield, trend: "Above average" },
  { label: "Health Score", value: "85", icon: Heart, trend: "+5 points" },
  { label: "Active Days", value: "28", icon: Calendar, trend: "Streak" },
]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")

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
      
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Health Dashboard</h1>
            <p className="text-muted-foreground">
              Track your health predictions, symptoms, and wellness insights
            </p>
          </div>
          <Button asChild className="gap-2">
            <Link href="/predictor">
              <Plus className="h-4 w-4" />
              New Prediction
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant="secondary" className="gap-1 text-xs">
                      <TrendingUp className="h-3 w-3" />
                      {stat.trend}
                    </Badge>
                  </div>
                  <div className="mt-4">
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">Prediction History</TabsTrigger>
            <TabsTrigger value="tips">Health Tips</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Recent Predictions */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Stethoscope className="h-5 w-5 text-primary" />
                      Recent Predictions
                    </CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="#" onClick={() => setActiveTab("history")}>
                        View All
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentPredictions.slice(0, 3).map((prediction) => (
                    <div
                      key={prediction.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{prediction.topPrediction}</p>
                          <Badge 
                            variant="outline" 
                            className={getSeverityColor(prediction.severity)}
                          >
                            {prediction.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {prediction.symptoms.join(", ")}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {prediction.date}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{prediction.confidence}%</p>
                        <p className="text-xs text-muted-foreground">Confidence</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Health Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Heart className="h-5 w-5 text-primary" />
                    Health Score
                  </CardTitle>
                  <CardDescription>
                    Based on your recent activity and predictions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-center">
                    <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-8 border-primary/20">
                      <div className="text-center">
                        <p className="text-4xl font-bold text-primary">85</p>
                        <p className="text-sm text-muted-foreground">Good</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { label: "Physical Health", value: 88 },
                      { label: "Mental Wellness", value: 82 },
                      { label: "Lifestyle Score", value: 85 },
                    ].map((item) => (
                      <div key={item.label} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{item.label}</span>
                          <span className="font-medium">{item.value}%</span>
                        </div>
                        <Progress value={item.value} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Precautions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5 text-primary" />
                  Daily Health Precautions
                </CardTitle>
                <CardDescription>
                  Simple steps to maintain good health
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {precautions.map((precaution, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3"
                    >
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                      <p className="text-sm">{precaution}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="h-5 w-5 text-primary" />
                  Prediction History
                </CardTitle>
                <CardDescription>
                  All your past symptom analyses and predictions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentPredictions.map((prediction) => (
                  <div
                    key={prediction.id}
                    className="rounded-lg border p-4 transition-colors hover:bg-muted/30"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{prediction.topPrediction}</h4>
                          <Badge 
                            variant="outline" 
                            className={getSeverityColor(prediction.severity)}
                          >
                            {prediction.severity} severity
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {prediction.symptoms.map((symptom) => (
                            <Badge key={symptom} variant="secondary" className="text-xs">
                              {symptom}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {prediction.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <PieChart className="h-3 w-3" />
                            {prediction.confidence}% confidence
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="pt-4 text-center">
                  <p className="mb-4 text-sm text-muted-foreground">
                    Start tracking your health by making predictions
                  </p>
                  <Button asChild>
                    <Link href="/predictor">
                      <Plus className="mr-2 h-4 w-4" />
                      New Prediction
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tips" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Personalized Health Tips
                </CardTitle>
                <CardDescription>
                  Recommendations to improve your wellness
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {healthTips.map((tip, index) => {
                    const Icon = tip.icon
                    return (
                      <div
                        key={index}
                        className="rounded-lg border p-4 transition-colors hover:border-primary/30 hover:bg-muted/30"
                      >
                        <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 ${tip.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <h4 className="mb-1 font-semibold">{tip.title}</h4>
                        <p className="text-sm text-muted-foreground">{tip.description}</p>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Weekly Goals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Weekly Wellness Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { goal: "Drink 8 glasses of water daily", progress: 70 },
                  { goal: "Exercise for 30 minutes", progress: 60 },
                  { goal: "Get 7+ hours of sleep", progress: 85 },
                  { goal: "Eat 5 servings of fruits/vegetables", progress: 50 },
                ].map((item) => (
                  <div key={item.goal} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{item.goal}</span>
                      <span className="font-medium">{item.progress}%</span>
                    </div>
                    <Progress value={item.progress} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <EmergencyButton />
    </div>
  )
}
