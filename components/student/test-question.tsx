"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface Question {
  id: string
  question_text: string
  question_type: "mcq" | "short_answer" | "essay"
  marks: number
  options: Array<{ id: string; option_text: string; order_index: number }>
}

interface TestQuestionProps {
  question: Question
  questionNumber: number
  totalQuestions: number
  answer: string
  onAnswerChange: (answer: string) => void
}

export function TestQuestion({ question, questionNumber, totalQuestions, answer, onAnswerChange }: TestQuestionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              Question {questionNumber} of {totalQuestions}
            </CardTitle>
            <CardDescription>Marks: {question.marks}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-base font-medium">{question.question_text}</p>

        {question.question_type === "mcq" && (
          <RadioGroup value={answer} onValueChange={onAnswerChange}>
            <div className="space-y-3">
              {question.options.map((option) => (
                <div key={option.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted">
                  <RadioGroupItem value={option.option_text} id={option.id} />
                  <Label htmlFor={option.id} className="cursor-pointer flex-1">
                    {option.option_text}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        )}

        {(question.question_type === "short_answer" || question.question_type === "essay") && (
          <Textarea
            placeholder={
              question.question_type === "short_answer"
                ? "Enter your short answer here..."
                : "Enter your essay answer here..."
            }
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            className={`min-h-${question.question_type === "essay" ? "48" : "24"}`}
          />
        )}
      </CardContent>
    </Card>
  )
}
