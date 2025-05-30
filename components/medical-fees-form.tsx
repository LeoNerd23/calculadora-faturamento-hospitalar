"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { History, RotateCcw, AlertCircle, Calculator, User, Users } from "lucide-react"
import Link from "next/link"
import CalculationResult from "@/components/calculation-result"
import LoadingOverlay  from "@/components/loading-overlay"
import type { MedicalFeeInput, MedicalFeeResult } from "@/types/calculation"
import { calculateMedicalFees, saveCalculationToHistory, formatCurrency } from "@/utils/calculation"
import Image from 'next/image'

export default function MedicalFeesForm() {
  const [incrementoEnabled, setIncrementoEnabled] = useState(false)
  const [anestesistaEnabled, setAnestesistaEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const initialFormData: MedicalFeeInput = {
    codigo: "",
    quantidadePontos: "",
    valorSP: "",
    valorSH: "",
    valorTSP: "",
    incremento: "",
    quantidadeAuxiliares: "0",
  }

  const [formData, setFormData] = useState<MedicalFeeInput>(initialFormData)
  const [calculationResult, setCalculationResult] = useState<MedicalFeeResult | null>(null)

  const validateCodigo = (codigo: string) => {
    const numbers = codigo.replace(/\D/g, "")
    if (numbers.length !== 10) {
      return "O código deve ter exatamente 10 dígitos"
    }
    if (!numbers.startsWith("0")) {
      return "O código deve começar com 0"
    }
    return ""
  }

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

      // Validar código
      const error = validateCodigo(formatted)
      setErrors((prev) => ({ ...prev, codigo: error }))
    } else if (field === "valorSP" || field === "valorSH" || field === "valorTSP") {
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
    } else if (field === "quantidadePontos" || field === "incremento") {
      // Aceita apenas números
      const numbers = value.replace(/\D/g, "")
      setFormData((prev) => ({ ...prev, [field]: numbers }))
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validar código antes de submeter
    const codigoError = validateCodigo(formData.codigo)
    if (codigoError) {
      setErrors((prev) => ({ ...prev, codigo: codigoError }))
      return
    }

    // Iniciar loading
    setIsLoading(true)
  }

  const handleClearForm = () => {
    setFormData(initialFormData)
    setIncrementoEnabled(false)
    setAnestesistaEnabled(false)
    setCalculationResult(null)
    setErrors({})
  }

  const handleLoadingComplete = () => {
    // Calcular os honorários médicos
    const result = calculateMedicalFees({
      ...formData,
      anestesistaEnabled,
    })

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

      <div className="flex items-center justify-center">
        <Image src="/dattra-logo.png" alt="Logo da Dattra" width={150} height={50} />
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator />
          Cálculo de Procedimentos Hospitalares</CardTitle>
          <CardDescription>
            Preencha os campos abaixo para calcular os valores do Serviço Profissional e Hospitalar da AIH
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código</Label>
                <Input
                  id="codigo"
                  placeholder="00.00.00.000-0"
                  value={formData.codigo}
                  onChange={(e) => handleInputChange("codigo", e.target.value)}
                  maxLength={14}
                  required
                  className={errors.codigo ? "border-red-500" : ""}
                />
                {errors.codigo && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.codigo}</AlertDescription>
                  </Alert>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantidadePontos">Quantidade de Pontos</Label>
                <Input
                  id="quantidadePontos"
                  type="number"
                  placeholder="Digite a quantidade de pontos"
                  value={formData.quantidadePontos}
                  onChange={(e) => handleInputChange("quantidadePontos", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              <div className="space-y-2">
                <Label htmlFor="valorTSP">Valor TSP</Label>
                <Input
                  id="valorTSP"
                  placeholder="R$ 0,00"
                  value={formData.valorTSP}
                  onChange={(e) => handleInputChange("valorTSP", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
              <Switch
                  id="anestesista-switch"
                  className="cursor-pointer"
                  checked={anestesistaEnabled}
                  onCheckedChange={setAnestesistaEnabled}
                />
                <Label htmlFor="anestesista-switch">Inclui Valor da Anestesia</Label>
                <Switch
                  id="incremento-switch"
                  className="cursor-pointer"
                  checked={incrementoEnabled}
                  onCheckedChange={setIncrementoEnabled}
                />
                <Label htmlFor="incremento-switch">Incremento</Label>
              </div>

              {incrementoEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="incremento">Valor do Incremento (%)</Label>
                  <Input
                    id="incremento"
                    type="number"
                    placeholder="Digite o valor do incremento"
                    value={formData.incremento}
                    onChange={(e) => handleInputChange("incremento", e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantidadeAuxiliares">Quantidade de Auxiliares</Label>
              <Select
                value={formData.quantidadeAuxiliares}
                onValueChange={(value) => handleInputChange("quantidadeAuxiliares", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a quantidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0"> <User color="#050606" />0 Auxiliar</SelectItem>
                  <SelectItem value="1"> <User color="#050606" />1 Auxiliar</SelectItem>
                  <SelectItem value="2"><Users color="#050606" />2 Auxiliares</SelectItem>
                  <SelectItem value="3"><Users color="#050606" />3 Auxiliares</SelectItem>
                  <SelectItem value="4"><Users color="#050606" />4 Auxiliares</SelectItem>
                  <SelectItem value="5"><Users color="#050606" />5 Auxiliares</SelectItem>
                </SelectContent>
              </Select>
            </div>
            

            <div className="flex gap-3">
              <Button type="submit" className="flex-1 cursor-pointer" disabled={isLoading}>
                {isLoading ? "Calculando..." : "Calcular"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer gap-2"
                onClick={handleClearForm}
                disabled={isLoading}
              >
                <RotateCcw className="h-4 w-4" />
                Limpar
              </Button>
              <Link href="/historico">
                <Button variant="outline" className="cursor-pointer">
                  <History className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {calculationResult && <CalculationResult result={calculationResult} />}
    </div>
  )
}
