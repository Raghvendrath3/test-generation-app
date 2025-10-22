import { getDb } from "@/lib/db"
import { generateId } from "@/lib/utils/id-generator"
import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role } = await request.json()

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!["teacher", "student"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    let db
    try {
      db = getDb()
    } catch (dbError) {
      console.error("[v0] Database connection error:", dbError)
      return NextResponse.json(
        { error: "Database connection failed. Please ensure better-sqlite3 is installed." },
        { status: 500 },
      )
    }

    // Check if user exists
    try {
      const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email)
      if (existing) {
        return NextResponse.json({ error: "Email already registered" }, { status: 400 })
      }
    } catch (queryError) {
      console.error("[v0] Query error:", queryError)
      return NextResponse.json({ error: "Database query failed" }, { status: 500 })
    }

    const userId = generateId(role === "teacher" ? "teach" : "stud")
    const hashedPassword = hashPassword(password)

    try {
      db.prepare("INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)").run(
        userId,
        name,
        email,
        hashedPassword,
        role,
      )
    } catch (insertError) {
      console.error("[v0] Insert error:", insertError)
      return NextResponse.json({ error: "Failed to create user account" }, { status: 500 })
    }

    return NextResponse.json({ userId, name, email, role })
  } catch (error) {
    console.error("[v0] Registration error:", error)
    return NextResponse.json({ error: "Registration failed. Check server logs for details." }, { status: 500 })
  }
}
