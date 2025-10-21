"use client"

import { ResultsDisplay } from "@/components/student/results-display"

export default function ResultsPage({ params }: { params: { attemptId: string } }) {
  return <ResultsDisplay attemptId={params.attemptId} />
}
