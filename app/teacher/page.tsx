"use client"

import { useState } from "react"
import { SubjectManager } from "@/components/teacher/subject-manager"
import { QuestionManager } from "@/components/teacher/question-manager"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState("subjects")
  const [selectedChapter, setSelectedChapter] = useState<{ id: string; name: string } | null>(null)
  const teacherId = "teacher_001" // In production, get from auth

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold mb-8">Teacher Dashboard</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="subjects">Manage Subjects & Chapters</TabsTrigger>
            <TabsTrigger value="questions">Manage Questions</TabsTrigger>
          </TabsList>

          <TabsContent value="subjects" className="mt-6">
            <SubjectManager teacherId={teacherId} />
          </TabsContent>

          <TabsContent value="questions" className="mt-6">
            {selectedChapter ? (
              <div className="space-y-4">
                <button onClick={() => setSelectedChapter(null)} className="text-sm text-blue-600 hover:underline">
                  ← Back to chapters
                </button>
                <QuestionManager chapterId={selectedChapter.id} chapterName={selectedChapter.name} />
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  First, create subjects and chapters in the "Manage Subjects & Chapters" tab
                </p>
                <p className="text-sm text-muted-foreground">
                  Then come back here to add questions to specific chapters
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
