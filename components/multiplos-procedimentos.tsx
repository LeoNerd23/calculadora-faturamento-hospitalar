"use client"
import { Button } from "@/components/ui/button"
import type React from "react"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Minus, GripVertical, List } from "lucide-react"
import type { ProcedimentoSelecionado } from "@/types/calculation"
import { PROCEDIMENTOS_DATABASE } from "@/data/procedimentos"
import { useState } from "react"

interface MultiplosProcedimentosProps {
  procedimentos: ProcedimentoSelecionado[]
  onChange: (procedimentos: ProcedimentoSelecionado[]) => void
}

export default function MultiplosProcedimentos({ procedimentos = [], onChange }: MultiplosProcedimentosProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  // Garantir que procedimentos seja sempre um array
  const safeProcedimentos = procedimentos || []

  const adicionarProcedimento = (index: number) => {
    // Só pode adicionar se for a última linha e não exceder 5 procedimentos
    if (index === safeProcedimentos.length - 1 && safeProcedimentos.length < 5) {
      const novoProcedimento: ProcedimentoSelecionado = {
        id: `proc_${Date.now()}`,
        codigo: "",
        descricao: "",
        porcentagens: [],
        auxiliares: 0,
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

  const atualizarProcedimento = (index: number, codigo: string) => {
    const procedimentoDb = PROCEDIMENTOS_DATABASE.find((p) => p.codigo === codigo)
    if (!procedimentoDb) return

    const procedimentosAtualizados = safeProcedimentos.map((proc, i) => {
      if (i === index) {
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
          auxiliares: procedimentoDb.auxiliares,
        }
      }
      return proc
    })
    onChange(procedimentosAtualizados)
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
          Múltiplos Procedimentos ({safeProcedimentos.length}/5)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
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
              className={`flex items-center gap-3 p-4 border rounded-lg transition-all duration-200 min-w-0 ${
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
              {/* Grip Handle para indicar que é arrastável - ÁREA CLICÁVEL MAIOR */}
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

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`text-sm font-medium px-2 py-1 rounded transition-colors ${
                      draggedIndex === index ? "bg-blue-200 text-blue-900" : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    Linha {index + 1}
                  </span>
                  {procedimento.porcentagens.length > 0 && (
                    <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded flex-shrink-0">
                      {procedimento.porcentagens[index] || 0}% do valor SP
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 min-w-0">
                  <Select value={procedimento.codigo} onValueChange={(value) => atualizarProcedimento(index, value)}>
                    <SelectTrigger className={`w-full min-w-0 ${draggedIndex === index ? "border-blue-300" : ""}`}>
                      <SelectValue placeholder="Selecione o procedimento">
                        {procedimento.codigo && (
                          <div className="flex items-center gap-2 w-full min-w-0">
                            <span className="font-medium flex-shrink-0">{procedimento.codigo}</span>
                            <span className="text-xs text-muted-foreground truncate flex-1 min-w-0">
                              {procedimento.descricao}
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
                    {index === safeProcedimentos.length - 1 && safeProcedimentos.length < 5 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => adicionarProcedimento(index)}
                        className="h-8 w-8 p-0 bg-green-50 hover:bg-green-100 border-green-200"
                        title="Adicionar procedimento"
                      >
                        <Plus className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                  </div>
                </div>

                {procedimento.descricao && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2 break-words">
                    {procedimento.descricao}
                  </p>
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
          </div>
        )}

        {safeProcedimentos.length > 1 && (
          <div className="text-center text-xs text-muted-foreground bg-gray-50 p-3 rounded-lg mt-4">
            💡 <strong>Dica:</strong> Arraste o ícone <GripVertical className="inline h-3 w-3 mx-1" /> para reordenar os
            procedimentos. A ordem influencia no cálculo dos valores.
          </div>
        )}

        {safeProcedimentos.length === 5 && (
          <div className="text-center text-xs text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200 mt-4">
            ⚠️ <strong>Limite atingido:</strong> Máximo de 5 procedimentos permitidos.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
