import type { MedicalFeeResult } from "@/types/calculation";
import { formatCurrency } from "@/utils/calculation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileUser } from "lucide-react";

interface CalculationResultProps {
  result: MedicalFeeResult | null;
}

export default function CalculationResult({ result }: CalculationResultProps) {
  if (!result) return null;

  // Somar valores do 2º ao 5º auxiliar
  const valorSegundoAoQuintoAuxiliar =
    result.valorSegundoAuxiliar +
    result.valorTerceiroAuxiliar +
    result.valorQuartoAuxiliar +
    result.valorQuintoAuxiliar;

  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileUser />
          Resultado do Cálculo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Código:</span>
              <span>{result.codigo}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Valor Incremento (%):</span>
              <span>{result.incremento}%</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Valor SH:</span>
              <span>{formatCurrency(result.valorSH)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Valor TSP:</span>
              <span>{formatCurrency(result.valorTSP)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Valor Anestesista:</span>
              <span>{formatCurrency(result.valorAnestesista)}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Valor Cirurgião:</span>
              <span>{formatCurrency(result.valorCirurgiao)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Valor 1º Auxiliar:</span>
              <span>{formatCurrency(result.valorPrimeiroAuxiliar)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Valor 2º ao 5º Auxiliar:</span>
              <span>{formatCurrency(valorSegundoAoQuintoAuxiliar)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Total Valor SP:</span>
              <span>{formatCurrency(result.valorSP)}</span>
            </div>
          </div>
            <div>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-bold">Valor Total do Procedimento:</span>
              <span className="font-bold">
                {formatCurrency(result.valorTotalProcedimento)}
              </span>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
