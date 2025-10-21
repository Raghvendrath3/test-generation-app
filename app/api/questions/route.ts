import { getDb } from "@/lib/db"
import { generateId } from "@/lib/utils/id-generator"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const db = getDb()
    const chapterId = request.nextUrl.searchParams.get("chapterId")

    if (!chapterId) {
      return NextResponse.json({ error: "Chapter ID required" }, { status: 400 })
    }

    const questions = db.prepare("SELECT * FROM questions WHERE chapter_id = ? ORDER BY created_at DESC").all(chapterId)

    // Fetch options for each question
    const questionsWithOptions = questions.map((q: any) => {
      const options = db
        .prepare("SELECT id, option_text, order_index FROM options WHERE question_id = ? ORDER BY order_index ASC")
        .all(q.id)
      return { ...q, options }
    })

    return NextResponse.json(questionsWithOptions)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb()
    const { chapterId, questionText, questionType, marks, correctAnswer, explanation, options } = await request.json()

    if (!chapterId || !questionText || !questionType || !correctAnswer) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const questionId = generateId("ques")
    db.prepare(
      "INSERT INTO questions (id, chapter_id, question_text, question_type, marks, correct_answer, explanation) VALUES (?, ?, ?, ?, ?, ?, ?)",
    ).run(questionId, chapterId, questionText, questionType, marks || 1, correctAnswer, explanation || null)

    // Insert options if provided
    if (options && Array.isArray(options)) {
      options.forEach((opt: string, index: number) => {
        const optionId = generateId("opt")
        db.prepare("INSERT INTO options (id, question_id, option_text, order_index) VALUES (?, ?, ?, ?)").run(
          optionId,
          questionId,
          opt,
          index,
        )
      })
    }

    return NextResponse.json({
      questionId,
      chapterId,
      questionText,
      questionType,
      marks,
      correctAnswer,
      explanation,
      options,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 })
  }
}
