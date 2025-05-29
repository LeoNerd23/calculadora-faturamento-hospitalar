import type { MedicalFeeResult } from "@/types/calculation"
import { formatCurrency } from "@/utils/calculation"

// Função para exportar cálculo para PDF
export const exportToPDF = async (calculation: MedicalFeeResult) => {
  try {
    // Criar o conteúdo HTML para o PDF
    const date = new Date(calculation.timestamp)
    const formattedDate = date.toLocaleDateString("pt-BR") + " " + date.toLocaleTimeString("pt-BR")

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório de Honorários Médicos</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            line-height: 1.6;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
          }
          .section { 
            margin-bottom: 25px; 
          }
          .section-title { 
            font-size: 16px; 
            font-weight: bold; 
            margin-bottom: 10px;
            color: #333;
            border-left: 4px solid #007bff;
            padding-left: 10px;
          }
          .data-row { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 8px;
            padding: 5px 0;
          }
          .data-row:nth-child(even) {
            background-color: #f8f9fa;
          }
          .label { 
            font-weight: bold; 
            width: 60%;
          }
          .value { 
            text-align: right;
            width: 40%;
          }
          .total-row {
            border-top: 2px solid #333;
            padding-top: 10px;
            margin-top: 10px;
            font-weight: bold;
            font-size: 14px;
          }
          .date-info {
            text-align: right;
            font-size: 12px;
            color: #666;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Relatório de Honorários Médicos</h1>
        </div>
        
        <div class="date-info">
          Gerado em: ${formattedDate}
        </div>

        <div class="section">
          <div class="section-title">Dados de Entrada</div>
          <div class="data-row">
            <span class="label">Código:</span>
            <span class="value">${calculation.codigo}</span>
          </div>
          <div class="data-row">
            <span class="label">Quantidade de Pontos:</span>
            <span class="value">${calculation.quantidadePontos}</span>
          </div>
          <div class="data-row">
            <span class="label">Valor SP:</span>
            <span class="value">${formatCurrency(calculation.valorSP)}</span>
          </div>
          <div class="data-row">
            <span class="label">Valor SH:</span>
            <span class="value">${formatCurrency(calculation.valorSH)}</span>
          </div>
          <div class="data-row">
            <span class="label">Quantidade de Auxiliares:</span>
            <span class="value">${calculation.quantidadeAuxiliares}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Resultados dos Cálculos</div>
          <div class="data-row">
            <span class="label">Valor Anestesista (30%):</span>
            <span class="value">${formatCurrency(calculation.valorAnestesista)}</span>
          </div>
          <div class="data-row">
            <span class="label">Valor Rateio:</span>
            <span class="value">${formatCurrency(calculation.valorRateio)}</span>
          </div>
          <div class="data-row">
            <span class="label">Total de Pontos:</span>
            <span class="value">${calculation.totalPontos}</span>
          </div>
          <div class="data-row">
            <span class="label">Valor do Ponto:</span>
            <span class="value">${formatCurrency(calculation.valorPonto)}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Distribuição de Valores</div>
          <div class="data-row">
            <span class="label">Valor Cirurgião:</span>
            <span class="value">${formatCurrency(calculation.valorCirurgiao)}</span>
          </div>
          <div class="data-row">
            <span class="label">Valor 1º Auxiliar:</span>
            <span class="value">${formatCurrency(calculation.valorPrimeiroAuxiliar)}</span>
          </div>
          <div class="data-row">
            <span class="label">Valor 2º Auxiliar:</span>
            <span class="value">${formatCurrency(calculation.valorSegundoAuxiliar)}</span>
          </div>
          <div class="data-row total-row">
            <span class="label">Total Valor SP:</span>
            <span class="value">${formatCurrency(calculation.valorSP)}</span>
          </div>
        </div>
      </body>
      </html>
    `

    // Criar um blob com o conteúdo HTML
    const blob = new Blob([htmlContent], { type: "text/html" })
    const url = URL.createObjectURL(blob)

    // Abrir em nova janela para impressão/salvamento como PDF
    const printWindow = window.open(url, "_blank")

    if (printWindow) {
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
          URL.revokeObjectURL(url)
        }, 250)
      }
    } else {
      // Fallback: download do arquivo HTML
      const link = document.createElement("a")
      link.href = url
      link.download = `honorarios-medicos-${calculation.codigo.replace(/\./g, "-")}-${date.toISOString().split("T")[0]}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  } catch (error) {
    console.error("Erro ao exportar PDF:", error)
    alert("Erro ao exportar PDF. Tente novamente.")
  }
}
