"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface LoadingOverlayProps {
  isVisible: boolean
  onComplete: () => void
}

const messages = ["Estamos fazendo os cálculos para você", "Só mais um segundo", "Pronto!"]

export default function LoadingOverlay({ isVisible, onComplete }: LoadingOverlayProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)

  useEffect(() => {
    if (!isVisible) return

    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => {
        if (prev < messages.length - 1) {
          return prev + 1
        }
        return prev
      })
    }, 1300)

    const completeTimeout = setTimeout(() => {
      onComplete()
      setCurrentMessageIndex(0)
    }, 4000)

    return () => {
      clearInterval(messageInterval)
      clearTimeout(completeTimeout)
    }
  }, [isVisible, onComplete])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blur overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

      {/* Loading card */}
      <Card className="relative z-10 w-80">
        <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-center text-sm font-medium">{messages[currentMessageIndex]}</p>
        </CardContent>
      </Card>
    </div>
  )
}
