import { getDb } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const db = getDb()
    const attemptId = request.nextUrl.searchParams.get("attemptId")

    if (!attemptId) {
      return NextResponse.json({ error: "Attempt ID required" }, { status: 400 })
    }

    const attempt = db.prepare("SELECT * FROM student_attempts WHERE id = ?").get(attemptId)
    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 })
    }

    const answers = db
      .prepare(`
      SELECT sa.*, q.question_text, q.correct_answer, q.marks
      FROM student_answers sa
      JOIN questions q ON sa.question_id = q.id
      WHERE sa.attempt_id = ?
    `)
      .all(attemptId)

    return NextResponse.json({ attempt, answers })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 })
  }
}
