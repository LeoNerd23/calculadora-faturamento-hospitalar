export interface MedicalFeeInput {
  codigo: string
  quantidadePontos: string
  valorSP: string
  valorSH: string
  valorTSP: string
  incremento: string
  quantidadeAuxiliares: string
  anestesistaEnabled?: boolean
}

export interface MedicalFeeResult {
  codigo: string
  quantidadePontos: number
  valorSP: number
  valorSH: number
  valorTSP: number
  incremento: number
  quantidadeAuxiliares: number
  valorAnestesista: number
  valorRateio: number
  valorPonto: number
  valorCirurgiao: number
  valorPrimeiroAuxiliar: number
  valorSegundoAuxiliar: number
  valorTerceiroAuxiliar: number
  valorQuartoAuxiliar: number
  valorQuintoAuxiliar: number
  totalPontos: number
  valorTotalProcedimento: number
  anestesistaEnabled: boolean
  timestamp: number
}
