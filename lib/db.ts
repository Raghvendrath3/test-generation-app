import Database from "better-sqlite3"
import path from "path"
import fs from "fs"

let db: Database.Database | null = null

export function getDb() {
  if (!db) {
    const dataDir = path.join(process.cwd(), "data")
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    const dbPath = path.join(dataDir, "test-app.db")
    db = new Database(dbPath)
    db.pragma("journal_mode = WAL")
    initializeDatabase()
  }
  return db
}

function initializeDatabase() {
  const database = getDb()

  // Users table
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('teacher', 'student')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Subjects table
  database.exec(`
    CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      teacher_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (teacher_id) REFERENCES users(id)
    )
  `)

  // Chapters table
  database.exec(`
    CREATE TABLE IF NOT EXISTS chapters (
      id TEXT PRIMARY KEY,
      subject_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      order_index INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (subject_id) REFERENCES subjects(id)
    )
  `)

  // Questions table
  database.exec(`
    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      chapter_id TEXT NOT NULL,
      question_text TEXT NOT NULL,
      question_type TEXT NOT NULL CHECK(question_type IN ('mcq', 'short_answer', 'essay')),
      marks INTEGER DEFAULT 1,
      correct_answer TEXT NOT NULL,
      explanation TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (chapter_id) REFERENCES chapters(id)
    )
  `)

  // Options table (for MCQ)
  database.exec(`
    CREATE TABLE IF NOT EXISTS options (
      id TEXT PRIMARY KEY,
      question_id TEXT NOT NULL,
      option_text TEXT NOT NULL,
      order_index INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (question_id) REFERENCES questions(id)
    )
  `)

  // Tests table
  database.exec(`
    CREATE TABLE IF NOT EXISTS tests (
      id TEXT PRIMARY KEY,
      teacher_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      duration_minutes INTEGER NOT NULL,
      total_marks INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (teacher_id) REFERENCES users(id)
    )
  `)

  // Test Questions (many-to-many)
  database.exec(`
    CREATE TABLE IF NOT EXISTS test_questions (
      id TEXT PRIMARY KEY,
      test_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      order_index INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (test_id) REFERENCES tests(id),
      FOREIGN KEY (question_id) REFERENCES questions(id),
      UNIQUE(test_id, question_id)
    )
  `)

  // Student Attempts table
  database.exec(`
    CREATE TABLE IF NOT EXISTS student_attempts (
      id TEXT PRIMARY KEY,
      test_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      started_at DATETIME NOT NULL,
      submitted_at DATETIME,
      total_marks INTEGER DEFAULT 0,
      obtained_marks INTEGER DEFAULT 0,
      status TEXT NOT NULL CHECK(status IN ('in_progress', 'submitted', 'graded')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (test_id) REFERENCES tests(id),
      FOREIGN KEY (student_id) REFERENCES users(id)
    )
  `)

  // Student Answers table
  database.exec(`
    CREATE TABLE IF NOT EXISTS student_answers (
      id TEXT PRIMARY KEY,
      attempt_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      student_answer TEXT NOT NULL,
      is_correct BOOLEAN,
      marks_obtained INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (attempt_id) REFERENCES student_attempts(id),
      FOREIGN KEY (question_id) REFERENCES questions(id)
    )
  `)
}

export function closeDb() {
  if (db) {
    db.close()
    db = null
  }
}
