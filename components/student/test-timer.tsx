"use client"

import { useEffect, useState } from "react"
import { AlertCircle, Clock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface TestTimerProps {
  durationMinutes: number
  onTimeUp: () => void
  isSubmitted: boolean
}

export function TestTimer({ durationMinutes, onTimeUp, isSubmitted }: TestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60)
  const [isWarning, setIsWarning] = useState(false)

  useEffect(() => {
    if (isSubmitted) return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          onTimeUp()
          return 0
        }
        const newTime = prev - 1
        setIsWarning(newTime <= 300) // Warning when 5 minutes left
        return newTime
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [onTimeUp, isSubmitted])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <div className={`p-4 rounded-lg border-2 ${isWarning ? "border-red-500 bg-red-50" : "border-blue-500 bg-blue-50"}`}>
      <div className="flex items-center gap-2 mb-2">
        <Clock className={`h-5 w-5 ${isWarning ? "text-red-600" : "text-blue-600"}`} />
        <span className={`font-semibold ${isWarning ? "text-red-600" : "text-blue-600"}`}>Time Remaining</span>
      </div>
      <div className={`text-3xl font-bold ${isWarning ? "text-red-600" : "text-blue-600"}`}>
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </div>
      {isWarning && (
        <Alert className="mt-3 border-red-300 bg-red-100">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">Time is running out! Submit your test soon.</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
