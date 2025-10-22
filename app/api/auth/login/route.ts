import { getDb } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

export async function POST(request: NextRequest) {
  try {
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

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    try {
      const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any
      if (!user) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }

      const hashedPassword = hashPassword(password)
      if (user.password !== hashedPassword) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }

      return NextResponse.json({ userId: user.id, name: user.name, email: user.email, role: user.role })
    } catch (queryError) {
      console.error("[v0] Query error:", queryError)
      return NextResponse.json({ error: "Database query failed" }, { status: 500 })
    }
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ error: "Login failed. Check server logs for details." }, { status: 500 })
  }
}
