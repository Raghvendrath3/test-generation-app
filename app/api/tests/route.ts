import { getDb } from "@/lib/db"
import { generateId } from "@/lib/utils/id-generator"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const db = getDb()
    const teacherId = request.nextUrl.searchParams.get("teacherId")
    const testId = request.nextUrl.searchParams.get("testId")

    if (testId) {
      const test = db.prepare("SELECT * FROM tests WHERE id = ?").get(testId)
      if (!test) {
        return NextResponse.json({ error: "Test not found" }, { status: 404 })
      }

      const testQuestions = db
        .prepare(`
        SELECT q.*, tq.order_index 
        FROM test_questions tq
        JOIN questions q ON tq.question_id = q.id
        WHERE tq.test_id = ?
        ORDER BY tq.order_index ASC
      `)
        .all(testId)

      const questionsWithOptions = testQuestions.map((q: any) => {
        const options = db
          .prepare("SELECT id, option_text, order_index FROM options WHERE question_id = ? ORDER BY order_index ASC")
          .all(q.id)
        return { ...q, options }
      })

      return NextResponse.json({ ...test, questions: questionsWithOptions })
    }

    if (!teacherId) {
      return NextResponse.json({ error: "Teacher ID required" }, { status: 400 })
    }

    const tests = db.prepare("SELECT * FROM tests WHERE teacher_id = ? ORDER BY created_at DESC").all(teacherId)
    return NextResponse.json(tests)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tests" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb()
    const { teacherId, title, description, durationMinutes, questionIds } = await request.json()

    if (!teacherId || !title || !durationMinutes || !questionIds) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const testId = generateId("test")

    // Calculate total marks
    const placeholders = questionIds.map(() => "?").join(",")
    const totalMarks = db
      .prepare(`SELECT SUM(marks) as total FROM questions WHERE id IN (${placeholders})`)
      .get(...questionIds) as any

    db.prepare(
      "INSERT INTO tests (id, teacher_id, title, description, duration_minutes, total_marks) VALUES (?, ?, ?, ?, ?, ?)",
    ).run(testId, teacherId, title, description || null, durationMinutes, totalMarks?.total || 0)

    // Add questions to test
    questionIds.forEach((qId: string, index: number) => {
      const testQId = generateId("testq")
      db.prepare("INSERT INTO test_questions (id, test_id, question_id, order_index) VALUES (?, ?, ?, ?)").run(
        testQId,
        testId,
        qId,
        index,
      )
    })

    return NextResponse.json({
      testId,
      teacherId,
      title,
      description,
      durationMinutes,
      totalMarks: totalMarks?.total || 0,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create test" }, { status: 500 })
  }
}
