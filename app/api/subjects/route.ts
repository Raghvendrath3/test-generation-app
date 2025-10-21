import { getDb } from "@/lib/db"
import { generateId } from "@/lib/utils/id-generator"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const db = getDb()
    const teacherId = request.nextUrl.searchParams.get("teacherId")

    if (!teacherId) {
      return NextResponse.json({ error: "Teacher ID required" }, { status: 400 })
    }

    const subjects = db.prepare("SELECT * FROM subjects WHERE teacher_id = ? ORDER BY created_at DESC").all(teacherId)
    return NextResponse.json(subjects)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch subjects" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb()
    const { name, description, teacherId } = await request.json()

    if (!name || !teacherId) {
      return NextResponse.json({ error: "Name and teacherId required" }, { status: 400 })
    }

    const id = generateId("subj")
    db.prepare("INSERT INTO subjects (id, name, description, teacher_id) VALUES (?, ?, ?, ?)").run(
      id,
      name,
      description || null,
      teacherId,
    )

    return NextResponse.json({ id, name, description, teacherId })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create subject" }, { status: 500 })
  }
}
