"use client"
import { Button } from "@/components/ui/button"
import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Minus, GripVertical, List, Lightbulb, Info, AlertTriangle } from "lucide-react"
import type { ProcedimentoSelecionado } from "@/types/calculation"
import { PROCEDIMENTOS_DATABASE } from "@/data/procedimentos"
import { useState, useMemo } from "react"
import { formatCurrency } from "@/utils/calculation"

interface MultiplosProcedimentosProps {
  procedimentos: ProcedimentoSelecionado[]
  onChange: (procedimentos: ProcedimentoSelecionado[]) => void
  procedimentoPrincipal?: string
  errors?: { [key: string]: string }
  formSubmitted?: boolean
}

export default function MultiplosProcedimentos({
  procedimentos = [],
  onChange,
  procedimentoPrincipal,
  errors = {},
  formSubmitted = false,
}: MultiplosProcedimentosProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  // Garantir que procedimentos seja sempre um array
  const safeProcedimentos = procedimentos || []

  // Calcular máximo de linhas baseado no procedimento principal
  const maxLinhas = useMemo(() => {
    if (!procedimentoPrincipal) return 5

    const procedimentoDb = PROCEDIMENTOS_DATABASE.find((p) => p.codigo === procedimentoPrincipal)
    if (!procedimentoDb) return 5

    const porcentagens = [
      procedimentoDb.linha1,
      procedimentoDb.linha2,
      procedimentoDb.linha3,
      procedimentoDb.linha4,
      procedimentoDb.linha5,
    ]

    return porcentagens.filter((p) => p > 0).length
  }, [procedimentoPrincipal])

  const adicionarProcedimento = (index: number) => {
    // Verificar se há procedimento principal selecionado
    if (!procedimentoPrincipal) {
      return // Não permite adicionar sem procedimento principal
    }

    // Só pode adicionar se for a última linha e não exceder o máximo de linhas
    if (index === safeProcedimentos.length - 1 && safeProcedimentos.length < maxLinhas) {
      // Obter porcentagens do procedimento principal para o novo procedimento
      const procedimentoDb = PROCEDIMENTOS_DATABASE.find((p) => p.codigo === procedimentoPrincipal)
      const porcentagens = procedimentoDb
        ? [
            procedimentoDb.linha1,
            procedimentoDb.linha2,
            procedimentoDb.linha3,
            procedimentoDb.linha4,
            procedimentoDb.linha5,
          ].filter((p) => p > 0)
        : []

      const novoProcedimento: ProcedimentoSelecionado = {
        id: `proc_${Date.now()}`,
        codigo: "",
        descricao: "",
        porcentagens: porcentagens,
        auxiliaresSugeridos: 0,
        quantidadePontos: "",
        valorSP: "",
        valorSH: "",
        valorTSP: "",
        incremento: "",
        quantidadeAuxiliares: "0",
        anestesistaEnabled: false,
        incrementoEnabled: false,
      }
      onChange([...safeProcedimentos, novoProcedimento])
    }
  }

  const removerProcedimento = (index: number) => {
    // Só pode remover se tiver mais de 1 procedimento
    if (safeProcedimentos.length > 1) {
      const novosProcedimentos = safeProcedimentos.filter((_, i) => i !== index)
      onChange(novosProcedimentos)
    }
  }

  const atualizarProcedimento = (index: number, campo: keyof ProcedimentoSelecionado, valor: string | boolean) => {
    const procedimentosAtualizados = safeProcedimentos.map((proc, i) => {
      if (i === index) {
        if (campo === "codigo" && typeof valor === "string") {
          // Verificar se o código existe no banco de dados
          const procedimentoDb = PROCEDIMENTOS_DATABASE.find((p) => p.codigo === valor)
          if (procedimentoDb) {
            return {
              ...proc,
              codigo: procedimentoDb.codigo,
              descricao: procedimentoDb.descricao,
              porcentagens: [
                procedimentoDb.linha1,
                procedimentoDb.linha2,
                procedimentoDb.linha3,
                procedimentoDb.linha4,
                procedimentoDb.linha5,
              ].filter((p) => p > 0),
              auxiliaresSugeridos: procedimentoDb.auxiliares,
            }
          }
          // Se não encontrou no banco, apenas atualiza o código
          return { ...proc, [campo]: valor }
        }
        return { ...proc, [campo]: valor }
      }
      return proc
    })
    onChange(procedimentosAtualizados)
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

  const handleInputChange = (index: number, field: keyof ProcedimentoSelecionado, value: string) => {
    // Limpar erro quando o usuário começa a digitar
    const errorKey = `procedimento_${index}_${field}`
    if (errors[errorKey] && formSubmitted) {
      // Notificar o componente pai para limpar o erro
      // Isso será implementado no componente pai
    }

    if (field === "codigo") {
      const formatted = formatCode(value)
      atualizarProcedimento(index, field, formatted)
    } else if (field === "valorSP" || field === "valorSH" || field === "valorTSP") {
      // Remove tudo que não é número
      const numbers = value.replace(/\D/g, "")

      // Converte para centavos
      const amount = Number.parseFloat(numbers) / 100

      // Formata como moeda brasileira
      if (isNaN(amount)) {
        atualizarProcedimento(index, field, "")
      } else {
        const formatted = formatCurrency(amount)
        atualizarProcedimento(index, field, formatted)
      }
    } else if (field === "quantidadePontos" || field === "incremento") {
      // Aceita apenas números
      const numbers = value.replace(/\D/g, "")
      atualizarProcedimento(index, field, numbers)
    } else {
      atualizarProcedimento(index, field, value)
    }
  }

  const handleSwitchChange = (index: number, field: "anestesistaEnabled" | "incrementoEnabled", checked: boolean) => {
    atualizarProcedimento(index, field, checked)
  }

  const handleSelectChange = (index: number, field: "quantidadeAuxiliares", value: string) => {
    atualizarProcedimento(index, field, value)
  }

  // Funções de Drag and Drop
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    const novosProcedimentos = [...safeProcedimentos]
    const [procedimentoMovido] = novosProcedimentos.splice(draggedIndex, 1)
    novosProcedimentos.splice(dropIndex, 0, procedimentoMovido)

    onChange(novosProcedimentos)
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <List className="h-5 w-5" />
          Múltiplos Procedimentos ({safeProcedimentos.length}/{maxLinhas})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {safeProcedimentos.map((procedimento, index) => (
          <div key={procedimento.id} className="relative">
            {/* Linha de inserção visual quando arrastando */}
            {draggedIndex !== null && draggedIndex !== index && dragOverIndex === index && (
              <div className="absolute -top-1 left-0 right-0 h-0.5 bg-blue-500 rounded-full z-10">
                <div className="absolute -left-1 -top-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="absolute -right-1 -top-1 w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
            )}

            <div
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              className={`border rounded-lg transition-all duration-200 overflow-hidden ${
                draggedIndex === index ? "opacity-30 scale-95 rotate-2 shadow-lg border-blue-300" : ""
              } ${
                dragOverIndex === index && draggedIndex !== index
                  ? "border-blue-500 bg-blue-50 transform scale-102"
                  : ""
              } ${
                draggedIndex !== null && draggedIndex !== index
                  ? "transform translate-y-1 transition-transform duration-200"
                  : ""
              }`}
            >
              {/* Cabeçalho do procedimento */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 border-b">
                {/* Grip Handle para indicar que é arrastável */}
                {safeProcedimentos.length > 1 && (
                  <div
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center justify-center p-3 rounded hover:bg-gray-100 transition-colors ${
                      draggedIndex === index ? "bg-blue-100" : ""
                    }`}
                    style={{
                      cursor: draggedIndex === index ? "grabbing" : "grab",
                      width: "40px",
                      height: "40px",
                    }}
                  >
                    <GripVertical
                      className={`h-5 w-5 transition-colors ${
                        draggedIndex === index ? "text-blue-500" : "text-muted-foreground"
                      }`}
                    />
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-medium px-2 py-1 rounded transition-colors ${
                        draggedIndex === index ? "bg-blue-200 text-blue-900" : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      Linha {index + 1}
                    </span>
                    {procedimento.porcentagens.length > 0 && (
                      <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded flex-shrink-0">
                        {procedimento.porcentagens[index] || 0}% do valor SH
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  {/* Botão - aparece em todas as linhas, mas só funciona se tiver mais de 1 */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removerProcedimento(index)}
                    disabled={safeProcedimentos.length <= 1}
                    className={`h-8 w-8 p-0 ${
                      safeProcedimentos.length > 1
                        ? "bg-red-50 hover:bg-red-100 border-red-200"
                        : "opacity-50 cursor-not-allowed"
                    }`}
                    title="Remover procedimento"
                  >
                    <Minus className={`h-4 w-4 ${safeProcedimentos.length > 1 ? "text-red-600" : "text-gray-400"}`} />
                  </Button>

                  {/* Botão + - só aparece na última linha e se não chegou ao máximo */}
                  {index === safeProcedimentos.length - 1 && safeProcedimentos.length < maxLinhas && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => adicionarProcedimento(index)}
                      disabled={!procedimentoPrincipal}
                      className={`h-8 w-8 p-0 ${
                        procedimentoPrincipal
                          ? "bg-green-50 hover:bg-green-100 border-green-200"
                          : "opacity-50 cursor-not-allowed bg-gray-50"
                      }`}
                      title={
                        procedimentoPrincipal
                          ? "Adicionar procedimento"
                          : "Selecione um procedimento principal primeiro"
                      }
                    >
                      <Plus className={`h-4 w-4 ${procedimentoPrincipal ? "text-green-600" : "text-gray-400"}`} />
                    </Button>
                  )}
                </div>
              </div>

              {/* Calculadora completa para cada procedimento */}
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor={`codigo-${index}`}
                        className={errors[`procedimento_${index}_codigo`] ? "text-red-500" : ""}
                      >
                        Código <span className="text-red-500 font-bold">*</span>
                      </Label>
                      {errors[`procedimento_${index}_codigo`] && (
                        <span className="text-xs text-red-500 font-medium">
                          {errors[`procedimento_${index}_codigo`]}
                        </span>
                      )}
                    </div>
                    <Input
                      id={`codigo-${index}`}
                      type="tel"
                      placeholder="00.00.00.000-0"
                      value={procedimento.codigo}
                      onChange={(e) => handleInputChange(index, "codigo", e.target.value)}
                      className={
                        errors[`procedimento_${index}_codigo`] ? "border-red-500 focus-visible:ring-red-500" : ""
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor={`quantidadePontos-${index}`}
                        className={errors[`procedimento_${index}_quantidadePontos`] ? "text-red-500" : ""}
                      >
                        Quantidade de Pontos <span className="text-red-500 font-bold">*</span>
                      </Label>
                      {errors[`procedimento_${index}_quantidadePontos`] && (
                        <span className="text-xs text-red-500 font-medium">
                          {errors[`procedimento_${index}_quantidadePontos`]}
                        </span>
                      )}
                    </div>
                    <Input
                      id={`quantidadePontos-${index}`}
                      type="tel"
                      inputMode="numeric"
                      placeholder="Digite a quantidade de pontos"
                      value={procedimento.quantidadePontos}
                      onChange={(e) => handleInputChange(index, "quantidadePontos", e.target.value)}
                      className={
                        errors[`procedimento_${index}_quantidadePontos`]
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor={`valorSP-${index}`}
                        className={errors[`procedimento_${index}_valorSP`] ? "text-red-500" : ""}
                      >
                        Valor SP <span className="text-red-500 font-bold">*</span>
                      </Label>
                      {errors[`procedimento_${index}_valorSP`] && (
                        <span className="text-xs text-red-500 font-medium">
                          {errors[`procedimento_${index}_valorSP`]}
                        </span>
                      )}
                    </div>
                    <Input
                      id={`valorSP-${index}`}
                      type="tel"
                      inputMode="numeric"
                      placeholder="R$ 0,00"
                      value={procedimento.valorSP}
                      onChange={(e) => handleInputChange(index, "valorSP", e.target.value)}
                      className={
                        errors[`procedimento_${index}_valorSP`] ? "border-red-500 focus-visible:ring-red-500" : ""
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor={`valorSH-${index}`}
                        className={errors[`procedimento_${index}_valorSH`] ? "text-red-500" : ""}
                      >
                        Valor SH <span className="text-red-500 font-bold">*</span>
                      </Label>
                      {errors[`procedimento_${index}_valorSH`] && (
                        <span className="text-xs text-red-500 font-medium">
                          {errors[`procedimento_${index}_valorSH`]}
                        </span>
                      )}
                    </div>
                    <Input
                      id={`valorSH-${index}`}
                      type="tel"
                      inputMode="numeric"
                      placeholder="R$ 0,00"
                      value={procedimento.valorSH}
                      onChange={(e) => handleInputChange(index, "valorSH", e.target.value)}
                      className={
                        errors[`procedimento_${index}_valorSH`] ? "border-red-500 focus-visible:ring-red-500" : ""
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`valorTSP-${index}`}>Valor TSP</Label>
                    <Input
                      id={`valorTSP-${index}`}
                      type="tel"
                      inputMode="numeric"
                      placeholder="R$ 0,00"
                      value={procedimento.valorTSP}
                      onChange={(e) => handleInputChange(index, "valorTSP", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`anestesista-switch-${index}`}
                      className="cursor-pointer"
                      checked={procedimento.anestesistaEnabled}
                      onCheckedChange={(checked) => handleSwitchChange(index, "anestesistaEnabled", checked)}
                    />
                    <Label htmlFor={`anestesista-switch-${index}`}>Inclui Valor da Anestesia</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`incremento-switch-${index}`}
                      className="cursor-pointer"
                      checked={procedimento.incrementoEnabled}
                      onCheckedChange={(checked) => handleSwitchChange(index, "incrementoEnabled", checked)}
                    />
                    <Label htmlFor={`incremento-switch-${index}`}>Incremento</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`quantidadeAuxiliares-${index}`}>Quantidade de Auxiliares</Label>
                    <Select
                      value={procedimento.quantidadeAuxiliares}
                      onValueChange={(value) => handleSelectChange(index, "quantidadeAuxiliares", value)}
                    >
                      <SelectTrigger id={`quantidadeAuxiliares-${index}`}>
                        <SelectValue placeholder="Selecione a quantidade" />
                      </SelectTrigger>
                      <SelectContent>
                        {[0, 1, 2, 3, 4, 5].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? "Auxiliar" : "Auxiliares"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {procedimento.incrementoEnabled && (
                  <div className="space-y-2">
                    <Label htmlFor={`incremento-${index}`}>Valor do Incremento (%)</Label>
                    <Input
                      id={`incremento-${index}`}
                      type="text"
                      inputMode="numeric"
                      placeholder="Digite o valor do incremento"
                      value={procedimento.incremento}
                      onChange={(e) => handleInputChange(index, "incremento", e.target.value)}
                    />
                  </div>
                )}

                {procedimento.descricao && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground break-words bg-gray-50 p-2 rounded">
                      <strong>Descrição:</strong> {procedimento.descricao}
                    </p>
                    {procedimento.auxiliaresSugeridos > 0 && (
                      <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                        <strong>Auxiliares sugeridos:</strong> {procedimento.auxiliaresSugeridos}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Linha de inserção no final quando arrastando para o último item */}
            {draggedIndex !== null &&
              draggedIndex !== index &&
              dragOverIndex === index &&
              index === safeProcedimentos.length - 1 && (
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-500 rounded-full z-10">
                  <div className="absolute -left-1 -top-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="absolute -right-1 -top-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
              )}
          </div>
        ))}

        {safeProcedimentos.length === 0 && (
          <div className="text-center py-8">
            {!procedimentoPrincipal ? (
              <>
                <p className="text-muted-foreground mb-4">Selecione um procedimento principal primeiro</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 text-sm flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Para adicionar procedimentos:</strong>
                      <br />
                      1. Selecione um procedimento principal no campo acima
                      <br />
                      2. O primeiro procedimento será adicionado automaticamente
                    </span>
                  </p>
                </div>
              </>
            ) : (
              <>
                <p className="text-muted-foreground mb-4">Nenhum procedimento adicionado</p>
                <Button
                  type="button"
                  onClick={() => adicionarProcedimento(-1)}
                  variant="outline"
                  className="bg-blue-50 hover:bg-blue-100 border-blue-200"
                >
                  <Plus className="h-4 w-4 mr-2 text-blue-600" />
                  Adicionar Primeiro Procedimento
                </Button>
              </>
            )}
          </div>
        )}

        {!procedimentoPrincipal && (
          <div className="text-center text-xs text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200 mt-4 flex items-center gap-2">
            <Info className="h-4 w-4 flex-shrink-0" />
            <span>
              <strong>Passo 1:</strong> Selecione um procedimento principal acima para determinar as porcentagens e
              limites de cada linha.
            </span>
          </div>
        )}

        {procedimentoPrincipal && safeProcedimentos.length > 1 && (
          <div className="text-center text-xs text-muted-foreground bg-gray-50 p-3 rounded-lg mt-4 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500 flex-shrink-0" />
            <span>
              <strong>Dica:</strong> Arraste o ícone <GripVertical className="inline h-3 w-3 mx-1" /> para reordenar os
              procedimentos. A ordem influencia no cálculo dos valores.
            </span>
          </div>
        )}

        {procedimentoPrincipal && safeProcedimentos.length === maxLinhas && (
          <div className="text-center text-xs text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200 mt-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>Limite atingido:</strong> Máximo de {maxLinhas} procedimentos permitidos para este procedimento
              principal.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
