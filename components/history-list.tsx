"use client"
import type { MedicalFeeResult } from "@/types/calculation"
import { formatCurrency, clearCalculationHistory } from "@/utils/calculation"
import { exportToPDF } from "@/utils/pdf-export"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Trash2, ArrowLeft, FileText } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface HistoryListProps {
  history: MedicalFeeResult[]
  onHistoryChange: () => void
}

export default function HistoryList({ history, onHistoryChange }: HistoryListProps) {
  const handleClearHistory = () => {
    if (confirm("Tem certeza que deseja limpar todo o histórico?")) {
      clearCalculationHistory()
      onHistoryChange()
    }
  }

  const [exportingId, setExportingId] = useState<number | null>(null)
  const [exportingType, setExportingType] = useState<"pdf" | "excel" | null>(null)

  const handleExportPDF = async (calculation: MedicalFeeResult, index: number) => {
    try {
      setExportingId(index)
      setExportingType("pdf")
      await exportToPDF(calculation)
    } catch (error) {
      console.error("Erro ao exportar PDF:", error)
      alert("Erro ao exportar PDF. Tente novamente.")
    } finally {
      setExportingId(null)
      setExportingType(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/">
          <Button variant="outline"className="cursor-pointer">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Calculadora
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Histórico de Cálculos</h1>
        <div></div>
      </div>

      {history.length === 0 ? (
        <Card className="w-full">
          <CardContent className="p-8">
            <p className="text-center text-muted-foreground">Nenhum cálculo realizado ainda.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Cálculos Realizados ({history.length})</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {history.map((item, index) => {
                const date = new Date(item.timestamp)
                const formattedDate = date.toLocaleDateString("pt-BR") + " " + date.toLocaleTimeString("pt-BR")

                return (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger>
                      <div className="flex justify-between w-full pr-4 cursor-pointer">
                        <span>Código: {item.codigo}</span>
                        <span className="text-sm text-muted-foreground">{formattedDate}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="font-medium">Quantidade de Pontos:</span>
                              <span>{item.quantidadePontos}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Valor Anestesista:</span>
                              <span>{formatCurrency(item.valorAnestesista)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Valor Cirurgião:</span>
                              <span>{formatCurrency(item.valorCirurgiao)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Valor 1º Auxiliar:</span>
                              <span>{formatCurrency(item.valorPrimeiroAuxiliar)}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="font-medium">Valor 2º Auxiliar:</span>
                              <span>{formatCurrency(item.valorSegundoAuxiliar)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Total Valor SP:</span>
                              <span>{formatCurrency(item.valorSP)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Valor SH:</span>
                              <span>{formatCurrency(item.valorSH)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Auxiliares:</span>
                              <span>{item.quantidadeAuxiliares}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2 border-t">
                          <Button
                            className="cursor-pointer"
                            onClick={() => handleExportPDF(item, index)}
                            variant="outline"
                            size="sm"
                            disabled={exportingId === index && exportingType === "pdf"}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            {exportingId === index && exportingType === "pdf" ? "Exportando..." : "Exportar PDF"}
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          </CardContent>
          <CardFooter>
            <Button variant="destructive" onClick={handleClearHistory} className="ml-auto cursor-pointer">
              <Trash2 className="h-4 w-4 mr-2" /> Limpar Histórico
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
