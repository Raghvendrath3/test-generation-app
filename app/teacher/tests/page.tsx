"use client"

import { TestBuilder } from "@/components/teacher/test-builder"

export default function TestsPage() {
  const teacherId = "teacher_001" // In production, get from auth

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold mb-8">Create Tests</h1>
        <TestBuilder teacherId={teacherId} />
      </div>
    </div>
  )
}
