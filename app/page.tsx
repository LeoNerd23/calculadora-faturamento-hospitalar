"use client"

import { Card } from "@/components/ui/card"
import MedicalFeesForm from "../components/medical-fees-form"
import Image from 'next/image'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <MedicalFeesForm />
      </div>
      <Card className="border-0 shadow-none rounded-none">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col items-center space-y-4">
            <Image src="/dattra-icon.png" alt="Logo da Dattra" width={30} height={50} />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Todos os direitos reservados Mariana Alcantara</p>
              <p className="text-sm text-muted-foreground">v0.1.0-beta</p>
            </div>
          </div>
        </div>
      </Card>
    </main>
  )
}