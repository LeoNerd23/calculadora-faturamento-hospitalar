"use client"

import { useState, useEffect } from "react"
import HistoryList from "@/components/history-list"
import { getCalculationHistory } from "@/utils/calculation"
import type { MedicalFeeResult } from "@/types/calculation"

export default function HistoricoPage() {
  const [history, setHistory] = useState<MedicalFeeResult[]>([])

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = () => {
    const savedHistory = getCalculationHistory()
    setHistory(savedHistory)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <HistoryList history={history} onHistoryChange={loadHistory} />
      </div>
    </main>
  )
}
