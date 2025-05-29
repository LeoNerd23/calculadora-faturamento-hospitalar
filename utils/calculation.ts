import type { MedicalFeeInput, MedicalFeeResult } from "@/types/calculation"

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
  // Converter valores de string para número
  const valorSP = currencyToNumber(data.valorSP)
  const valorSH = currencyToNumber(data.valorSH)
  const quantidadePontos = Number.parseInt(data.quantidadePontos) || 0
  const quantidadeAuxiliares = Number.parseInt(data.quantidadeAuxiliares) || 0
  const incremento = data.incremento ? Number.parseInt(data.incremento) : 0

  // Cálculo do valor do anestesista (30% do valor SP)
  const valorAnestesista = valorSP * 0.3

  // Cálculo do valor de rateio
  const valorRateio = valorSP - valorAnestesista

  // Cálculo dos pontos acumulados por profissional
  const pontosCirurgiao = quantidadePontos // 100%
  const pontosPrimeiroAuxiliar = quantidadeAuxiliares >= 1 ? quantidadePontos * 0.3 : 0 // 30%
  const pontosSegundoAuxiliar = quantidadeAuxiliares >= 2 ? quantidadePontos * 0.2 : 0 // 20%

  // Total de pontos
  const totalPontos = pontosCirurgiao + pontosPrimeiroAuxiliar + pontosSegundoAuxiliar

  // Valor do ponto
  const valorPonto = totalPontos > 0 ? valorRateio / totalPontos : 0

  // Cálculo dos valores por profissional
  const valorCirurgiao = pontosCirurgiao * valorPonto
  const valorPrimeiroAuxiliar = pontosPrimeiroAuxiliar * valorPonto
  const valorSegundoAuxiliar = pontosSegundoAuxiliar * valorPonto

  return {
    codigo: data.codigo,
    quantidadePontos,
    valorSP,
    valorSH,
    incremento,
    quantidadeAuxiliares,
    valorAnestesista,
    valorRateio,
    valorPonto,
    valorCirurgiao,
    valorPrimeiroAuxiliar,
    valorSegundoAuxiliar,
    totalPontos,
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
