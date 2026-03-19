"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface BodyPart {
  id: string
  name: string
  diseases: string[]
  path: string
  color: string
}

const bodyParts: BodyPart[] = [
  {
    id: "head",
    name: "Head",
    diseases: ["Migraine", "Sinusitis", "Concussion", "Meningitis"],
    path: "M150,30 C150,30 130,30 120,50 C110,70 110,90 115,100 C120,110 130,115 150,115 C170,115 180,110 185,100 C190,90 190,70 180,50 C170,30 150,30 150,30",
    color: "#60a5fa"
  },
  {
    id: "neck",
    name: "Neck",
    diseases: ["Thyroid Issues", "Cervical Pain", "Lymph Node Swelling"],
    path: "M135,115 L135,135 L165,135 L165,115 C165,115 155,120 150,120 C145,120 135,115 135,115",
    color: "#94a3b8"
  },
  {
    id: "chest",
    name: "Chest",
    diseases: ["Pneumonia", "Bronchitis", "Heart Disease", "Asthma"],
    path: "M100,135 L95,180 L100,220 L130,230 L150,235 L170,230 L200,220 L205,180 L200,135 C200,135 175,140 150,140 C125,140 100,135 100,135",
    color: "#f472b6"
  },
  {
    id: "abdomen",
    name: "Abdomen",
    diseases: ["Gastritis", "Appendicitis", "Liver Disease", "Pancreatitis"],
    path: "M100,220 L105,290 L120,310 L150,320 L180,310 L195,290 L200,220 L170,230 L150,235 L130,230 L100,220",
    color: "#34d399"
  },
  {
    id: "pelvis",
    name: "Pelvis",
    diseases: ["UTI", "Kidney Stones", "Hernia", "Intestinal Issues"],
    path: "M105,290 L100,340 L120,360 L150,365 L180,360 L200,340 L195,290 L180,310 L150,320 L120,310 L105,290",
    color: "#fbbf24"
  },
  {
    id: "left-arm",
    name: "Left Arm",
    diseases: ["Carpal Tunnel", "Tennis Elbow", "Arthritis", "Fracture"],
    path: "M95,140 L70,145 L50,180 L40,250 L35,320 L45,325 L55,320 L60,250 L70,190 L85,160 L100,155",
    color: "#a78bfa"
  },
  {
    id: "right-arm",
    name: "Right Arm",
    diseases: ["Carpal Tunnel", "Tennis Elbow", "Arthritis", "Fracture"],
    path: "M205,140 L230,145 L250,180 L260,250 L265,320 L255,325 L245,320 L240,250 L230,190 L215,160 L200,155",
    color: "#a78bfa"
  },
  {
    id: "left-leg",
    name: "Left Leg",
    diseases: ["DVT", "Varicose Veins", "Sciatica", "Arthritis"],
    path: "M120,360 L110,420 L105,500 L100,580 L110,585 L125,580 L130,500 L135,420 L150,365",
    color: "#fb923c"
  },
  {
    id: "right-leg",
    name: "Right Leg",
    diseases: ["DVT", "Varicose Veins", "Sciatica", "Arthritis"],
    path: "M180,360 L190,420 L195,500 L200,580 L190,585 L175,580 L170,500 L165,420 L150,365",
    color: "#fb923c"
  },
]

interface BodyModelProps {
  onBodyPartClick?: (name: string, diseases: string[]) => void
}

export function BodyModel({ onBodyPartClick }: BodyModelProps) {
  const [hoveredPart, setHoveredPart] = useState<string | null>(null)
  const [selectedPart, setSelectedPart] = useState<string | null>(null)

  const handlePartClick = (part: BodyPart) => {
    setSelectedPart(part.id)
    onBodyPartClick?.(part.name, part.diseases)
  }

  const hoveredData = bodyParts.find(p => p.id === hoveredPart)

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      {/* Animated background glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-[400px] w-[300px] animate-pulse rounded-full bg-primary/5 blur-3xl" />
      </div>

      <svg
        viewBox="0 0 300 600"
        className="h-full max-h-[500px] w-auto drop-shadow-2xl"
        style={{ filter: "drop-shadow(0 0 30px rgba(99, 102, 241, 0.15))" }}
      >
        <defs>
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.1" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.1" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {bodyParts.map((part) => (
          <path
            key={part.id}
            d={part.path}
            className={cn(
              "cursor-pointer transition-all duration-300",
              hoveredPart === part.id && "brightness-125",
              selectedPart === part.id && "brightness-150"
            )}
            fill={hoveredPart === part.id || selectedPart === part.id ? part.color : `${part.color}99`}
            stroke={hoveredPart === part.id || selectedPart === part.id ? "#fff" : part.color}
            strokeWidth={hoveredPart === part.id || selectedPart === part.id ? 2 : 1}
            filter={hoveredPart === part.id ? "url(#glow)" : undefined}
            onMouseEnter={() => setHoveredPart(part.id)}
            onMouseLeave={() => setHoveredPart(null)}
            onClick={() => handlePartClick(part)}
            style={{
              transform: hoveredPart === part.id ? "scale(1.02)" : "scale(1)",
              transformOrigin: "center",
              transition: "all 0.3s ease"
            }}
          />
        ))}
      </svg>

      {/* Hover tooltip */}
      {hoveredData && (
        <div className="pointer-events-none absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-xl border border-border/50 bg-background/95 px-4 py-3 shadow-xl backdrop-blur-lg">
          <h4 className="mb-1 font-semibold text-primary">{hoveredData.name}</h4>
          <p className="text-xs text-muted-foreground">Common conditions:</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {hoveredData.diseases.slice(0, 3).map((disease) => (
              <span key={disease} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                {disease}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-xs text-muted-foreground">
        Click on any body part to explore conditions
      </div>
    </div>
  )
}
