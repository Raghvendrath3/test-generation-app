import { getDb } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb()
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const hashedPassword = hashPassword(password)
    if (user.password !== hashedPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    return NextResponse.json({ userId: user.id, name: user.name, email: user.email, role: user.role })
  } catch (error) {
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
