"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Home, CheckCircle, XCircle } from "lucide-react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

interface Answer {
  id: string
  student_answer: string
  question_text: string
  correct_answer: string
  marks: number
  marks_obtained: number
  is_correct: boolean
}

interface Attempt {
  id: string
  test_id: string
  student_id: string
  started_at: string
  submitted_at: string
  total_marks: number
  obtained_marks: number
  status: string
}

export function ResultsDisplay({ attemptId }: { attemptId: string }) {
  const [attempt, setAttempt] = useState<Attempt | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    fetchResults()
  }, [attemptId])

  const fetchResults = async () => {
    try {
      const res = await fetch(`/api/results?attemptId=${attemptId}`)
      const data = await res.json()
      setAttempt(data.attempt)
      setAnswers(data.answers)
    } catch (error) {
      console.error("Failed to fetch results:", error)
    } finally {
      setLoading(false)
    }
  }

  const generatePDF = async () => {
    setGenerating(true)
    try {
      const element = document.getElementById("results-content")
      if (!element) return

      const canvas = await html2canvas(element, { scale: 2 })
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")

      const imgWidth = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= 297

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
        heightLeft -= 297
      }

      pdf.save(`test-results-${attemptId}.pdf`)
    } catch (error) {
      console.error("Failed to generate PDF:", error)
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading results...</div>
  }

  if (!attempt) {
    return <div className="text-center py-12">Results not found</div>
  }

  const percentage = ((attempt.obtained_marks / attempt.total_marks) * 100).toFixed(1)
  const isPassed = Number.parseFloat(percentage) >= 40

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto">
        <div id="results-content" className="space-y-6 bg-white p-8 rounded-lg">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Test Results</h1>
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${isPassed ? "bg-green-100" : "bg-red-100"}`}
            >
              {isPassed ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span className={`font-semibold ${isPassed ? "text-green-700" : "text-red-700"}`}>
                {isPassed ? "PASSED" : "FAILED"}
              </span>
            </div>
          </div>

          {/* Score Card */}
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-muted-foreground text-sm">Obtained Marks</p>
                  <p className="text-4xl font-bold text-blue-600">{attempt.obtained_marks}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Total Marks</p>
                  <p className="text-4xl font-bold text-gray-600">{attempt.total_marks}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Percentage</p>
                  <p className={`text-4xl font-bold ${isPassed ? "text-green-600" : "text-red-600"}`}>{percentage}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Info */}
          <Card>
            <CardHeader>
              <CardTitle>Test Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Started At</p>
                  <p className="font-medium">{new Date(attempt.started_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Submitted At</p>
                  <p className="font-medium">{new Date(attempt.submitted_at).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Answers */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Detailed Review</h2>
            {answers.map((answer, index) => (
              <Card
                key={answer.id}
                className={`border-l-4 ${answer.is_correct ? "border-l-green-500" : "border-l-red-500"}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                      <CardDescription>{answer.question_text}</CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Marks</p>
                      <p className={`text-lg font-bold ${answer.is_correct ? "text-green-600" : "text-red-600"}`}>
                        {answer.marks_obtained}/{answer.marks}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">Your Answer</p>
                    <div
                      className={`p-3 rounded-lg ${answer.is_correct ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
                    >
                      <p className={answer.is_correct ? "text-green-900" : "text-red-900"}>
                        {answer.student_answer || "Not answered"}
                      </p>
                    </div>
                  </div>

                  {!answer.is_correct && (
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-1">Correct Answer</p>
                      <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                        <p className="text-green-900">{answer.correct_answer}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8 justify-center">
          <Button onClick={generatePDF} disabled={generating} className="gap-2">
            <Download className="h-4 w-4" />
            {generating ? "Generating PDF..." : "Download as PDF"}
          </Button>
          <Button variant="outline" onClick={() => (window.location.href = "/student/tests")}>
            <Home className="mr-2 h-4 w-4" />
            Back to Tests
          </Button>
        </div>
      </div>
    </div>
  )
}
