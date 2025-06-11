"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { History, RotateCcw, Calculator, User, Users, Info } from "lucide-react"
import Link from "next/link"
import CalculationResult from "@/components/calculation-result"
import LoadingOverlay from "@/components/loading-overlay"
import MultiplosProcedimentos from "@/components/multiplos-procedimentos"
import type { MedicalFeeInput, MedicalFeeResult, ProcedimentoSelecionado } from "@/types/calculation"
import { calculateMedicalFees, saveCalculationToHistory, formatCurrency } from "@/utils/calculation"
import Image from "next/image"
import { PROCEDIMENTOS_DATABASE } from "@/data/procedimentos"

// Campos obrigatórios
const requiredFields = ["codigo", "quantidadePontos", "valorSP", "valorSH"]

export default function MedicalFeesForm() {
  const [incrementoEnabled, setIncrementoEnabled] = useState(false)
  const [anestesistaEnabled, setAnestesistaEnabled] = useState(false)
  const [multiplosProcedimentosEnabled, setMultiplosProcedimentosEnabled] = useState(false)
  const [procedimentos, setProcedimentos] = useState<ProcedimentoSelecionado[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isClearing, setIsClearing] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [procedimentoPrincipal, setProcedimentoPrincipal] = useState("")

  const initialFormData: MedicalFeeInput = {
    codigo: "",
    quantidadePontos: "",
    valorSP: "",
    valorSH: "",
    valorTSP: "",
    incremento: "",
    quantidadeAuxiliares: "0",
    multiplosProcedimentos: false,
    procedimentos: [],
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

    // Limita a 10 dígitos
    const limitedNumbers = numbers.slice(0, 10)

    // Aplica a máscara xx.xx.xx.xxx-x apenas se houver números
    if (limitedNumbers.length === 0) return ""

    let formatted = limitedNumbers

    if (limitedNumbers.length > 2) {
      formatted = limitedNumbers.slice(0, 2) + "." + limitedNumbers.slice(2)
    }
    if (limitedNumbers.length > 4) {
      formatted = limitedNumbers.slice(0, 2) + "." + limitedNumbers.slice(2, 4) + "." + limitedNumbers.slice(4)
    }
    if (limitedNumbers.length > 6) {
      formatted =
        limitedNumbers.slice(0, 2) +
        "." +
        limitedNumbers.slice(2, 4) +
        "." +
        limitedNumbers.slice(4, 6) +
        "." +
        limitedNumbers.slice(6)
    }
    if (limitedNumbers.length > 9) {
      formatted =
        limitedNumbers.slice(0, 2) +
        "." +
        limitedNumbers.slice(2, 4) +
        "." +
        limitedNumbers.slice(4, 6) +
        "." +
        limitedNumbers.slice(6, 9) +
        "-" +
        limitedNumbers.slice(9)
    }

    return formatted
  }

  const handleInputChange = (field: string, value: string) => {
    // Limpar erro quando o usuário começa a digitar
    if (errors[field]) {
      clearFieldError(field)
    }

    if (field === "codigo") {
      const formatted = formatCode(value)
      setFormData((prev) => ({ ...prev, [field]: formatted }))
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

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    let isValid = true

    if (multiplosProcedimentosEnabled) {
      // Validar procedimento principal
      if (!procedimentoPrincipal) {
        newErrors.procedimentoPrincipal = "Selecione um procedimento principal"
        isValid = false
      }

      // Validar procedimentos
      if (procedimentos.length === 0) {
        newErrors.procedimentos = "Adicione pelo menos um procedimento"
        isValid = false
      } else {
        // Verificar se todos os procedimentos têm os campos obrigatórios preenchidos
        procedimentos.forEach((proc, index) => {
          if (!proc.codigo || proc.codigo.trim() === "") {
            newErrors[`procedimento_${index}_codigo`] = "Campo obrigatório"
            isValid = false
          }
          if (!proc.quantidadePontos || proc.quantidadePontos.trim() === "") {
            newErrors[`procedimento_${index}_quantidadePontos`] = "Campo obrigatório"
            isValid = false
          }
          if (!proc.valorSP || proc.valorSP.trim() === "") {
            newErrors[`procedimento_${index}_valorSP`] = "Campo obrigatório"
            isValid = false
          }
          if (!proc.valorSH || proc.valorSH.trim() === "") {
            newErrors[`procedimento_${index}_valorSH`] = "Campo obrigatório"
            isValid = false
          }
        })
      }
    } else {
      // Validar campos obrigatórios do formulário principal
      requiredFields.forEach((field) => {
        const value = formData[field as keyof MedicalFeeInput]
        if (!value || value.toString().trim() === "") {
          newErrors[field] = "Campo obrigatório"
          isValid = false
        }
      })

      // Validar código se estiver preenchido
      if (formData.codigo && formData.codigo.trim() !== "") {
        const codigoError = validateCodigo(formData.codigo)
        if (codigoError) {
          newErrors.codigo = codigoError
          isValid = false
        }
      }
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormSubmitted(true)

    // Validar formulário
    if (!validateForm()) {
      return
    }

    // Iniciar loading
    setIsLoading(true)
  }

  const handleClearForm = () => {
    // Ativar animação
    setIsClearing(true)

    // Limpar formulário
    setFormData(initialFormData)
    setIncrementoEnabled(false)
    setAnestesistaEnabled(false)
    setMultiplosProcedimentosEnabled(false)
    setProcedimentos([])
    setCalculationResult(null)
    setErrors({})
    setFormSubmitted(false)
    setProcedimentoPrincipal("")

    // Remover animação após 600ms
    setTimeout(() => {
      setIsClearing(false)
    }, 600)
  }

  const handleLoadingComplete = () => {
    // Calcular os honorários médicos
    const result = calculateMedicalFees({
      ...formData,
      anestesistaEnabled,
      multiplosProcedimentos: multiplosProcedimentosEnabled,
      procedimentos,
      procedimentoPrincipal,
    })

    // Atualizar o estado com o resultado
    setCalculationResult(result)

    // Salvar no histórico (localStorage)
    saveCalculationToHistory(result)

    // Finalizar loading
    setIsLoading(false)
  }

  const handleToggleMultiplosProcedimentos = (checked: boolean) => {
    setMultiplosProcedimentosEnabled(checked)
    if (!checked) {
      setProcedimentos([])
      setProcedimentoPrincipal("")
    } else if (procedimentos.length === 0) {
      // Adicionar primeiro procedimento automaticamente apenas se não houver nenhum
      setProcedimentos([
        {
          id: `proc_${Date.now()}`,
          codigo: "",
          descricao: "",
          porcentagens: [],
          auxiliaresSugeridos: 0, // Usar o nome correto
          quantidadePontos: "",
          valorSP: "",
          valorSH: "",
          valorTSP: "",
          incremento: "",
          quantidadeAuxiliares: "0",
          anestesistaEnabled: false,
          incrementoEnabled: false,
        },
      ])
    }
  }

  const clearFieldError = (fieldName: string) => {
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
    }
  }

  return (
    <div className="space-y-6">
      <LoadingOverlay isVisible={isLoading} onComplete={handleLoadingComplete} />

      <div className="flex items-center justify-center">
        <Image src="/dattra-logo.png" alt="Logo da Dattra" width={150} height={50} />
      </div>

      {/* Layout responsivo: empilhado em mobile, lado a lado em desktop */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Coluna da Calculadora */}
        <div className="space-y-6">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator />
                  Cálculo de Procedimentos Hospitalares
                </div>
                <p className="text-sm text-muted-foreground">v0.2.0-beta</p>
              </CardTitle>
              <CardDescription>
                Preencha os campos abaixo para calcular os valores do Serviço Profissional e Hospitalar da AIH
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="multiplos-procedimentos-switch"
                      className="cursor-pointer"
                      checked={multiplosProcedimentosEnabled}
                      onCheckedChange={handleToggleMultiplosProcedimentos}
                    />
                    <Label htmlFor="multiplos-procedimentos-switch">Múltiplos Procedimentos</Label>
                  </div>

                  {multiplosProcedimentosEnabled && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="procedimento-principal"
                          className={errors.procedimentoPrincipal ? "text-red-500" : ""}
                        >
                          Procedimento Principal (AIH) <span className="text-red-500 font-bold">*</span>
                        </Label>
                        {errors.procedimentoPrincipal && (
                          <span className="text-xs text-red-500 font-medium">{errors.procedimentoPrincipal}</span>
                        )}
                      </div>
                      <Select
                        value={procedimentoPrincipal}
                        onValueChange={(value) => {
                          setProcedimentoPrincipal(value)
                          clearFieldError("procedimentoPrincipal")
                          // Atualizar procedimentos existentes com as novas porcentagens
                          const procedimentoDb = PROCEDIMENTOS_DATABASE.find((p) => p.codigo === value)
                          if (procedimentoDb) {
                            const novasPorcentagens = [
                              procedimentoDb.linha1,
                              procedimentoDb.linha2,
                              procedimentoDb.linha3,
                              procedimentoDb.linha4,
                              procedimentoDb.linha5,
                            ].filter((p) => p > 0)

                            const procedimentosAtualizados = procedimentos.map((proc) => ({
                              ...proc,
                              porcentagens: novasPorcentagens,
                            }))
                            setProcedimentos(procedimentosAtualizados)
                          }
                        }}
                      >
                        <SelectTrigger
                          className={errors.procedimentoPrincipal ? "border-red-500 focus-visible:ring-red-500" : ""}
                        >
                          <SelectValue placeholder="Selecione o procedimento principal">
                            {procedimentoPrincipal && (
                              <div className="flex items-center gap-2 w-full min-w-0">
                                <span className="font-medium flex-shrink-0">{procedimentoPrincipal}</span>
                                <span className="text-xs text-muted-foreground truncate flex-1 min-w-0">
                                  {PROCEDIMENTOS_DATABASE.find((p) => p.codigo === procedimentoPrincipal)?.descricao}
                                </span>
                              </div>
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="max-w-[calc(100vw-2rem)] w-auto">
                          {PROCEDIMENTOS_DATABASE.map((proc) => (
                            <SelectItem key={proc.codigo} value={proc.codigo} className="max-w-none">
                              <div className="flex flex-col w-full min-w-0">
                                <span className="font-medium">{proc.codigo}</span>
                                <span className="text-xs text-muted-foreground break-words">{proc.descricao}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Calculadora principal - só exibida quando múltiplos procedimentos NÃO está ativado */}
                {!multiplosProcedimentosEnabled && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="codigo" className={errors.codigo ? "text-red-500" : ""}>
                            Código <span className="text-red-500 font-bold">*</span>
                          </Label>
                          {errors.codigo && <span className="text-xs text-red-500 font-medium">{errors.codigo}</span>}
                        </div>
                        <Input
                          id="codigo"
                          type="tel"
                          placeholder="00.00.00.000-0"
                          value={formData.codigo}
                          onChange={(e) => handleInputChange("codigo", e.target.value)}
                          className={errors.codigo ? "border-red-500 focus-visible:ring-red-500" : ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="quantidadePontos" className={errors.quantidadePontos ? "text-red-500" : ""}>
                            Quantidade de Pontos <span className="text-red-500 font-bold">*</span>
                          </Label>
                          {errors.quantidadePontos && (
                            <span className="text-xs text-red-500 font-medium">{errors.quantidadePontos}</span>
                          )}
                        </div>
                        <Input
                          id="quantidadePontos"
                          type="tel"
                          inputMode="numeric"
                          placeholder="Digite a quantidade de pontos"
                          value={formData.quantidadePontos}
                          onChange={(e) => handleInputChange("quantidadePontos", e.target.value)}
                          className={errors.quantidadePontos ? "border-red-500 focus-visible:ring-red-500" : ""}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="valorSP" className={errors.valorSP ? "text-red-500" : ""}>
                            Valor SP <span className="text-red-500 font-bold">*</span>
                          </Label>
                          {errors.valorSP && <span className="text-xs text-red-500 font-medium">{errors.valorSP}</span>}
                        </div>
                        <Input
                          id="valorSP"
                          type="tel"
                          inputMode="numeric"
                          placeholder="R$ 0,00"
                          value={formData.valorSP}
                          onChange={(e) => handleInputChange("valorSP", e.target.value)}
                          className={errors.valorSP ? "border-red-500 focus-visible:ring-red-500" : ""}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="valorSH" className={errors.valorSH ? "text-red-500" : ""}>
                            Valor SH <span className="text-red-500 font-bold">*</span>
                          </Label>
                          {errors.valorSH && <span className="text-xs text-red-500 font-medium">{errors.valorSH}</span>}
                        </div>
                        <Input
                          id="valorSH"
                          type="tel"
                          inputMode="numeric"
                          placeholder="R$ 0,00"
                          value={formData.valorSH}
                          onChange={(e) => handleInputChange("valorSH", e.target.value)}
                          className={errors.valorSH ? "border-red-500 focus-visible:ring-red-500" : ""}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="valorTSP">Valor TSP</Label>
                        <Input
                          id="valorTSP"
                          type="tel"
                          inputMode="numeric"
                          placeholder="R$ 0,00"
                          value={formData.valorTSP}
                          onChange={(e) => handleInputChange("valorTSP", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="anestesista-switch"
                          className="cursor-pointer"
                          checked={anestesistaEnabled}
                          onCheckedChange={setAnestesistaEnabled}
                        />
                        <Label htmlFor="anestesista-switch">Inclui Valor da Anestesia</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="incremento-switch"
                          className="cursor-pointer"
                          checked={incrementoEnabled}
                          onCheckedChange={setIncrementoEnabled}
                        />
                        <Label htmlFor="incremento-switch">Incremento</Label>
                      </div>
                    </div>

                    {incrementoEnabled && (
                      <div className="space-y-2">
                        <Label htmlFor="incremento">Valor do Incremento (%)</Label>
                        <Input
                          id="incremento"
                          type="text"
                          inputMode="numeric"
                          placeholder="Digite o valor do incremento"
                          value={formData.incremento}
                          onChange={(e) => handleInputChange("incremento", e.target.value)}
                        />
                      </div>
                    )}

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
                          <SelectItem value="0">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" color="#050606" />0 Auxiliar
                            </div>
                          </SelectItem>
                          <SelectItem value="1">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" color="#050606" />1 Auxiliar
                            </div>
                          </SelectItem>
                          <SelectItem value="2">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" color="#050606" />2 Auxiliares
                            </div>
                          </SelectItem>
                          <SelectItem value="3">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" color="#050606" />3 Auxiliares
                            </div>
                          </SelectItem>
                          <SelectItem value="4">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" color="#050606" />4 Auxiliares
                            </div>
                          </SelectItem>
                          <SelectItem value="5">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" color="#050606" />5 Auxiliares
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {/* Componente de múltiplos procedimentos - só exibido quando múltiplos procedimentos está ativado */}
                {multiplosProcedimentosEnabled && (
                  <MultiplosProcedimentos
                    procedimentos={procedimentos}
                    onChange={setProcedimentos}
                    procedimentoPrincipal={procedimentoPrincipal}
                    errors={errors}
                    formSubmitted={formSubmitted}
                  />
                )}

                {/* Legenda dos campos obrigatórios */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Info className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Os campos marcados com <span className="text-red-500 font-bold">*</span> são obrigatórios e devem
                      ser preenchidos.
                    </span>
                  </div>
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
                    <RotateCcw className={`h-4 w-4 ${isClearing ? "animate-spin-360" : ""}`} />
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
        </div>

        {/* Coluna do Resultado */}
        <div className="space-y-6">
          {calculationResult && (
            <div className="xl:sticky xl:top-6">
              <CalculationResult result={calculationResult} />
            </div>
          )}

          {/* Placeholder quando não há resultado */}
          {!calculationResult && (
            <Card className="w-full xl:sticky xl:top-6">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Calculator className="h-12 w-12 text-muted-foreground mb-4" />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
