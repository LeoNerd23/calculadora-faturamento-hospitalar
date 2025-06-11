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
  procedimentoPrincipal?: string
}

export interface ProcedimentoSelecionado {
  id: string
  codigo: string
  descricao: string
  porcentagens: number[]
  auxiliaresSugeridos: number // Renomeado de 'auxiliares' para evitar conflito
  quantidadePontos: string
  valorSP: string
  valorSH: string
  valorTSP: string
  incremento: string
  quantidadeAuxiliares: string
  anestesistaEnabled: boolean
  incrementoEnabled: boolean
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

export interface LinhaCalculada {
  linha: number
  codigo: string
  descricao: string
  porcentagem: number
  quantidadePontos: number
  valorSP: number
  valorSH: number
  valorTSP: number
  incremento: number
  quantidadeAuxiliares: number
  valorAnestesista: number
  valorCirurgiao: number
  valorPrimeiroAuxiliar: number
  valorSegundoAuxiliar: number
  valorTerceiroAuxiliar: number
  valorQuartoAuxiliar: number
  valorQuintoAuxiliar: number
  valorTotalLinha: number
  anestesistaEnabled: boolean
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
  linhasCalculadas?: LinhaCalculada[]
  timestamp: number
  procedimentoPrincipal?: string
}

export interface MultiplosProcedimentosProps {
  procedimentos: ProcedimentoSelecionado[]
  onChange: (procedimentos: ProcedimentoSelecionado[]) => void
  procedimentoPrincipal?: string
  errors?: { [key: string]: string }
  formSubmitted?: boolean
  onClearError?: (fieldName: string) => void
}
