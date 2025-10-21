import { getDb } from "@/lib/db"
import { generateId } from "@/lib/utils/id-generator"
import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb()
    const { name, email, password, role } = await request.json()

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!["teacher", "student"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    // Check if user exists
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email)
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    const userId = generateId(role === "teacher" ? "teach" : "stud")
    const hashedPassword = hashPassword(password)

    db.prepare("INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)").run(
      userId,
      name,
      email,
      hashedPassword,
      role,
    )

    return NextResponse.json({ userId, name, email, role })
  } catch (error) {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
