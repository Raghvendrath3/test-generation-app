"use client"

import { TestInterface } from "@/components/student/test-interface"

export default function StudentTestPage({ params }: { params: { testId: string } }) {
  const studentId = "student_001" // In production, get from auth

  return <TestInterface testId={params.testId} studentId={studentId} />
}
