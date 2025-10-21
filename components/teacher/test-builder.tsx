"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Clock } from "lucide-react"

interface Subject {
  id: string
  name: string
}

interface Chapter {
  id: string
  name: string
  subject_id: string
}

interface Question {
  id: string
  question_text: string
  marks: number
}

export function TestBuilder({ teacherId }: { teacherId: string }) {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [selectedChapters, setSelectedChapters] = useState<string[]>([])
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
  const [testTitle, setTestTitle] = useState("")
  const [testDescription, setTestDescription] = useState("")
  const [durationMinutes, setDurationMinutes] = useState("60")
  const [loading, setLoading] = useState(false)
  const [tests, setTests] = useState<any[]>([])

  useEffect(() => {
    fetchSubjects()
    fetchTests()
  }, [teacherId])

  const fetchSubjects = async () => {
    try {
      const res = await fetch(`/api/subjects?teacherId=${teacherId}`)
      const data = await res.json()
      setSubjects(data)
    } catch (error) {
      console.error("Failed to fetch subjects:", error)
    }
  }

  const fetchTests = async () => {
    try {
      const res = await fetch(`/api/tests?teacherId=${teacherId}`)
      const data = await res.json()
      setTests(data)
    } catch (error) {
      console.error("Failed to fetch tests:", error)
    }
  }

  const handleChapterToggle = async (chapterId: string) => {
    const newSelected = selectedChapters.includes(chapterId)
      ? selectedChapters.filter((id) => id !== chapterId)
      : [...selectedChapters, chapterId]

    setSelectedChapters(newSelected)

    // Fetch questions for selected chapters
    if (newSelected.length > 0) {
      try {
        const allQuestions: Question[] = []
        for (const chapId of newSelected) {
          const res = await fetch(`/api/questions?chapterId=${chapId}`)
          const data = await res.json()
          allQuestions.push(...data)
        }
        setQuestions(allQuestions)
        setSelectedQuestions([]) // Reset selected questions
      } catch (error) {
        console.error("Failed to fetch questions:", error)
      }
    } else {
      setQuestions([])
      setSelectedQuestions([])
    }
  }

  const handleQuestionToggle = (questionId: string) => {
    setSelectedQuestions(
      selectedQuestions.includes(questionId)
        ? selectedQuestions.filter((id) => id !== questionId)
        : [...selectedQuestions, questionId],
    )
  }

  const handleCreateTest = async () => {
    if (!testTitle.trim() || selectedQuestions.length === 0 || !durationMinutes) return

    setLoading(true)
    try {
      const res = await fetch("/api/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId,
          title: testTitle,
          description: testDescription,
          durationMinutes: Number.parseInt(durationMinutes),
          questionIds: selectedQuestions,
        }),
      })
      const newTest = await res.json()
      setTests([...tests, newTest])
      resetForm()
    } catch (error) {
      console.error("Failed to create test:", error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setTestTitle("")
    setTestDescription("")
    setDurationMinutes("60")
    setSelectedChapters([])
    setSelectedQuestions([])
    setQuestions([])
  }

  const totalMarks = questions.filter((q) => selectedQuestions.includes(q.id)).reduce((sum, q) => sum + q.marks, 0)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Test</CardTitle>
          <CardDescription>Select chapters and questions to create a test</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Test Details */}
          <div className="space-y-4">
            <h4 className="font-semibold">Test Details</h4>
            <Input placeholder="Test Title" value={testTitle} onChange={(e) => setTestTitle(e.target.value)} />
            <Textarea
              placeholder="Test Description (optional)"
              value={testDescription}
              onChange={(e) => setTestDescription(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <Input
                type="number"
                min="5"
                max="480"
                placeholder="Duration in minutes"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-40"
              />
              <span className="text-sm text-muted-foreground">minutes</span>
            </div>
          </div>

          {/* Chapter Selection */}
          <div className="space-y-4">
            <h4 className="font-semibold">Select Chapters</h4>
            {subjects.length === 0 ? (
              <p className="text-sm text-muted-foreground">No subjects available. Create subjects first.</p>
            ) : (
              <div className="space-y-3">
                {subjects.map((subject) => (
                  <div key={subject.id} className="border rounded-lg p-3 space-y-2">
                    <p className="font-medium text-sm">{subject.name}</p>
                    <div className="space-y-2 ml-4">
                      {chapters
                        .filter((c) => c.subject_id === subject.id)
                        .map((chapter) => (
                          <div key={chapter.id} className="flex items-center gap-2">
                            <Checkbox
                              id={chapter.id}
                              checked={selectedChapters.includes(chapter.id)}
                              onCheckedChange={() => handleChapterToggle(chapter.id)}
                            />
                            <label htmlFor={chapter.id} className="text-sm cursor-pointer">
                              {chapter.name}
                            </label>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Question Selection */}
          {questions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Select Questions</h4>
                <span className="text-sm text-muted-foreground">
                  {selectedQuestions.length} selected | Total Marks: {totalMarks}
                </span>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-3">
                {questions.map((question) => (
                  <div key={question.id} className="flex items-start gap-2 p-2 hover:bg-muted rounded">
                    <Checkbox
                      id={question.id}
                      checked={selectedQuestions.includes(question.id)}
                      onCheckedChange={() => handleQuestionToggle(question.id)}
                    />
                    <label htmlFor={question.id} className="text-sm cursor-pointer flex-1">
                      <p>{question.question_text}</p>
                      <p className="text-xs text-muted-foreground">Marks: {question.marks}</p>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button onClick={handleCreateTest} disabled={loading || selectedQuestions.length === 0} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Create Test
          </Button>
        </CardContent>
      </Card>

      {/* Created Tests */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Your Tests</h3>
        {tests.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tests created yet.</p>
        ) : (
          <div className="grid gap-4">
            {tests.map((test) => (
              <Card key={test.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{test.title}</CardTitle>
                      {test.description && <CardDescription>{test.description}</CardDescription>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-semibold">{test.duration_minutes} minutes</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Marks</p>
                      <p className="font-semibold">{test.total_marks}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Questions</p>
                      <p className="font-semibold">-</p>
                    </div>
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
