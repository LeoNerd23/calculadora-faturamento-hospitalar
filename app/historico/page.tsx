"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Trash2,
  Download,
  Calculator,
  List,
  FileText,
  Search,
  Filter,
  X,
  Users,
  Syringe,
  Percent,
  AlertTriangle,
  ClipboardList,
} from "lucide-react"
import Link from "next/link"
import type { MedicalFeeResult } from "@/types/calculation"
import { getCalculationHistory, clearCalculationHistory, formatCurrency } from "@/utils/calculation"
import { exportToPDF } from "@/utils/pdf-export"

interface FilterState {
  anestesia: boolean
  multiplos: boolean
  incremento: boolean
  auxiliar: boolean
}

export default function HistoricoPage() {
  const [history, setHistory] = useState<MedicalFeeResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    anestesia: false,
    multiplos: false,
    incremento: false,
    auxiliar: false,
  })

  useEffect(() => {
    const loadHistory = () => {
      const savedHistory = getCalculationHistory()
      setHistory(savedHistory)
      setIsLoading(false)
    }

    loadHistory()
  }, [])

  // Filtrar histórico baseado na busca e filtros
  const filteredHistory = useMemo(() => {
    let filtered = history

    // Filtro por código (busca)
    if (searchTerm.trim()) {
      filtered = filtered.filter((result) =>
        result.codigo.toLowerCase().includes(searchTerm.toLowerCase().replace(/\D/g, "")),
      )
    }

    // Aplicar filtros
    if (filters.anestesia) {
      filtered = filtered.filter((result) => result.anestesistaEnabled)
    }

    if (filters.multiplos) {
      filtered = filtered.filter((result) => result.multiplosProcedimentos)
    }

    if (filters.incremento) {
      filtered = filtered.filter((result) => result.incremento > 0)
    }

    if (filters.auxiliar) {
      filtered = filtered.filter((result) => result.quantidadeAuxiliares > 0)
    }

    return filtered
  }, [history, searchTerm, filters])

  const handleClearHistory = () => {
    clearCalculationHistory()
    setHistory([])
    setIsDialogOpen(false)
  }

  const handleFilterChange = (filterKey: keyof FilterState, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: checked,
    }))
  }

  const clearFilters = () => {
    setFilters({
      anestesia: false,
      multiplos: false,
      incremento: false,
      auxiliar: false,
    })
    setSearchTerm("")
  }

  const hasActiveFilters = Object.values(filters).some(Boolean) || searchTerm.trim() !== ""
  const activeFiltersCount = Object.values(filters).filter(Boolean).length

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando histórico...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="sm" className="cursor-pointer">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Histórico de Cálculos</h1>
            <p className="text-muted-foreground">
              {filteredHistory.length} de {history.length} {history.length === 1 ? "cálculo" : "cálculos"}
              {hasActiveFilters && " (filtrado)"}
            </p>
          </div>
        </div>

        {history.length > 0 && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="cursor-pointer">
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Histórico
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Confirmar Exclusão
                </DialogTitle>
                <DialogDescription className="text-left">
                  Tem certeza que deseja limpar todo o histórico de cálculos?
                  <br />
                  <br />
                  <span className="font-medium text-red-600">
                    Esta ação não pode ser desfeita e todos os {history.length}{" "}
                    {history.length === 1 ? "cálculo será removido" : "cálculos serão removidos"} permanentemente.
                  </span>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="cursor-pointer">
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={handleClearHistory} className="cursor-pointer">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Sim, Limpar Histórico
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Barra de busca e filtros */}
      {history.length > 0 && (
        <Card>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Barra de busca */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Botão de filtros */}
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="relative cursor-pointer">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtros
                      {activeFiltersCount > 0 && (
                        <Badge
                          variant="secondary"
                          className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                        >
                          {activeFiltersCount}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64" align="end">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm mb-3">Filtrar por:</h4>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="filter-anestesia"
                              checked={filters.anestesia}
                              onCheckedChange={(checked) => handleFilterChange("anestesia", checked as boolean)}
                            />
                            <Label htmlFor="filter-anestesia" className="flex items-center gap-2 cursor-pointer">
                              <Badge variant="default" className="text-xs bg-blue-500 hover:bg-blue-600">
                                <Syringe className="h-3 w-3 mr-1" />
                                Anestesia
                              </Badge>
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="filter-incremento"
                              checked={filters.incremento}
                              onCheckedChange={(checked) => handleFilterChange("incremento", checked as boolean)}
                            />
                            <Label htmlFor="filter-incremento" className="flex items-center gap-2 cursor-pointer">
                              <Badge
                                variant="secondary"
                                className="text-xs bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                              >
                                <Percent className="h-3 w-3 mr-1" />
                                Incremento
                              </Badge>
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="filter-multiplos"
                              checked={filters.multiplos}
                              onCheckedChange={(checked) => handleFilterChange("multiplos", checked as boolean)}
                            />
                            <Label htmlFor="filter-multiplos" className="flex items-center gap-2 cursor-pointer">
                              <Badge
                                variant="outline"
                                className="text-xs bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                              >
                                <List className="h-3 w-3 mr-1" />
                                Múltiplos
                              </Badge>
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="filter-auxiliar"
                              checked={filters.auxiliar}
                              onCheckedChange={(checked) => handleFilterChange("auxiliar", checked as boolean)}
                            />
                            <Label htmlFor="filter-auxiliar" className="flex items-center gap-2 cursor-pointer">
                              <Badge className="text-xs bg-purple-100 text-purple-800 hover:bg-purple-200">
                                <Users className="h-3 w-3 mr-1" />
                                Auxiliar
                              </Badge>
                            </Label>
                          </div>
                        </div>
                      </div>

                      {hasActiveFilters && (
                        <>
                          <Separator />
                          <Button variant="outline" size="sm" onClick={clearFilters} className="w-full cursor-pointer">
                            <X className="h-4 w-4 mr-2" />
                            Limpar Filtros
                          </Button>
                        </>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Filtros ativos */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                <span className="text-sm text-muted-foreground">Filtros ativos:</span>
                {searchTerm.trim() && (
                  <Badge variant="outline" className="bg-gray-50">
                    <Search className="h-3 w-3 mr-1" />
                    &quot;{searchTerm}&quot;
                  </Badge>
                )}
                {filters.anestesia && (
                  <Badge className="bg-blue-500 hover:bg-blue-600">
                    <Syringe className="h-3 w-3 mr-1" />
                    Anestesia
                  </Badge>
                )}
                {filters.incremento && (
                  <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                    <Percent className="h-3 w-3 mr-1" />
                    Incremento
                  </Badge>
                )}
                {filters.multiplos && (
                  <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
                    <List className="h-3 w-3 mr-1" />
                    Múltiplos
                  </Badge>
                )}
                {filters.auxiliar && (
                  <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                    <Users className="h-3 w-3 mr-1" />
                    Auxiliar
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {history.length === 0 ? (
        <Alert>
          <Calculator className="h-4 w-4" />
          <AlertDescription>
            Nenhum cálculo foi realizado ainda. Faça seu primeiro cálculo para ver o histórico aqui.
          </AlertDescription>
        </Alert>
      ) : filteredHistory.length === 0 ? (
        <Alert>
          <Search className="h-4 w-4" />
          <AlertDescription>
            Nenhum resultado encontrado para os filtros aplicados. Tente ajustar os critérios de busca.
          </AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Histórico de Cálculos
            </CardTitle>
            <CardDescription>Clique em um item para ver os detalhes completos do cálculo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Accordion type="single" collapsible className="w-full">
              {filteredHistory.map((result, index) => {
                // Calcular valor dos auxiliares 2º ao 5º
                const valorAuxiliares2ao5 =
                  result.valorSegundoAuxiliar +
                  result.valorTerceiroAuxiliar +
                  result.valorQuartoAuxiliar +
                  result.valorQuintoAuxiliar

                return (
                  <AccordionItem
                    key={`${result.timestamp}-${index}`}
                    value={`item-${index}`}
                    className="border rounded-md mb-4 overflow-hidden"
                  >
                    <AccordionTrigger className="hover:no-underline px-4 py-3 bg-gray-50 cursor-pointer">
                      <div className="flex items-center justify-between w-full mr-4">
                        <div className="flex items-center gap-3">
                          <ClipboardList className="h-4 w-4" />
                          <div className="text-left">
                            <p className="font-medium">Código: {result.codigo}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDateTime(result.timestamp)} • {formatCurrency(result.valorTotalProcedimento)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {result.anestesistaEnabled && (
                            <Badge className="text-xs bg-blue-500 hover:bg-blue-600">
                              <Syringe className="h-3 w-3 mr-1" />
                              Anestesia
                            </Badge>
                          )}
                          {result.incremento > 0 && (
                            <Badge className="text-xs bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                              {result.incremento.toFixed(1)}%
                            </Badge>
                          )}
                          {result.multiplosProcedimentos && (
                            <Badge className="text-xs bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
                              <List className="h-3 w-3 mr-1" />
                              Múltiplos
                            </Badge>
                          )}
                          {result.quantidadeAuxiliares > 0 && (
                            <Badge className="text-xs bg-purple-100 text-purple-800 hover:bg-purple-200">
                              <Users className="h-3 w-3 mr-1" />
                              {Math.round(result.quantidadeAuxiliares)} Aux
                            </Badge>
                          )}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 pt-5 border-t">
                      {/* Botão de exportar */}
                      <div className="flex justify-end mb-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            exportToPDF(result)
                          }}
                          className="bg-blue-50 hover:bg-blue-100 border-blue-200 cursor-pointer"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Imprimir / Salvar PDF
                        </Button>
                      </div>

                      {/* Detalhes de cada linha - só para múltiplos procedimentos */}
                      {result.multiplosProcedimentos &&
                        result.linhasCalculadas &&
                        result.linhasCalculadas.length > 0 && (
                          <div className="space-y-4 mb-6">
                            <h4 className="font-medium text-sm flex items-center gap-2">
                              <List className="h-4 w-4" />
                              Detalhes por Linha ({result.linhasCalculadas.length})
                            </h4>
                            <div className="space-y-3">
                              {result.linhasCalculadas.map((linha, linhaIndex) => (
                                <div
                                  key={linhaIndex}
                                  className="bg-gray-50 p-4 rounded border text-sm border-l-4 border-l-blue-500"
                                >
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">
                                        Linha {linha.linha}
                                      </Badge>
                                      <Badge variant="secondary" className="text-xs">
                                        {linha.porcentagem}% do SH
                                      </Badge>
                                    </div>
                                    <span className="font-medium text-green-600">
                                      {formatCurrency(linha.valorTotalLinha)}
                                    </span>
                                  </div>

                                  <div className="space-y-2 mb-3">
                                    <p className="font-medium">{linha.codigo}</p>
                                    <p className="text-muted-foreground text-xs">{linha.descricao}</p>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Coluna 1: Informações básicas */}
                                    <div className="space-y-2">
                                      <h5 className="font-medium text-xs">Informações do Procedimento</h5>
                                      <div className="space-y-1 text-xs">
                                        <div className="flex justify-between">
                                          <span>
                                            <strong>Quantidade de Pontos:</strong>
                                          </span>
                                          <span>{linha.quantidadePontos}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>
                                            <strong>Valor Incremento:</strong>
                                          </span>
                                          <span>{linha.incremento}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>
                                            <strong>Valor SH:</strong>
                                          </span>
                                          <span>{formatCurrency(linha.valorSH)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>
                                            <strong>Valor TSP:</strong>
                                          </span>
                                          <span>{formatCurrency(linha.valorTSP)}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Coluna 2: Valores dos profissionais */}
                                    <div className="space-y-2">
                                      <h5 className="font-medium text-xs">Valores dos Profissionais</h5>
                                      <div className="space-y-1 text-xs">
                                        <div className="flex justify-between">
                                          <span>
                                            <strong>Valor Anestesia:</strong>
                                          </span>
                                          <span>
                                            {linha.anestesistaEnabled
                                              ? formatCurrency(linha.valorAnestesista)
                                              : "R$ 0,00"}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>
                                            <strong>Valor Cirurgião:</strong>
                                          </span>
                                          <span>{formatCurrency(linha.valorCirurgiao)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>
                                            <strong>Valor 1º Auxiliar:</strong>
                                          </span>
                                          <span>{formatCurrency(linha.valorPrimeiroAuxiliar)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>
                                            <strong>Valor Auxiliares 2º ao 5º:</strong>
                                          </span>
                                          <span>
                                            {formatCurrency(
                                              linha.valorSegundoAuxiliar +
                                                linha.valorTerceiroAuxiliar +
                                                linha.valorQuartoAuxiliar +
                                                linha.valorQuintoAuxiliar,
                                            )}
                                          </span>
                                        </div>
                                        <div className="flex justify-between border-t pt-1">
                                          <span>
                                            <strong>Valor Total SP:</strong>
                                          </span>
                                          <span>{formatCurrency(linha.valorSP)}</span>
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
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Múltiplos Procedimentos - resumo */}
                      {result.multiplosProcedimentos && result.procedimentos && result.procedimentos.length > 0 && (
                        <div className="space-y-2 mb-4">
                          <h4 className="font-medium text-sm flex items-center gap-2">
                            <List className="h-4 w-4" />
                            Resumo - Procedimentos ({result.procedimentos.length})
                          </h4>
                          <div className="bg-blue-50 border border-blue-200 rounded p-2 text-sm">
                            <p className="text-blue-800">
                              <strong>Procedimento Principal:</strong> {result.procedimentoPrincipal}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Valores totais em duas colunas */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        {/* Coluna 1: Informações básicas */}
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Totais do Procedimento</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>
                                <strong>Código Principal:</strong>
                              </span>
                              <span>{result.codigo}</span>
                            </div>
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
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Totais dos Profissionais</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>
                                <strong>Valor Total Anestesia:</strong>
                              </span>
                              <span>
                                {result.anestesistaEnabled ? formatCurrency(result.valorAnestesista) : "R$ 0,00"}
                              </span>
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
                            <div className="flex justify-between border-t pt-1">
                              <span>
                                <strong>Total Pontos:</strong>
                              </span>
                              <span>{Math.round(result.totalPontos)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Valor Total do Procedimento - Alinhado à direita */}
                      <div className="flex justify-end mb-2">
                        <div className="text-right">
                          <p className="text-sm font-semibold mb-1">Valor Total do Procedimento:</p>
                          <p className="text-xl font-bold text-green-600">
                            {formatCurrency(result.valorTotalProcedimento)}
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
