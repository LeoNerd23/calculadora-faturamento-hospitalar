"use client"

import MedicalFeesForm from "../components/medical-fees-form"

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <MedicalFeesForm />
      </div>
    </main>
  )
}