"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, Clock, BookOpen } from "lucide-react"

interface Test {
  id: string
  title: string
  description: string
  duration_minutes: number
  total_marks: number
}

export default function StudentTestsPage() {
  const [tests, setTests] = useState<Test[]>([])
  const [loading, setLoading] = useState(true)
  const studentId = "student_001" // In production, get from auth

  useEffect(() => {
    // In a real app, fetch available tests for the student
    // For now, we'll show a placeholder
    setLoading(false)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold mb-8">Available Tests</h1>

        {tests.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No tests available yet.</p>
              <p className="text-sm text-muted-foreground">Check back later for new tests.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {tests.map((test) => (
              <Card key={test.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{test.title}</CardTitle>
                      {test.description && <CardDescription>{test.description}</CardDescription>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-6">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{test.duration_minutes} minutes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{test.total_marks} marks</span>
                      </div>
                    </div>
                    <Button onClick={() => (window.location.href = `/student/test/${test.id}`)}>
                      <Play className="mr-2 h-4 w-4" />
                      Start Test
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
