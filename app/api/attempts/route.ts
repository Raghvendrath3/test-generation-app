import { getDb } from "@/lib/db"
import { generateId } from "@/lib/utils/id-generator"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const db = getDb()
    const { testId, studentId } = await request.json()

    if (!testId || !studentId) {
      return NextResponse.json({ error: "Test ID and Student ID required" }, { status: 400 })
    }

    const attemptId = generateId("att")
    db.prepare("INSERT INTO student_attempts (id, test_id, student_id, started_at, status) VALUES (?, ?, ?, ?, ?)").run(
      attemptId,
      testId,
      studentId,
      new Date().toISOString(),
      "in_progress",
    )

    return NextResponse.json({ attemptId })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create attempt" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const db = getDb()
    const { attemptId, answers } = await request.json()

    if (!attemptId || !answers) {
      return NextResponse.json({ error: "Attempt ID and answers required" }, { status: 400 })
    }

    // Save answers
    answers.forEach((answer: any) => {
      const answerId = generateId("ans")
      db.prepare("INSERT INTO student_answers (id, attempt_id, question_id, student_answer) VALUES (?, ?, ?, ?)").run(
        answerId,
        attemptId,
        answer.questionId,
        answer.answer,
      )
    })

    // Calculate marks
    const attempt = db.prepare("SELECT * FROM student_attempts WHERE id = ?").get(attemptId) as any
    const testQuestions = db
      .prepare(
        "SELECT q.id, q.marks, q.correct_answer FROM questions q JOIN test_questions tq ON q.id = tq.question_id WHERE tq.test_id = ?",
      )
      .all(attempt.test_id)

    let obtainedMarks = 0
    testQuestions.forEach((q: any) => {
      const studentAnswer = db
        .prepare("SELECT student_answer FROM student_answers WHERE attempt_id = ? AND question_id = ?")
        .get(attemptId, q.id) as any
      if (studentAnswer && studentAnswer.student_answer === q.correct_answer) {
        obtainedMarks += q.marks
        db.prepare(
          "UPDATE student_answers SET is_correct = 1, marks_obtained = ? WHERE attempt_id = ? AND question_id = ?",
        ).run(q.marks, attemptId, q.id)
      } else {
        db.prepare(
          "UPDATE student_answers SET is_correct = 0, marks_obtained = 0 WHERE attempt_id = ? AND question_id = ?",
        ).run(attemptId, q.id)
      }
    })

    db.prepare("UPDATE student_attempts SET submitted_at = ?, obtained_marks = ?, status = ? WHERE id = ?").run(
      new Date().toISOString(),
      obtainedMarks,
      "graded",
      attemptId,
    )

    return NextResponse.json({ attemptId, obtainedMarks })
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit attempt" }, { status: 500 })
  }
}
