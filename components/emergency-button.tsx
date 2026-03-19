"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Phone, MapPin, AlertTriangle, Hospital, Ambulance } from "lucide-react"

const emergencyContacts = [
  { name: "Emergency Services", number: "911", icon: AlertTriangle },
  { name: "Ambulance", number: "911", icon: Ambulance },
  { name: "Poison Control", number: "1-800-222-1222", icon: Phone },
]

const nearbyHospitals = [
  { name: "City General Hospital", distance: "0.8 miles", address: "123 Medical Center Dr" },
  { name: "St. Mary's Medical Center", distance: "1.2 miles", address: "456 Healthcare Ave" },
  { name: "University Hospital", distance: "2.1 miles", address: "789 Campus Blvd" },
]

export function EmergencyButton() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          size="lg"
          className="fixed bottom-6 right-6 z-50 h-14 gap-2 rounded-full px-6 shadow-lg shadow-destructive/25 animate-pulse hover:animate-none"
        >
          <AlertTriangle className="h-5 w-5" />
          <span className="font-semibold">Emergency</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Emergency Assistance
          </DialogTitle>
          <DialogDescription>
            Call emergency services immediately if you are experiencing a medical emergency.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Phone className="h-4 w-4 text-destructive" />
              Emergency Contacts
            </h4>
            <div className="space-y-2">
              {emergencyContacts.map((contact) => {
                const Icon = contact.icon
                return (
                  <a
                    key={contact.name}
                    href={`tel:${contact.number}`}
                    className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-3 transition-colors hover:bg-destructive/10"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-destructive" />
                      <span className="font-medium">{contact.name}</span>
                    </div>
                    <span className="font-mono text-destructive">{contact.number}</span>
                  </a>
                )
              })}
            </div>
          </div>

          <div>
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Hospital className="h-4 w-4 text-primary" />
              Nearby Hospitals
            </h4>
            <div className="space-y-2">
              {nearbyHospitals.map((hospital) => (
                <div
                  key={hospital.name}
                  className="rounded-lg border bg-card p-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{hospital.name}</p>
                      <p className="text-sm text-muted-foreground">{hospital.address}</p>
                    </div>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {hospital.distance}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
