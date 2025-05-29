"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { History, RotateCcw } from "lucide-react"
import Link from "next/link"
import CalculationResult from "@/components/calculation-result"
import LoadingOverlay from "@/components/loading-overlay"
import type { MedicalFeeInput, MedicalFeeResult } from "@/types/calculation"
import { calculateMedicalFees, saveCalculationToHistory, formatCurrency } from "@/utils/calculation"

export default function MedicalFeesForm() {
  const [incrementoEnabled, setIncrementoEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const initialFormData: MedicalFeeInput = {
    codigo: "",
    quantidadePontos: "",
    valorSP: "",
    valorSH: "",
    incremento: "",
    quantidadeAuxiliares: "",
  }

  const [formData, setFormData] = useState<MedicalFeeInput>(initialFormData)
  const [calculationResult, setCalculationResult] = useState<MedicalFeeResult | null>(null)

  const formatCode = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "")

    // Aplica a máscara xx.xx.xx.xxx-x
    let formatted = numbers
    if (numbers.length >= 2) {
      formatted = numbers.slice(0, 2) + "." + numbers.slice(2)
    }
    if (numbers.length >= 4) {
      formatted = numbers.slice(0, 2) + "." + numbers.slice(2, 4) + "." + numbers.slice(4)
    }
    if (numbers.length >= 6) {
      formatted = numbers.slice(0, 2) + "." + numbers.slice(2, 4) + "." + numbers.slice(4, 6) + "." + numbers.slice(6)
    }
    if (numbers.length >= 9) {
      formatted =
        numbers.slice(0, 2) +
        "." +
        numbers.slice(2, 4) +
        "." +
        numbers.slice(4, 6) +
        "." +
        numbers.slice(6, 9) +
        "-" +
        numbers.slice(9, 10)
    }

    return formatted
  }

  const handleInputChange = (field: string, value: string) => {
    if (field === "codigo") {
      const formatted = formatCode(value)
      setFormData((prev) => ({ ...prev, [field]: formatted }))
    } else if (field === "valorSP" || field === "valorSH") {
      // Remove tudo que não é número
      const numbers = value.replace(/\D/g, "")

      // Converte para centavos
      const amount = Number.parseFloat(numbers) / 100

      // Formata como moeda brasileira
      if (isNaN(amount)) {
        setFormData((prev) => ({ ...prev, [field]: "" }))
      } else {
        const formatted = formatCurrency(amount)
        setFormData((prev) => ({ ...prev, [field]: formatted }))
      }
    } else if (field === "quantidadePontos" || field === "quantidadeAuxiliares" || field === "incremento") {
      // Aceita apenas números
      const numbers = value.replace(/\D/g, "")
      setFormData((prev) => ({ ...prev, [field]: numbers }))
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Iniciar loading
    setIsLoading(true)
  }

  const handleClearForm = () => {
    setFormData(initialFormData)
    setIncrementoEnabled(false)
    setCalculationResult(null)
  }

  const handleLoadingComplete = () => {
    // Calcular os honorários médicos
    const result = calculateMedicalFees(formData)

    // Atualizar o estado com o resultado
    setCalculationResult(result)

    // Salvar no histórico (localStorage)
    saveCalculationToHistory(result)

    // Finalizar loading
    setIsLoading(false)
  }

  return (
    <div className="space-y-6">
      <LoadingOverlay isVisible={isLoading} onComplete={handleLoadingComplete} />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dattra v.0.1.0-beta</h1>
        <Link href="/historico">
          <Button variant="outline" className="cursor-pointer">
            <History className="h-4 w-4 mr-2" />
            Ver Histórico
          </Button>
        </Link>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Cálculo de Honorários Médicos</CardTitle>
          <CardDescription>Preencha os campos abaixo para calcular os honorários médicos</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código</Label>
              <Input
                id="codigo"
                placeholder="00.00.00.000-0"
                value={formData.codigo}
                onChange={(e) => handleInputChange("codigo", e.target.value)}
                maxLength={14}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantidadePontos">Quantidade de Pontos</Label>
              <Input
                id="quantidadePontos"
                placeholder="Digite a quantidade de pontos"
                value={formData.quantidadePontos}
                onChange={(e) => handleInputChange("quantidadePontos", e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valorSP">Valor SP</Label>
                <Input
                  id="valorSP"
                  placeholder="R$ 0,00"
                  value={formData.valorSP}
                  onChange={(e) => handleInputChange("valorSP", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valorSH">Valor SH</Label>
                <Input
                  id="valorSH"
                  placeholder="R$ 0,00"
                  value={formData.valorSH}
                  onChange={(e) => handleInputChange("valorSH", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="incremento-switch" className="cursor-pointer" checked={incrementoEnabled} onCheckedChange={setIncrementoEnabled} />
                <Label htmlFor="incremento-switch">Incremento</Label>
              </div>

              {incrementoEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="incremento">Valor do Incremento (%)</Label>
                  <Input
                    id="incremento"
                    placeholder="Digite o valor do incremento"
                    value={formData.incremento}
                    onChange={(e) => handleInputChange("incremento", e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantidadeAuxiliares">Quantidade de Auxiliares</Label>
              <Input
                id="quantidadeAuxiliares"
                placeholder="Digite a quantidade de auxiliares"
                value={formData.quantidadeAuxiliares}
                onChange={(e) => handleInputChange("quantidadeAuxiliares", e.target.value)}
                required
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="flex-1 cursor-pointer" disabled={isLoading}>
                {isLoading ? "Calculando..." : "Calcular"}
              </Button>
              <Button type="button" variant="outline" className="cursor-pointer" onClick={handleClearForm} disabled={isLoading}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {calculationResult && <CalculationResult result={calculationResult} />}
    </div>
  )
}
