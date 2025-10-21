import { getDb } from "@/lib/db"
import { generateId } from "@/lib/utils/id-generator"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const db = getDb()
    const subjectId = request.nextUrl.searchParams.get("subjectId")

    if (!subjectId) {
      return NextResponse.json({ error: "Subject ID required" }, { status: 400 })
    }

    const chapters = db.prepare("SELECT * FROM chapters WHERE subject_id = ? ORDER BY order_index ASC").all(subjectId)
    return NextResponse.json(chapters)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch chapters" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb()
    const { subjectId, name, description } = await request.json()

    if (!subjectId || !name) {
      return NextResponse.json({ error: "Subject ID and name required" }, { status: 400 })
    }

    const maxOrder = db
      .prepare("SELECT MAX(order_index) as max FROM chapters WHERE subject_id = ?")
      .get(subjectId) as any
    const orderIndex = (maxOrder?.max || 0) + 1

    const id = generateId("chap")
    db.prepare("INSERT INTO chapters (id, subject_id, name, description, order_index) VALUES (?, ?, ?, ?, ?)").run(
      id,
      subjectId,
      name,
      description || null,
      orderIndex,
    )

    return NextResponse.json({ id, subjectId, name, description, orderIndex })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create chapter" }, { status: 500 })
  }
}
