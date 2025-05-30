import type { MedicalFeeResult } from "@/types/calculation"
import { formatCurrency } from "@/utils/calculation"

/**
 * Exporta o cálculo de honorários médicos para PDF com layout profissional
 */
export const exportToPDF = async (calculation: MedicalFeeResult) => {
  try {
    const date = new Date(calculation.timestamp)
    const formattedDate = date.toLocaleDateString("pt-BR") + " " + date.toLocaleTimeString("pt-BR")

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório de Honorários Médicos - ${calculation.codigo}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
            background: #fff;
            padding: 20px;
          }
          
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: #fff;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
          }
          
          .header {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 20px;
            text-align: center;
            border-bottom: 2px solid #dee2e6;
          }
          
          .logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 15px;
            display: block;
          }
          
          .header h1 {
            font-size: 18px;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 5px;
          }
          
          .header-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #dee2e6;
          }
          
          .codigo-info {
            display: flex;
            align-items: center;
            font-weight: 600;
            color: #495057;
          }
          
          .codigo-icon {
            width: 16px;
            height: 16px;
            margin-right: 8px;
            background: #007bff;
            border-radius: 2px;
            display: inline-block;
          }
          
          .timestamp {
            font-size: 11px;
            color: #6c757d;
          }
          
          .content {
            padding: 25px;
          }
          
          .data-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 25px;
          }
          
          .data-column {
            background: #f8f9fa;
            border-radius: 6px;
            padding: 15px;
          }
          
          .data-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
          }
          
          .data-row:last-child {
            border-bottom: none;
          }
          
          .data-label {
            font-weight: 500;
            color: #495057;
            font-size: 11px;
          }
          
          .data-value {
            font-weight: 600;
            color: #212529;
            text-align: right;
            font-size: 12px;
          }
          
          .currency {
            color: #28a745;
          }
          
          .percentage {
            color: #17a2b8;
          }
          
          .total-section {
            background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
            border-radius: 8px;
            padding: 20px;
            margin-top: 20px;
            border: 1px solid #bbdefb;
          }
          
          .total-title {
            font-size: 14px;
            font-weight: 600;
            color: #1565c0;
            margin-bottom: 15px;
            text-align: center;
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #e1f5fe;
          }
          
          .total-row:last-child {
            border-bottom: 2px solid #1565c0;
            font-weight: 700;
            font-size: 13px;
            margin-top: 10px;
            padding-top: 15px;
          }
          
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            text-align: center;
            font-size: 10px;
            color: #6c757d;
          }
          
          @media print {
            body {
              padding: 0;
            }
            .container {
              border: none;
              border-radius: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Cálculo de Procedimentos Hospitalares</h1>
            
            <div class="header-info">
              <div class="codigo-info">
                Código: ${calculation.codigo}
              </div>
              <div class="timestamp">
                ${formattedDate}
              </div>
            </div>
          </div>
          
          <div class="content">
            <div class="data-grid">
              <div class="data-column">
                <div class="data-row">
                  <span class="data-label">Código:</span>
                  <span class="data-value">${calculation.codigo}</span>
                </div>
                <div class="data-row">
                  <span class="data-label">Incremento (%):</span>
                  <span class="data-value percentage">${((calculation.valorSP / (calculation.quantidadePontos * calculation.valorPonto) - 1) * 100).toFixed(0)}%</span>
                </div>
                <div class="data-row">
                  <span class="data-label">Valor SH:</span>
                  <span class="data-value currency">${formatCurrency(calculation.valorSH)}</span>
                </div>
                <div class="data-row">
                  <span class="data-label">Valor TSP:</span>
                  <span class="data-value currency">${formatCurrency(calculation.valorPonto * calculation.quantidadePontos)}</span>
                </div>
                <div class="data-row">
                  <span class="data-label">Valor Anestesista:</span>
                  <span class="data-value currency">${formatCurrency(calculation.valorAnestesista)}</span>
                </div>
              </div>
              
              <div class="data-column">
                <div class="data-row">
                  <span class="data-label">Valor Cirurgião:</span>
                  <span class="data-value currency">${formatCurrency(calculation.valorCirurgiao)}</span>
                </div>
                <div class="data-row">
                  <span class="data-label">Valor 1º Auxiliar:</span>
                  <span class="data-value currency">${formatCurrency(calculation.valorPrimeiroAuxiliar)}</span>
                </div>
                <div class="data-row">
                  <span class="data-label">Valor 2º ao 5º Auxiliar:</span>
                  <span class="data-value currency">${formatCurrency(calculation.valorSegundoAuxiliar)}</span>
                </div>
                <div class="data-row">
                  <span class="data-label">Valor Total SP:</span>
                  <span class="data-value currency">${formatCurrency(calculation.valorSP)}</span>
                </div>
                <div class="data-row">
                  <span class="data-label">Valor Total do procedimento:</span>
                  <span class="data-value currency">${formatCurrency(calculation.valorSP)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <p>Relatório gerado automaticamente pelo sistema DATTRA</p>
            <p>Este documento é válido apenas para fins informativos</p>
          </div>
        </div>
      </body>
      </html>
    `

    // Criar blob e abrir para impressão
    const blob = new Blob([htmlContent], { type: "text/html" })
    const url = URL.createObjectURL(blob)

    const printWindow = window.open(url, "_blank")

    if (printWindow) {
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
          URL.revokeObjectURL(url)
        }, 500)
      }
    } else {
      // Fallback: download do arquivo HTML
      const link = document.createElement("a")
      link.href = url
      link.download = `relatorio-honorarios-${calculation.codigo.replace(/\./g, "-")}-${date.toISOString().split("T")[0]}.html`
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
