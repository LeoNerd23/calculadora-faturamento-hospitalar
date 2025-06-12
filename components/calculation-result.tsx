"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Calculator, List, Download, Syringe, Percent, Users, Info } from "lucide-react"
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
        {/* Detalhes de cada linha - só para múltiplos procedimentos */}
        {result.multiplosProcedimentos && result.linhasCalculadas && result.linhasCalculadas.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <List className="h-4 w-4" />
              Detalhes por Linha ({result.linhasCalculadas.length})
            </h3>
            <div className="space-y-3">
              {result.linhasCalculadas.map((linha, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                          Linha {linha.linha}
                        </Badge>
                        <Badge variant="secondary">{linha.porcentagem}% do valor SH</Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">Total da Linha</p>
                        <p className="text-lg font-bold text-green-600">{formatCurrency(linha.valorTotalLinha)}</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <p>
                          <strong>Código:</strong> {linha.codigo}
                        </p>
                        {linha.descricao && <p className="text-muted-foreground">{linha.descricao}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {/* Valores básicos */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Valores Básicos</h4>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span>Valor SH:</span>
                            <span>{formatCurrency(linha.valorSH)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Valor TSP:</span>
                            <span>{formatCurrency(linha.valorTSP)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Valor SP:</span>
                            <span>{formatCurrency(linha.valorSP)}</span>
                          </div>
                          {linha.anestesistaEnabled && (
                            <div className="flex justify-between">
                              <span>Valor Anestesia:</span>
                              <span>{formatCurrency(linha.valorAnestesista)}</span>
                            </div>
                          )}
                          {linha.incremento > 0 && (
                            <div className="flex justify-between">
                              <span>Incremento:</span>
                              <span>{linha.incremento}%</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Valores dos profissionais */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Profissionais</h4>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span>Cirurgião:</span>
                            <span>{formatCurrency(linha.valorCirurgiao)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>1º Auxiliar:</span>
                            <span>{formatCurrency(linha.valorPrimeiroAuxiliar)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Auxiliares 2º ao 5º:</span>
                            <span>
                              {formatCurrency(
                                linha.valorSegundoAuxiliar +
                                  linha.valorTerceiroAuxiliar +
                                  linha.valorQuartoAuxiliar +
                                  linha.valorQuintoAuxiliar,
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Badges de configurações da linha */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {linha.anestesistaEnabled && (
                        <Badge className="text-xs bg-blue-500 hover:bg-blue-600">
                          <Syringe className="h-3 w-3 mr-1" />
                          Anestesia
                        </Badge>
                      )}
                      {linha.incremento > 0 && (
                        <Badge className="text-xs bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                          <Percent className="h-3 w-3 mr-1" />
                          {linha.incremento}%
                        </Badge>
                      )}
                      {linha.quantidadeAuxiliares > 0 && (
                        <Badge className="text-xs bg-purple-100 text-purple-800 hover:bg-purple-200">
                          <Users className="h-3 w-3 mr-1" />
                          {linha.quantidadeAuxiliares} Aux
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Múltiplos Procedimentos - resumo */}
        {result.multiplosProcedimentos && result.procedimentos && result.procedimentos.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <List className="h-4 w-4" />
              Resumo - Múltiplos Procedimentos ({result.procedimentos.length})
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Procedimento Principal:</strong> {result.procedimentoPrincipal}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                As porcentagens de cada linha são determinadas pelo procedimento principal selecionado.
              </p>
            </div>
          </div>
        )}

        {/* Valores totais em duas colunas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Coluna 1: Informações básicas */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Totais do Procedimento</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span>
                  <strong>Código Principal:</strong>
                </span>
                <div className="flex items-center gap-2">
                  <span>{result.codigo}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>
                  <strong>Descrição:</strong>
                </span>
                <div className="flex items-center gap-2">
                  <span>
                  <span>{result.descricao && <span className="text-muted-foreground">{result.descricao}</span>}</span>
                </span>
                </div>
              </div>
              {!result.multiplosProcedimentos && (
                <div className="flex justify-between">
                  <span>
                    <strong>Quantidade de Pontos:</strong>
                  </span>
                  <span>{result.quantidadePontos}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>
                  <strong>Valor Total SH:</strong>
                </span>
                <span>{formatCurrency(result.valorSH)}</span>
              </div>
              <div className="flex justify-between">
                <span>
                  <strong>Valor Total TSP:</strong>
                </span>
                <span>{formatCurrency(result.valorTSP)}</span>
              </div>
              <div className="flex justify-between">
                <span>
                  <strong>Valor Total SP:</strong>
                </span>
                <span>{formatCurrency(result.valorSP)}</span>
              </div>
            </div>
          </div>

          {/* Coluna 2: Valores dos profissionais */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Totais dos Profissionais</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>
                  <strong>Valor Total Anestesia:</strong>
                </span>
                <span>{result.anestesistaEnabled ? formatCurrency(result.valorAnestesista) : "R$ 0,00"}</span>
              </div>
              <div className="flex justify-between">
                <span>
                  <strong>Total Cirurgião:</strong>
                </span>
                <span>{formatCurrency(result.valorCirurgiao)}</span>
              </div>
              <div className="flex justify-between">
                <span>
                  <strong>Total 1º Auxiliar:</strong>
                </span>
                <span>{formatCurrency(result.valorPrimeiroAuxiliar)}</span>
              </div>
              <div className="flex justify-between">
                <span>
                  <strong>Total Auxiliares 2º ao 5º:</strong>
                </span>
                <span>{formatCurrency(valorAuxiliares2ao5)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span>
                  <strong>Total Pontos:</strong>
                </span>
                <span>{Math.round(result.totalPontos)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Valor do Ponto:</span>
                <span>{formatCurrency(result.valorPonto)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown do Valor Total */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-4 w-4 text-blue-600" />
            <h4 className="font-medium text-blue-800">Composição do Valor Total</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <p className="text-muted-foreground">Valor SH Total</p>
              <p className="font-semibold">{formatCurrency(result.valorSH)}</p>
              {result.incremento > 0 && (
                <p className="text-xs text-muted-foreground">
                  (com incremento médio de {result.incremento.toFixed(1)}%)
                </p>
              )}
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">Valor TSP Total</p>
              <p className="font-semibold">{formatCurrency(result.valorTSP)}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">Valor SP Total</p>
              <p className="font-semibold">{formatCurrency(result.valorSP)}</p>
              {result.incremento > 0 && (
                <p className="text-xs text-muted-foreground">
                  (com incremento médio de {result.incremento.toFixed(1)}%)
                </p>
              )}
            </div>
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
                  Incremento {result.incremento.toFixed(1)}%
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
                  {Math.round(result.quantidadeAuxiliares)}{" "}
                  {Math.round(result.quantidadeAuxiliares) === 1 ? "Auxiliar" : "Auxiliares"}
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
              SH + TSP + SP {result.incremento > 0 && `(com incremento médio de ${result.incremento.toFixed(1)}%)`}
              {result.anestesistaEnabled && " + Anestesia"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
