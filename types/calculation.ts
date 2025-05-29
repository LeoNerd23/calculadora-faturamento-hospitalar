export interface MedicalFeeInput {
    codigo: string
    quantidadePontos: string
    valorSP: string
    valorSH: string
    incremento: string
    quantidadeAuxiliares: string
  }
  
  export interface MedicalFeeResult {
    codigo: string
    quantidadePontos: number
    valorSP: number
    valorSH: number
    incremento: number
    quantidadeAuxiliares: number
    valorAnestesista: number
    valorRateio: number
    valorPonto: number
    valorCirurgiao: number
    valorPrimeiroAuxiliar: number
    valorSegundoAuxiliar: number
    totalPontos: number
    timestamp: number
  }
  