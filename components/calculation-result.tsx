import type { MedicalFeeResult } from "@/types/calculation"
import { formatCurrency } from "@/utils/calculation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CalculationResultProps {
  result: MedicalFeeResult | null
}

export default function CalculationResult({ result }: CalculationResultProps) {
  if (!result) return null

  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <CardTitle>Resultado do Cálculo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Código:</span>
              <span>{result.codigo}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Quantidade de Pontos:</span>
              <span>{result.quantidadePontos}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Valor Anestesista:</span>
              <span>{formatCurrency(result.valorAnestesista)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Valor Cirurgião:</span>
              <span>{formatCurrency(result.valorCirurgiao)}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Valor 1º Auxiliar:</span>
              <span>{formatCurrency(result.valorPrimeiroAuxiliar)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Valor 2º Auxiliar:</span>
              <span>{formatCurrency(result.valorSegundoAuxiliar)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Total Valor SP:</span>
              <span>{formatCurrency(result.valorSP)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Valor SH:</span>
              <span>{formatCurrency(result.valorSH)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
