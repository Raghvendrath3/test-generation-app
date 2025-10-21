"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TestTimer } from "./test-timer"
import { TestQuestion } from "./test-question"
import { AlertCircle, ChevronLeft, ChevronRight, Send } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Question {
  id: string
  question_text: string
  question_type: "mcq" | "short_answer" | "essay"
  marks: number
  options: Array<{ id: string; option_text: string; order_index: number }>
}

interface Test {
  id: string
  title: string
  description: string
  duration_minutes: number
  total_marks: number
  questions: Question[]
}

export function TestInterface({ testId, studentId }: { testId: string; studentId: string }) {
  const [test, setTest] = useState<Test | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchTest()
    startAttempt()
  }, [testId, studentId])

  const fetchTest = async () => {
    try {
      const res = await fetch(`/api/tests?testId=${testId}`)
      const data = await res.json()
      setTest(data)
      // Initialize answers object
      const initialAnswers: Record<string, string> = {}
      data.questions.forEach((q: Question) => {
        initialAnswers[q.id] = ""
      })
      setAnswers(initialAnswers)
    } catch (error) {
      console.error("Failed to fetch test:", error)
    } finally {
      setLoading(false)
    }
  }

  const startAttempt = async () => {
    try {
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testId, studentId }),
      })
      const data = await res.json()
      setAttemptId(data.attemptId)
    } catch (error) {
      console.error("Failed to start attempt:", error)
    }
  }

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  const handleSubmitTest = async () => {
    if (!attemptId || !test) return

    setSubmitting(true)
    try {
      const answersArray = test.questions.map((q) => ({
        questionId: q.id,
        answer: answers[q.id] || "",
      }))

      const res = await fetch("/api/attempts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, answers: answersArray }),
      })
      const result = await res.json()
      setIsSubmitted(true)
      // Redirect to results page
      window.location.href = `/student/results/${attemptId}`
    } catch (error) {
      console.error("Failed to submit test:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleTimeUp = async () => {
    setIsSubmitted(true)
    await handleSubmitTest()
  }

  if (loading) {
    return <div className="text-center py-12">Loading test...</div>
  }

  if (!test) {
    return <div className="text-center py-12">Test not found</div>
  }

  const currentQuestion = test.questions[currentQuestionIndex]
  const answeredCount = Object.values(answers).filter((a) => a.trim()).length
  const unansweredCount = test.questions.length - answeredCount

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            <div>
              <h1 className="text-3xl font-bold">{test.title}</h1>
              {test.description && <p className="text-muted-foreground mt-2">{test.description}</p>}
            </div>

            {/* Timer */}
            <TestTimer durationMinutes={test.duration_minutes} onTimeUp={handleTimeUp} isSubmitted={isSubmitted} />

            {/* Question */}
            <TestQuestion
              question={currentQuestion}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={test.questions.length}
              answer={answers[currentQuestion.id]}
              onAnswerChange={(answer) => handleAnswerChange(currentQuestion.id, answer)}
            />

            {/* Navigation */}
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              <div className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {test.questions.length}
              </div>

              <Button
                variant="outline"
                onClick={() => setCurrentQuestionIndex(Math.min(test.questions.length - 1, currentQuestionIndex + 1))}
                disabled={currentQuestionIndex === test.questions.length - 1}
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmitTest}
              disabled={submitting || isSubmitted}
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
            >
              <Send className="mr-2 h-4 w-4" />
              Submit Test
            </Button>
          </div>

          {/* Sidebar - Question Overview */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Test Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Marks</p>
                  <p className="text-2xl font-bold">{test.total_marks}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Questions</p>
                  <p className="text-2xl font-bold">{test.questions.length}</p>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm font-semibold mb-2">Status</p>
                  <div className="space-y-1 text-sm">
                    <p className="text-green-600">Answered: {answeredCount}</p>
                    <p className="text-orange-600">Unanswered: {unansweredCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Question Navigation Grid */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2">
                  {test.questions.map((q, index) => (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`aspect-square rounded border-2 font-semibold text-sm transition-colors ${
                        index === currentQuestionIndex
                          ? "border-blue-600 bg-blue-100 text-blue-900"
                          : answers[q.id]
                            ? "border-green-500 bg-green-100 text-green-900"
                            : "border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Warning */}
            <Alert className="border-orange-300 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800 text-sm">
                Answers are not visible during the test. Review before submitting.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </div>
  )
}
