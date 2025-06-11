import type { MedicalFeeResult } from "@/types/calculation"
import { formatCurrency } from "./calculation"

export const exportToPDF = (result: MedicalFeeResult) => {
  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Calcular valor total dos auxiliares
  const valorTotalAuxiliares =
    result.valorPrimeiroAuxiliar +
    result.valorSegundoAuxiliar +
    result.valorTerceiroAuxiliar +
    result.valorQuartoAuxiliar +
    result.valorQuintoAuxiliar

  // Calcular valor dos auxiliares 2º ao 5º
  const valorAuxiliares2ao5 =
    result.valorSegundoAuxiliar + result.valorTerceiroAuxiliar + result.valorQuartoAuxiliar + result.valorQuintoAuxiliar

  // Verificar se há configurações ativas
  const hasConfigurations =
    result.anestesistaEnabled ||
    result.incremento > 0 ||
    result.multiplosProcedimentos ||
    result.quantidadeAuxiliares > 0

  const htmlContent = `
    <!DOCTYPE html>
    <html lang='pt-BR'>
    <head>
      <meta charset='UTF-8'>
      <meta name='viewport' content='width=device-width, initial-scale=1.0'>
      <title>Cálculo Hospitalar - ${result.codigo}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', sans-serif;
          font-size: 12px;
          line-height: 1.4;
          color: #333;
          max-width: 210mm;
          margin: 0 auto;
          padding: 15mm;
          background: white;
        }
        
        .header {
          text-align: center;
          margin-bottom: 25px;
          border-bottom: 2px solid #2563eb;
          padding-bottom: 15px;
        }
        
        .header h1 {
          color: #1e40af;
          font-size: 20px;
          margin-bottom: 8px;
          font-weight: bold;
        }
        
        .header .subtitle {
          color: #6b7280;
          font-size: 11px;
        }
        
        .section {
          margin-bottom: 20px;
        }
        
        .section-title {
          color: #374151;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 12px;
          padding-bottom: 5px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .info-group {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          padding: 15px;
          border-radius: 8px;
        }
        
        .info-line {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 12px;
          align-items: center;
        }
        
        .info-line:last-child {
          margin-bottom: 0;
        }
        
        .info-line strong {
          color: #111827;
          font-weight: 600;
        }
        
        .info-line.highlight {
          border-top: 1px solid #d1d5db;
          padding-top: 8px;
          margin-top: 8px;
          font-weight: 600;
        }
        
        .procedures-section {
          background: #f0f9ff;
          border: 1px solid #bfdbfe;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        
        .procedures-section h3 {
          color: #1e40af;
          font-size: 13px;
          margin-bottom: 10px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .procedure-item {
          background: white;
          border: 1px solid #e0e7ff;
          padding: 10px;
          border-radius: 6px;
          margin-bottom: 8px;
        }
        
        .procedure-item:last-child {
          margin-bottom: 0;
        }
        
        .procedure-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 5px;
        }
        
        .procedure-line {
          background: #3b82f6;
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 500;
        }
        
        .procedure-percent {
          background: #f3f4f6;
          color: #374151;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 10px;
        }
        
        .procedure-code {
          font-weight: 600;
          font-size: 11px;
          margin-bottom: 3px;
        }
        
        .procedure-desc {
          color: #6b7280;
          font-size: 10px;
          line-height: 1.3;
        }
        
        .badges-section {
          margin-bottom: 20px;
        }
        
        .badges-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 8px;
        }
        
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 16px;
          font-size: 11px;
          font-weight: 500;
        }
        
        .badge-anestesia {
          background: #3b82f6;
          color: white;
        }
        
        .badge-incremento {
          background: #fef3c7;
          color: #92400e;
          border: 1px solid #f59e0b;
        }
        
        .badge-multiplos {
          background: #f0fdf4;
          color: #166534;
          border: 1px solid #22c55e;
        }
        
        .badge-auxiliar {
          background: #f3e8ff;
          color: #7c3aed;
          border: 1px solid #a855f7;
        }
        
        .icon {
          width: 12px;
          height: 12px;
          display: inline-block;
        }
        
        .total-section {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border: 2px solid #22c55e;
          padding: 20px;
          border-radius: 12px;
          text-align: center;
          margin-top: 20px;
        }
        
        .total-section h2 {
          color: #166534;
          font-size: 16px;
          margin-bottom: 10px;
          font-weight: 600;
        }
        
        .total-value {
          font-size: 28px;
          font-weight: bold;
          color: #059669;
          margin-bottom: 8px;
        }
        
        .total-description {
          color: #374151;
          font-size: 11px;
        }
        
        .footer {
          margin-top: 25px;
          text-align: center;
          color: #6b7280;
          font-size: 10px;
          border-top: 1px solid #e5e7eb;
          padding-top: 15px;
        }
        
        @media print {
          body {
            padding: 10mm;
            font-size: 11px;
          }
          
          .header h1 {
            font-size: 18px;
          }
          
          .total-value {
            font-size: 24px;
          }
        }
      </style>
    </head>
    <body>
      <div class='header'>
        <h1>CÁLCULO DE PROCEDIMENTOS HOSPITALARES</h1>
        <div class='subtitle'>
          <strong>DATTRA</strong> • Relatório gerado em: ${formatDateTime(Date.now())}
        </div>
      </div>

      ${
        result.multiplosProcedimentos && result.procedimentos && result.procedimentos.length > 0
          ? `
      <div class='procedures-section'>
        <h3>📝 Múltiplos Procedimentos (${result.procedimentos.length})</h3>
        ${result.procedimentos
          .map(
            (proc, index) => `
        <div class='procedure-item'>
          <div class='procedure-header'>
            <span class='procedure-line'>Linha ${index + 1}</span>
            ${
              proc.porcentagens.length > index
                ? `<span class='procedure-percent'>${proc.porcentagens[index]}% do valor SP</span>`
                : ""
            }
          </div>
          <div class='procedure-code'>${proc.codigo}</div>
          <div class='procedure-desc'>${proc.descricao}</div>
          ${proc.auxiliares > 0 ? `<div class='procedure-desc'><strong>Auxiliares sugeridos:</strong> ${proc.auxiliares}</div>` : ""}
        </div>
        `,
          )
          .join("")}
      </div>
      `
          : ""
      }

      <div class='grid-2'>
        <div class='info-group'>
          <div class='section-title'>Informações do Procedimento</div>
          <div class='info-line'>
            <span><strong>Código:</strong></span>
            <span>${result.codigo}</span>
          </div>
          <div class='info-line'>
            <span><strong>Valor Incremento:</strong></span>
            <span>${result.incremento}%</span>
          </div>
          <div class='info-line'>
            <span><strong>Valor SH:</strong></span>
            <span>${formatCurrency(result.valorSH)}</span>
          </div>
          <div class='info-line'>
            <span><strong>Valor TSP:</strong></span>
            <span>${formatCurrency(result.valorTSP)}</span>
          </div>
          <div class='info-line'>
            <span><strong>Valor Anestesia:</strong></span>
            <span>${result.anestesistaEnabled ? formatCurrency(result.valorAnestesista) : "R$ 0,00"}</span>
          </div>
        </div>
        
        <div class='info-group'>
          <div class='section-title'>Valores dos Profissionais</div>
          <div class='info-line'>
            <span><strong>Valor Cirurgião:</strong></span>
            <span>${formatCurrency(result.valorCirurgiao)}</span>
          </div>
          ${
            result.quantidadeAuxiliares >= 1
              ? `
          <div class='info-line'>
            <span><strong>Valor 1º Auxiliar:</strong></span>
            <span>${formatCurrency(result.valorPrimeiroAuxiliar)}</span>
          </div>
          `
              : ""
          }
          ${
            result.quantidadeAuxiliares >= 2
              ? `
          <div class='info-line'>
            <span><strong>Valor Auxiliares 2º ao 5º:</strong></span>
            <span>${formatCurrency(valorAuxiliares2ao5)}</span>
          </div>
          `
              : ""
          }
          <div class='info-line highlight'>
            <span><strong>Valor Total SP:</strong></span>
            <span>${formatCurrency(result.valorSP)}</span>
          </div>
        </div>
      </div>

      ${
        hasConfigurations
          ? `
      <div class='badges-section'>
        <div class='section-title'>Configurações Ativas</div>
        <div class='badges-container'>
          ${
            result.anestesistaEnabled
              ? `
          <span class='badge badge-anestesia'>
            <span class='icon'>💉</span>
            Anestesia
          </span>
          `
              : ""
          }
          ${
            result.incremento > 0
              ? `
          <span class='badge badge-incremento'>
            <span class='icon'>%</span>
            Incremento ${result.incremento}%
          </span>
          `
              : ""
          }
          ${
            result.multiplosProcedimentos
              ? `
          <span class='badge badge-multiplos'>
            <span class='icon'>📋</span>
            Múltiplos Procedimentos
          </span>
          `
              : ""
          }
          ${
            result.quantidadeAuxiliares > 0
              ? `
          <span class='badge badge-auxiliar'>
            <span class='icon'>👥</span>
            ${result.quantidadeAuxiliares} ${result.quantidadeAuxiliares === 1 ? "Auxiliar" : "Auxiliares"}
          </span>
          `
              : ""
          }
        </div>
      </div>
      `
          : ""
      }

      <div class='total-section'>
        <h2>💰 VALOR TOTAL DO PROCEDIMENTO</h2>
        <div class='total-value'>${formatCurrency(result.valorTotalProcedimento)}</div>
        <div class='total-description'>
          SH + TSP + SP${result.incremento > 0 ? ` (com incremento de ${result.incremento}%)` : ""}${result.anestesistaEnabled ? " + Anestesia" : ""}
        </div>
      </div>

      <div class='footer'>
        <strong>DATTRA - Sistema de Cálculo de Procedimentos Hospitalares</strong><br>
        Cálculo realizado em: ${formatDateTime(result.timestamp)}
      </div>
    </body>
    </html>
  `

  // Criar uma nova janela para impressão
  const printWindow = window.open("", "_blank", "width=800,height=600")
  if (printWindow) {
    printWindow.document.write(htmlContent)
    printWindow.document.close()

    // Aguardar o carregamento e abrir a janela de impressão
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print()
        // Opcional: fechar a janela após a impressão
        printWindow.onafterprint = () => {
          printWindow.close()
        }
      }, 250)
    }
  } else {
    alert("Por favor, permita pop-ups para exportar o PDF")
  }
}
