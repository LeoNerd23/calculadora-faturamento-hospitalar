export interface MedicalFeeInput {
  codigo: string
  quantidadePontos: string
  valorSP: string
  valorSH: string
  valorTSP: string
  incremento: string
  quantidadeAuxiliares: string
  anestesistaEnabled?: boolean
  multiplosProcedimentos?: boolean
  procedimentos?: ProcedimentoSelecionado[]
}

export interface ProcedimentoSelecionado {
  id: string
  codigo: string
  descricao: string
  porcentagens: number[]
  auxiliares: number
}

export interface ProcedimentoDatabase {
  codigo: string
  descricao: string
  linha1: number
  linha2: number
  linha3: number
  linha4: number
  linha5: number
  auxiliares: number
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
  multiplosProcedimentos?: boolean
  procedimentos?: ProcedimentoSelecionado[]
  timestamp: number
}
