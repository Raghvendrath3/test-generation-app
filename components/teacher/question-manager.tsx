"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, ChevronDown, ChevronUp } from "lucide-react"

interface Question {
  id: string
  chapter_id: string
  question_text: string
  question_type: "mcq" | "short_answer" | "essay"
  marks: number
  correct_answer: string
  explanation: string
  options: Array<{ id: string; option_text: string; order_index: number }>
}

interface Chapter {
  id: string
  name: string
  subject_id: string
}

export function QuestionManager({ chapterId, chapterName }: { chapterId: string; chapterName: string }) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null)
  const [questionText, setQuestionText] = useState("")
  const [questionType, setQuestionType] = useState<"mcq" | "short_answer" | "essay">("mcq")
  const [marks, setMarks] = useState("1")
  const [correctAnswer, setCorrectAnswer] = useState("")
  const [explanation, setExplanation] = useState("")
  const [options, setOptions] = useState<string[]>(["", "", "", ""])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchQuestions()
  }, [chapterId])

  const fetchQuestions = async () => {
    try {
      const res = await fetch(`/api/questions?chapterId=${chapterId}`)
      const data = await res.json()
      setQuestions(data)
    } catch (error) {
      console.error("Failed to fetch questions:", error)
    }
  }

  const handleAddQuestion = async () => {
    if (!questionText.trim() || !correctAnswer.trim()) return

    setLoading(true)
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterId,
          questionText,
          questionType,
          marks: Number.parseInt(marks),
          correctAnswer,
          explanation,
          options: questionType === "mcq" ? options.filter((o) => o.trim()) : [],
        }),
      })
      const newQuestion = await res.json()
      setQuestions([...questions, newQuestion])
      resetForm()
    } catch (error) {
      console.error("Failed to add question:", error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setQuestionText("")
    setQuestionType("mcq")
    setMarks("1")
    setCorrectAnswer("")
    setExplanation("")
    setOptions(["", "", "", ""])
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Question to {chapterName}</CardTitle>
          <CardDescription>Create a new question for this chapter</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Question Text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            className="min-h-24"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Question Type</label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value as any)}
                className="w-full mt-1 px-3 py-2 border rounded-md"
              >
                <option value="mcq">Multiple Choice</option>
                <option value="short_answer">Short Answer</option>
                <option value="essay">Essay</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Marks</label>
              <Input type="number" min="1" value={marks} onChange={(e) => setMarks(e.target.value)} />
            </div>
          </div>

          {questionType === "mcq" && (
            <div className="space-y-3">
              <label className="text-sm font-medium">Options</label>
              {options.map((option, index) => (
                <Input
                  key={index}
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                />
              ))}
              <Button variant="outline" onClick={() => setOptions([...options, ""])} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Option
              </Button>
            </div>
          )}

          <div>
            <label className="text-sm font-medium">Correct Answer</label>
            {questionType === "mcq" ? (
              <select
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md"
              >
                <option value="">Select correct answer</option>
                {options.map((option, index) => (
                  <option key={index} value={option}>
                    {option || `Option ${index + 1}`}
                  </option>
                ))}
              </select>
            ) : (
              <Textarea
                placeholder="Enter the correct answer"
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                className="mt-1 min-h-20"
              />
            )}
          </div>

          <Textarea
            placeholder="Explanation (optional)"
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            className="min-h-20"
          />

          <Button onClick={handleAddQuestion} disabled={loading} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Questions in this Chapter</h3>
        {questions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No questions yet.</p>
        ) : (
          questions.map((question, index) => (
            <Card key={question.id}>
              <div
                className="flex items-start justify-between p-4 cursor-pointer hover:bg-accent"
                onClick={() => setExpandedQuestion(expandedQuestion === question.id ? null : question.id)}
              >
                <div className="flex-1">
                  <p className="font-semibold">
                    Q{index + 1}: {question.question_text}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Type: {question.question_type} | Marks: {question.marks}
                  </p>
                </div>
                {expandedQuestion === question.id ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>

              {expandedQuestion === question.id && (
                <CardContent className="border-t pt-4 space-y-3">
                  {question.options.length > 0 && (
                    <div>
                      <p className="font-semibold text-sm mb-2">Options:</p>
                      <ul className="space-y-1">
                        {question.options.map((opt) => (
                          <li key={opt.id} className="text-sm">
                            {opt.option_text}
                            {opt.option_text === question.correct_answer && (
                              <span className="ml-2 text-green-600 font-semibold">(Correct)</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {question.explanation && (
                    <div>
                      <p className="font-semibold text-sm">Explanation:</p>
                      <p className="text-sm text-muted-foreground">{question.explanation}</p>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
