"use client"

import { useState, useEffect } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, LogOut } from "lucide-react"

export default function Home() {
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("user")
    setUser(null)
  }

  const handleAuthSuccess = (userData: any) => {
    setUser(userData)
    if (userData.role === "teacher") {
      window.location.href = "/teacher"
    } else {
      window.location.href = "/student/tests"
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-blue-900">Test Generation App</h1>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6 text-center space-y-6">
              <div>
                <p className="text-muted-foreground mb-2">Welcome back,</p>
                <h2 className="text-3xl font-bold">{user.name}</h2>
                <p className="text-sm text-muted-foreground mt-1">Role: {user.role}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {user.role === "teacher" ? (
                  <>
                    <Button size="lg" onClick={() => (window.location.href = "/teacher")}>
                      Manage Subjects & Chapters
                    </Button>
                    <Button size="lg" onClick={() => (window.location.href = "/teacher/tests")}>
                      Create Tests
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="lg" onClick={() => (window.location.href = "/student/tests")}>
                      Available Tests
                    </Button>
                    <Button size="lg" variant="outline" disabled>
                      My Results
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="h-10 w-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-blue-900">Test Generation App</h1>
          </div>
          <p className="text-lg text-gray-600">Create, manage, and take tests with ease</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Features</h2>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold">✓</span>
                <span>Create subjects and chapters</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold">✓</span>
                <span>Add questions with multiple choice, short answer, and essay types</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold">✓</span>
                <span>Build tests from selected chapters</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold">✓</span>
                <span>Set test duration and automatic submission</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold">✓</span>
                <span>Instant results and PDF download</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold">✓</span>
                <span>Answers hidden during test attempts</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            {authMode === "login" ? (
              <>
                <LoginForm onSuccess={handleAuthSuccess} />
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Don't have an account?</p>
                  <Button variant="link" onClick={() => setAuthMode("register")}>
                    Create one now
                  </Button>
                </div>
              </>
            ) : (
              <>
                <RegisterForm onSuccess={handleAuthSuccess} />
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Already have an account?</p>
                  <Button variant="link" onClick={() => setAuthMode("login")}>
                    Sign in here
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
