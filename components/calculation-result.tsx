"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Calculator, List, Download, Syringe, Percent, Users } from "lucide-react"
import type { MedicalFeeResult } from "@/types/calculation"
import { formatCurrency } from "@/utils/calculation"
import { exportToPDF } from "@/utils/pdf-export"

interface CalculationResultProps {
  result: MedicalFeeResult
}

export default function CalculationResult({ result }: CalculationResultProps) {
  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Calcular valor dos auxiliares 2º ao 5º
  const valorAuxiliares2ao5 =
    result.valorSegundoAuxiliar + result.valorTerceiroAuxiliar + result.valorQuartoAuxiliar + result.valorQuintoAuxiliar

  // Verificar se há configurações ativas
  const hasConfigurations =
    result.anestesistaEnabled ||
    result.incremento > 0 ||
    result.multiplosProcedimentos ||
    result.quantidadeAuxiliares > 0

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Resultado do Cálculo
            </CardTitle>
            <CardDescription>Cálculo realizado em {formatDateTime(result.timestamp)}</CardDescription>
          </div>
          <Button onClick={() => exportToPDF(result)} className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Imprimir / Salvar PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Múltiplos Procedimentos */}
        {result.multiplosProcedimentos && result.procedimentos && result.procedimentos.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <List className="h-4 w-4" />
              Múltiplos Procedimentos ({result.procedimentos.length})
            </h3>
            <div className="grid gap-3">
              {result.procedimentos.map((proc, index) => (
                <div key={proc.id} className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      Linha {index + 1}
                    </Badge>
                    {proc.porcentagens.length > index && (
                      <Badge variant="secondary">{proc.porcentagens[index]}% do valor SP</Badge>
                    )}
                  </div>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Código:</strong> {proc.codigo}
                    </p>
                    <p className="text-muted-foreground">{proc.descricao}</p>
                    {proc.auxiliares > 0 && (
                      <p>
                        <strong>Auxiliares sugeridos:</strong> {proc.auxiliares}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Valores em duas colunas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Coluna 1: Informações básicas */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Informações do Procedimento</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>
                  <strong>Código:</strong>
                </span>
                <span>{result.codigo}</span>
              </div>
              <div className="flex justify-between">
                <span>
                  <strong>Valor Incremento:</strong>
                </span>
                <span>{result.incremento}%</span>
              </div>
              <div className="flex justify-between">
                <span>
                  <strong>Valor SH:</strong>
                </span>
                <span>{formatCurrency(result.valorSH)}</span>
              </div>
              <div className="flex justify-between">
                <span>
                  <strong>Valor TSP:</strong>
                </span>
                <span>{formatCurrency(result.valorTSP)}</span>
              </div>
              <div className="flex justify-between">
                <span>
                  <strong>Valor Anestesia:</strong>
                </span>
                <span>{result.anestesistaEnabled ? formatCurrency(result.valorAnestesista) : "R$ 0,00"}</span>
              </div>
            </div>
          </div>

          {/* Coluna 2: Valores dos profissionais */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Valores dos Profissionais</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>
                  <strong>Valor Cirurgião:</strong>
                </span>
                <span>{formatCurrency(result.valorCirurgiao)}</span>
              </div>
              {result.quantidadeAuxiliares >= 1 && (
                <div className="flex justify-between">
                  <span>
                    <strong>Valor 1º Auxiliar:</strong>
                  </span>
                  <span>{formatCurrency(result.valorPrimeiroAuxiliar)}</span>
                </div>
              )}
              {result.quantidadeAuxiliares >= 2 && (
                <div className="flex justify-between">
                  <span>
                    <strong>Valor Auxiliares 2º ao 5º:</strong>
                  </span>
                  <span>{formatCurrency(valorAuxiliares2ao5)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2">
                <span>
                  <strong>Valor Total SP:</strong>
                </span>
                <span>{formatCurrency(result.valorSP)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Valor Total do Procedimento - Alinhado à direita */}
        <div className="flex justify-end">
          <div className="text-right">
            <p className="text-lg font-semibold mb-1">Valor Total do Procedimento:</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(result.valorTotalProcedimento)}</p>
          </div>
        </div>

        {/* Configurações - só exibe se houver alguma ativa */}
        {hasConfigurations && (
          <div className="space-y-2">
            <h4 className="font-medium">Configurações Ativas</h4>
            <div className="flex flex-wrap gap-2">
              {result.anestesistaEnabled && (
                <Badge className="bg-blue-500 hover:bg-blue-600">
                  <Syringe className="h-3 w-3 mr-1" />
                  Anestesia
                </Badge>
              )}
              {result.incremento > 0 && (
                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                  <Percent className="h-3 w-3 mr-1" />
                  Incremento {result.incremento}%
                </Badge>
              )}
              {result.multiplosProcedimentos && (
                <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
                  <List className="h-3 w-3 mr-1" />
                  Múltiplos Procedimentos
                </Badge>
              )}
              {result.quantidadeAuxiliares > 0 && (
                <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                  <Users className="h-3 w-3 mr-1" />
                  {result.quantidadeAuxiliares} {result.quantidadeAuxiliares === 1 ? "Auxiliar" : "Auxiliares"}
                </Badge>
              )}
            </div>
          </div>
        )}

        <Separator />

        {/* Valor Total - Bloco destacado */}
        <div className="bg-gray-50 p-6 rounded-lg border">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Valor Total do Procedimento</h3>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(result.valorTotalProcedimento)}</p>
            <p className="text-sm text-muted-foreground mt-2">
              SH + TSP + SP {result.incremento > 0 && `(com incremento de ${result.incremento}%)`}
              {result.anestesistaEnabled && " + Anestesia"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
