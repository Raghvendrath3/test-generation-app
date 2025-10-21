"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, ChevronDown, ChevronUp } from "lucide-react"

interface Subject {
  id: string
  name: string
  description: string
  teacher_id: string
}

interface Chapter {
  id: string
  subject_id: string
  name: string
  description: string
  order_index: number
}

export function SubjectManager({ teacherId }: { teacherId: string }) {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [chapters, setChapters] = useState<Record<string, Chapter[]>>({})
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null)
  const [newSubjectName, setNewSubjectName] = useState("")
  const [newSubjectDesc, setNewSubjectDesc] = useState("")
  const [newChapterName, setNewChapterName] = useState("")
  const [newChapterDesc, setNewChapterDesc] = useState("")
  const [selectedSubjectForChapter, setSelectedSubjectForChapter] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSubjects()
  }, [teacherId])

  const fetchSubjects = async () => {
    try {
      const res = await fetch(`/api/subjects?teacherId=${teacherId}`)
      const data = await res.json()
      setSubjects(data)
    } catch (error) {
      console.error("Failed to fetch subjects:", error)
    }
  }

  const fetchChapters = async (subjectId: string) => {
    try {
      const res = await fetch(`/api/chapters?subjectId=${subjectId}`)
      const data = await res.json()
      setChapters((prev) => ({ ...prev, [subjectId]: data }))
    } catch (error) {
      console.error("Failed to fetch chapters:", error)
    }
  }

  const handleAddSubject = async () => {
    if (!newSubjectName.trim()) return

    setLoading(true)
    try {
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSubjectName,
          description: newSubjectDesc,
          teacherId,
        }),
      })
      const newSubject = await res.json()
      setSubjects([...subjects, newSubject])
      setNewSubjectName("")
      setNewSubjectDesc("")
    } catch (error) {
      console.error("Failed to add subject:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddChapter = async () => {
    if (!newChapterName.trim() || !selectedSubjectForChapter) return

    setLoading(true)
    try {
      const res = await fetch("/api/chapters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: selectedSubjectForChapter,
          name: newChapterName,
          description: newChapterDesc,
        }),
      })
      const newChapter = await res.json()
      setChapters((prev) => ({
        ...prev,
        [selectedSubjectForChapter]: [...(prev[selectedSubjectForChapter] || []), newChapter],
      }))
      setNewChapterName("")
      setNewChapterDesc("")
    } catch (error) {
      console.error("Failed to add chapter:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleSubject = (subjectId: string) => {
    if (expandedSubject === subjectId) {
      setExpandedSubject(null)
    } else {
      setExpandedSubject(subjectId)
      if (!chapters[subjectId]) {
        fetchChapters(subjectId)
      }
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Subject</CardTitle>
          <CardDescription>Create a new subject for your syllabus</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Subject Name"
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(e.target.value)}
          />
          <Textarea
            placeholder="Subject Description (optional)"
            value={newSubjectDesc}
            onChange={(e) => setNewSubjectDesc(e.target.value)}
          />
          <Button onClick={handleAddSubject} disabled={loading} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Subject
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Your Subjects</h3>
        {subjects.length === 0 ? (
          <p className="text-sm text-muted-foreground">No subjects yet. Create one to get started.</p>
        ) : (
          subjects.map((subject) => (
            <Card key={subject.id}>
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent"
                onClick={() => toggleSubject(subject.id)}
              >
                <div className="flex-1">
                  <h4 className="font-semibold">{subject.name}</h4>
                  {subject.description && <p className="text-sm text-muted-foreground">{subject.description}</p>}
                </div>
                {expandedSubject === subject.id ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>

              {expandedSubject === subject.id && (
                <CardContent className="border-t pt-4 space-y-4">
                  <div className="space-y-3">
                    <h5 className="font-semibold text-sm">Chapters</h5>
                    {chapters[subject.id]?.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No chapters yet.</p>
                    ) : (
                      <ul className="space-y-2">
                        {chapters[subject.id]?.map((chapter) => (
                          <li key={chapter.id} className="flex items-center justify-between p-2 bg-muted rounded">
                            <div>
                              <p className="font-medium text-sm">{chapter.name}</p>
                              {chapter.description && (
                                <p className="text-xs text-muted-foreground">{chapter.description}</p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <h5 className="font-semibold text-sm">Add Chapter</h5>
                    <Input
                      placeholder="Chapter Name"
                      value={selectedSubjectForChapter === subject.id ? newChapterName : ""}
                      onChange={(e) => {
                        setSelectedSubjectForChapter(subject.id)
                        setNewChapterName(e.target.value)
                      }}
                    />
                    <Textarea
                      placeholder="Chapter Description (optional)"
                      value={selectedSubjectForChapter === subject.id ? newChapterDesc : ""}
                      onChange={(e) => {
                        setSelectedSubjectForChapter(subject.id)
                        setNewChapterDesc(e.target.value)
                      }}
                    />
                    <Button
                      onClick={handleAddChapter}
                      disabled={loading || selectedSubjectForChapter !== subject.id}
                      className="w-full"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Chapter
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
