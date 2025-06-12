import type { MedicalFeeInput, MedicalFeeResult, LinhaCalculada } from "@/types/calculation"
import { PROCEDIMENTOS_DATABASE } from "@/data/procedimentos"

// Função para converter string de moeda brasileira para número
export const currencyToNumber = (value: string): number => {
  if (!value) return 0
  return Number(value.replace(/[^\d,]/g, "").replace(",", ".")) || 0
}

// Função para formatar número como moeda brasileira
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

// Função principal de cálculo
export const calculateMedicalFees = (data: MedicalFeeInput): MedicalFeeResult => {
  // Verificar se é múltiplos procedimentos
  if (data.multiplosProcedimentos && data.procedimentos && data.procedimentos.length > 0) {
    return calculateMultiplesProcedimentos(data)
  }

  // Cálculo para procedimento único
  // Converter valores de string para número
  const valorSP = currencyToNumber(data.valorSP)
  const valorSH = currencyToNumber(data.valorSH)
  const valorTSP = currencyToNumber(data.valorTSP)
  const quantidadePontos = Number.parseInt(data.quantidadePontos) || 0
  const quantidadeAuxiliares = Number.parseInt(data.quantidadeAuxiliares) || 0
  const incremento = data.incremento ? Number.parseInt(data.incremento) : 0
  const anestesistaEnabled = data.anestesistaEnabled || false
  const descricao = data.descricao || ""

  // Aplicar incremento no valor SH (conforme especificação)
  const valorSHComIncremento = incremento > 0 ? valorSH * (1 + incremento / 100) : valorSH

  // Aplicar incremento no valor SP
  const valorSPComIncremento = incremento > 0 ? valorSP * (1 + incremento / 100) : valorSP

  // Cálculo do valor do anestesista (30% do valor SP com incremento) se habilitado
  const valorAnestesista = anestesistaEnabled ? valorSPComIncremento * 0.3 : 0

  // Cálculo do valor de rateio (SP com incremento menos anestesista)
  const valorRateio = valorSPComIncremento - valorAnestesista

  // Cálculo dos pontos acumulados por profissional
  const pontosCirurgiao = quantidadePontos // 100%
  const pontosPrimeiroAuxiliar = quantidadeAuxiliares >= 1 ? quantidadePontos * 0.3 : 0 // 30%
  const pontosSegundoAuxiliar = quantidadeAuxiliares >= 2 ? quantidadePontos * 0.2 : 0 // 20%
  const pontosTerceiroAuxiliar = quantidadeAuxiliares >= 3 ? quantidadePontos * 0.2 : 0 // 20%
  const pontosQuartoAuxiliar = quantidadeAuxiliares >= 4 ? quantidadePontos * 0.2 : 0 // 20%
  const pontosQuintoAuxiliar = quantidadeAuxiliares >= 5 ? quantidadePontos * 0.2 : 0 // 20%

  // Total de pontos
  const totalPontos =
    pontosCirurgiao +
    pontosPrimeiroAuxiliar +
    pontosSegundoAuxiliar +
    pontosTerceiroAuxiliar +
    pontosQuartoAuxiliar +
    pontosQuintoAuxiliar

  // Valor do ponto
  const valorPonto = totalPontos > 0 ? valorRateio / totalPontos : 0

  // Cálculo dos valores por profissional
  const valorCirurgiao = pontosCirurgiao * valorPonto
  const valorPrimeiroAuxiliar = pontosPrimeiroAuxiliar * valorPonto
  const valorSegundoAuxiliar = pontosSegundoAuxiliar * valorPonto
  const valorTerceiroAuxiliar = pontosTerceiroAuxiliar * valorPonto
  const valorQuartoAuxiliar = pontosQuartoAuxiliar * valorPonto
  const valorQuintoAuxiliar = pontosQuintoAuxiliar * valorPonto

  // Valor total do procedimento (SH com incremento + TSP + SP com incremento)
  const valorTotalProcedimento = valorSHComIncremento + valorTSP + valorSPComIncremento

  return {
    codigo: data.codigo,
    descricao: data.descricao,
    quantidadePontos,
    valorSP: valorSPComIncremento,
    valorSH: valorSHComIncremento,
    valorTSP,
    incremento,
    quantidadeAuxiliares,
    valorAnestesista,
    valorRateio,
    valorPonto,
    valorCirurgiao,
    valorPrimeiroAuxiliar,
    valorSegundoAuxiliar,
    valorTerceiroAuxiliar,
    valorQuartoAuxiliar,
    valorQuintoAuxiliar,
    totalPontos,
    valorTotalProcedimento,
    anestesistaEnabled,
    multiplosProcedimentos: false,
    timestamp: Date.now(),
  }
}

// Função para calcular múltiplos procedimentos
const calculateMultiplesProcedimentos = (data: MedicalFeeInput): MedicalFeeResult => {
  const procedimentoPrincipal = data.procedimentoPrincipal || ""
  const procedimentos = data.procedimentos || []

  // Obter porcentagens do procedimento principal
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

  // Inicializar valores totais
  let valorSPTotal = 0
  let valorSHTotal = 0
  let valorTSPTotal = 0
  let valorAnestesistaTotal = 0
  let valorCirurgiaoTotal = 0
  let valorPrimeiroAuxiliarTotal = 0
  let valorSegundoAuxiliarTotal = 0
  let valorTerceiroAuxiliarTotal = 0
  let valorQuartoAuxiliarTotal = 0
  let valorQuintoAuxiliarTotal = 0
  let totalPontosTotal = 0

  // Array para armazenar os cálculos de cada linha
  const linhasCalculadas: LinhaCalculada[] = []

  // Calcular valores para cada procedimento
  procedimentos.forEach((proc, index) => {
    // Converter valores de string para número
    const valorSP = currencyToNumber(proc.valorSP)
    const valorSH = currencyToNumber(proc.valorSH)
    const valorTSP = currencyToNumber(proc.valorTSP)
    const quantidadePontos = Number.parseInt(proc.quantidadePontos) || 0
    const quantidadeAuxiliares = Number.parseInt(proc.quantidadeAuxiliares) || 0
    const incremento = proc.incrementoEnabled && proc.incremento ? Number.parseInt(proc.incremento) : 0
    const anestesistaEnabled = proc.anestesistaEnabled || false

    // Aplicar porcentagem do procedimento principal ao valor SH (CORREÇÃO AQUI)
    const porcentagemSH = porcentagens.length > index ? porcentagens[index] / 100 : 1
    const valorSHBase = valorSH * porcentagemSH

    // Aplicar incremento no valor SH
    const valorSHComIncremento = incremento > 0 ? valorSHBase * (1 + incremento / 100) : valorSHBase

    // Aplicar incremento no valor SP (sem porcentagem - SP sempre 100%)
    const valorSPComIncremento = incremento > 0 ? valorSP * (1 + incremento / 100) : valorSP

    // Cálculo do valor do anestesista (30% do valor SP com incremento) se habilitado
    const valorAnestesista = anestesistaEnabled ? valorSPComIncremento * 0.3 : 0

    // Cálculo do valor de rateio (SP com incremento menos anestesista)
    const valorRateio = valorSPComIncremento - valorAnestesista

    // Cálculo dos pontos acumulados por profissional
    const pontosCirurgiao = quantidadePontos // 100%
    const pontosPrimeiroAuxiliar = quantidadeAuxiliares >= 1 ? quantidadePontos * 0.3 : 0 // 30%
    const pontosSegundoAuxiliar = quantidadeAuxiliares >= 2 ? quantidadePontos * 0.2 : 0 // 20%
    const pontosTerceiroAuxiliar = quantidadeAuxiliares >= 3 ? quantidadePontos * 0.2 : 0 // 20%
    const pontosQuartoAuxiliar = quantidadeAuxiliares >= 4 ? quantidadePontos * 0.2 : 0 // 20%
    const pontosQuintoAuxiliar = quantidadeAuxiliares >= 5 ? quantidadePontos * 0.2 : 0 // 20%

    // Total de pontos para este procedimento
    const totalPontos =
      pontosCirurgiao +
      pontosPrimeiroAuxiliar +
      pontosSegundoAuxiliar +
      pontosTerceiroAuxiliar +
      pontosQuartoAuxiliar +
      pontosQuintoAuxiliar

    // Valor do ponto para este procedimento
    const valorPonto = totalPontos > 0 ? valorRateio / totalPontos : 0

    // Cálculo dos valores por profissional para este procedimento
    const valorCirurgiao = pontosCirurgiao * valorPonto
    const valorPrimeiroAuxiliar = pontosPrimeiroAuxiliar * valorPonto
    const valorSegundoAuxiliar = pontosSegundoAuxiliar * valorPonto
    const valorTerceiroAuxiliar = pontosTerceiroAuxiliar * valorPonto
    const valorQuartoAuxiliar = pontosQuartoAuxiliar * valorPonto
    const valorQuintoAuxiliar = pontosQuintoAuxiliar * valorPonto

    // Valor total desta linha
    const valorTotalLinha = valorSHComIncremento + valorTSP + valorSPComIncremento

    // Adicionar cálculo desta linha ao array
    linhasCalculadas.push({
      linha: index + 1,
      codigo: proc.codigo,
      descricao: proc.descricao,
      porcentagem: porcentagens.length > index ? porcentagens[index] : 100,
      quantidadePontos,
      valorSP: valorSPComIncremento,
      valorSH: valorSHComIncremento,
      valorTSP,
      incremento,
      quantidadeAuxiliares,
      valorAnestesista,
      valorCirurgiao,
      valorPrimeiroAuxiliar,
      valorSegundoAuxiliar,
      valorTerceiroAuxiliar,
      valorQuartoAuxiliar,
      valorQuintoAuxiliar,
      valorTotalLinha,
      anestesistaEnabled,
    })

    // Somar aos totais
    valorSPTotal += valorSPComIncremento
    valorSHTotal += valorSHComIncremento
    valorTSPTotal += valorTSP
    valorAnestesistaTotal += valorAnestesista
    valorCirurgiaoTotal += valorCirurgiao
    valorPrimeiroAuxiliarTotal += valorPrimeiroAuxiliar
    valorSegundoAuxiliarTotal += valorSegundoAuxiliar
    valorTerceiroAuxiliarTotal += valorTerceiroAuxiliar
    valorQuartoAuxiliarTotal += valorQuartoAuxiliar
    valorQuintoAuxiliarTotal += valorQuintoAuxiliar
    totalPontosTotal += totalPontos
  })

  // Valor total do procedimento (SH total + TSP total + SP total)
  const valorTotalProcedimento = valorSHTotal + valorTSPTotal + valorSPTotal

  // Calcular valores médios para exibição
  const quantidadeProcedimentos = procedimentos.length
  const quantidadePontosMedia = quantidadeProcedimentos > 0 ? totalPontosTotal / quantidadeProcedimentos : 0
  const incrementoMedio =
    procedimentos.reduce((acc, proc) => {
      const incremento = proc.incrementoEnabled && proc.incremento ? Number.parseInt(proc.incremento) : 0
      return acc + incremento
    }, 0) / quantidadeProcedimentos
  const quantidadeAuxiliaresMedio =
    procedimentos.reduce((acc, proc) => {
      return acc + (Number.parseInt(proc.quantidadeAuxiliares) || 0)
    }, 0) / quantidadeProcedimentos
  const anestesistaEnabled = procedimentos.some((proc) => proc.anestesistaEnabled)

  return {
    codigo: procedimentoPrincipal,
    descricao: procedimentoDb?.descricao || "",
    quantidadePontos: quantidadePontosMedia,
    valorSP: valorSPTotal,
    valorSH: valorSHTotal,
    valorTSP: valorTSPTotal,
    incremento: incrementoMedio,
    quantidadeAuxiliares: quantidadeAuxiliaresMedio,
    valorAnestesista: valorAnestesistaTotal,
    valorRateio: valorSPTotal - valorAnestesistaTotal,
    valorPonto: totalPontosTotal > 0 ? (valorSPTotal - valorAnestesistaTotal) / totalPontosTotal : 0,
    valorCirurgiao: valorCirurgiaoTotal,
    valorPrimeiroAuxiliar: valorPrimeiroAuxiliarTotal,
    valorSegundoAuxiliar: valorSegundoAuxiliarTotal,
    valorTerceiroAuxiliar: valorTerceiroAuxiliarTotal,
    valorQuartoAuxiliar: valorQuartoAuxiliarTotal,
    valorQuintoAuxiliar: valorQuintoAuxiliarTotal,
    totalPontos: totalPontosTotal,
    valorTotalProcedimento,
    anestesistaEnabled,
    multiplosProcedimentos: true,
    procedimentos,
    linhasCalculadas,
    procedimentoPrincipal,
    timestamp: Date.now(),
  }
}

// Funções para gerenciar o histórico no localStorage
export const saveCalculationToHistory = (result: MedicalFeeResult): void => {
  try {
    const history = getCalculationHistory()
    history.unshift(result) // Adiciona o novo cálculo no início do array
    localStorage.setItem("medicalFeesHistory", JSON.stringify(history))
  } catch (error) {
    console.error("Erro ao salvar no histórico:", error)
  }
}

export const getCalculationHistory = (): MedicalFeeResult[] => {
  try {
    const history = localStorage.getItem("medicalFeesHistory")
    return history ? JSON.parse(history) : []
  } catch (error) {
    console.error("Erro ao recuperar histórico:", error)
    return []
  }
}

export const clearCalculationHistory = (): void => {
  try {
    localStorage.removeItem("medicalFeesHistory")
  } catch (error) {
    console.error("Erro ao limpar histórico:", error)
  }
}
