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
        
        .lines-section {
          background: #f0f9ff;
          border: 1px solid #bfdbfe;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        
        .lines-section h3 {
          color: #1e40af;
          font-size: 13px;
          margin-bottom: 15px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .line-item {
          background: white;
          border: 1px solid #e0e7ff;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 10px;
          border-left: 4px solid #3b82f6;
        }
        
        .line-item:last-child {
          margin-bottom: 0;
        }
        
        .line-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        
        .line-badges {
          display: flex;
          gap: 6px;
          align-items: center;
        }
        
        .line-badge {
          background: #3b82f6;
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 500;
        }
        
        .line-percent {
          background: #f3f4f6;
          color: #374151;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 10px;
        }
        
        .line-total {
          font-weight: 600;
          color: #059669;
          font-size: 12px;
        }
        
        .line-code {
          font-weight: 600;
          font-size: 11px;
          margin-bottom: 3px;
        }
        
        .line-desc {
          color: #6b7280;
          font-size: 10px;
          line-height: 1.3;
          margin-bottom: 8px;
        }
        
        .line-values {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          font-size: 10px;
        }
        
        .line-values-left, .line-values-right {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        
        .line-value-item {
          display: flex;
          justify-content: space-between;
        }
        
        .line-config-badges {
          display: flex;
          gap: 4px;
          margin-top: 8px;
          flex-wrap: wrap;
        }
        
        .config-badge {
          padding: 2px 6px;
          border-radius: 10px;
          font-size: 9px;
          font-weight: 500;
        }
        
        .config-badge-anestesia {
          background: #3b82f6;
          color: white;
        }
        
        .config-badge-incremento {
          background: #fef3c7;
          color: #92400e;
        }
        
        .config-badge-auxiliar {
          background: #f3e8ff;
          color: #7c3aed;
        }
        
        .procedures-section {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        
        .procedures-section h3 {
          color: #166534;
          font-size: 13px;
          margin-bottom: 10px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 5px;
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
        result.multiplosProcedimentos && result.linhasCalculadas && result.linhasCalculadas.length > 0
          ? `
      <div class='lines-section'>
        <h3>📋 Detalhes por Linha (${result.linhasCalculadas.length})</h3>
        ${result.linhasCalculadas
          .map(
            (linha) => `
        <div class='line-item'>
          <div class='line-header'>
            <div class='line-badges'>
              <span class='line-badge'>Linha ${linha.linha}</span>
              <span class='line-percent'>${linha.porcentagem}% do valor SH</span>
            </div>
            <span class='line-total'>${formatCurrency(linha.valorTotalLinha)}</span>
          </div>
          <div class='line-code'>${linha.codigo}</div>
          <div class='line-desc'>${linha.descricao ? `Descrição: ${linha.descricao}` : ""}</div>
          
          <div style='display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 10px;'>
            <!-- Coluna 1: Informações básicas -->
            <div>
              <h5 style='font-weight: 600; font-size: 10px; margin-bottom: 8px; color: #374151;'>Informações do Procedimento</h5>
              <div style='display: flex; flex-direction: column; gap: 3px; font-size: 9px;'>
                <div style='display: flex; justify-content: space-between;'>
                  <span><strong>Quantidade de Pontos:</strong></span>
                  <span>${linha.quantidadePontos}</span>
                </div>
                <div style='display: flex; justify-content: space-between;'>
                  <span><strong>Valor Incremento:</strong></span>
                  <span>${linha.incremento}%</span>
                </div>
                <div style='display: flex; justify-content: space-between;'>
                  <span><strong>Valor SH:</strong></span>
                  <span>${formatCurrency(linha.valorSH)}</span>
                </div>
                <div style='display: flex; justify-content: space-between;'>
                  <span><strong>Valor TSP:</strong></span>
                  <span>${formatCurrency(linha.valorTSP)}</span>
                </div>
              </div>
            </div>
            
            <!-- Coluna 2: Valores dos profissionais -->
            <div>
              <h5 style='font-weight: 600; font-size: 10px; margin-bottom: 8px; color: #374151;'>Valores dos Profissionais</h5>
              <div style='display: flex; flex-direction: column; gap: 3px; font-size: 9px;'>
              <div style='display: flex; justify-content: space-between;'>
                  <span><strong>Valor Anestesia:</strong></span>
                  <span>${linha.anestesistaEnabled ? formatCurrency(linha.valorAnestesista) : "R$ 0,00"}</span>
                </div>
                <div style='display: flex; justify-content: space-between;'>
                  <span><strong>Valor Cirurgião:</strong></span>
                  <span>${formatCurrency(linha.valorCirurgiao)}</span>
                </div>
                ${
                  linha.quantidadeAuxiliares >= 1
                    ? `<div style='display: flex; justify-content: space-between;'>
                  <span><strong>Valor 1º Auxiliar:</strong></span>
                  <span>${formatCurrency(linha.valorPrimeiroAuxiliar)}</span>
                </div>`
                    : ""
                }
                ${
                  linha.quantidadeAuxiliares >= 2
                    ? `<div style='display: flex; justify-content: space-between;'>
                  <span><strong>Valor Auxiliares 2º ao 5º:</strong></span>
                  <span>${formatCurrency(
                    linha.valorSegundoAuxiliar +
                      linha.valorTerceiroAuxiliar +
                      linha.valorQuartoAuxiliar +
                      linha.valorQuintoAuxiliar,
                  )}</span>
                </div>`
                    : ""
                }
                <div style='display: flex; justify-content: space-between; border-top: 1px solid #d1d5db; padding-top: 3px; margin-top: 3px; font-weight: 600;'>
                  <span><strong>Valor Total SP:</strong></span>
                  <span>${formatCurrency(linha.valorSP)}</span>
                </div>
              </div>
            </div>
          </div>
          
          ${
            linha.anestesistaEnabled || linha.incremento > 0 || linha.quantidadeAuxiliares > 0
              ? `<div class='line-config-badges'>
            ${linha.anestesistaEnabled ? `<span class='config-badge config-badge-anestesia'>💉 Anestesia</span>` : ""}
            ${
              linha.incremento > 0
                ? `<span class='config-badge config-badge-incremento'>% ${linha.incremento}%</span>`
                : ""
            }
            ${
              linha.quantidadeAuxiliares > 0
                ? `<span class='config-badge config-badge-auxiliar'>👥 ${linha.quantidadeAuxiliares} Aux</span>`
                : ""
            }
          </div>`
              : ""
          }
        </div>
        `,
          )
          .join("")}
      </div>
      `
          : ""
      }

      ${
        result.multiplosProcedimentos && result.procedimentoPrincipal
          ? `
      <div class='procedures-section'>
        <h3>📝 Resumo - Múltiplos Procedimentos</h3>
        <p><strong>Procedimento Principal:</strong> ${result.procedimentoPrincipal}</p>
        <p style='font-size: 10px; color: #6b7280; margin-top: 5px;'>O valor SH irá varias de acordo com o percentual aplicado em cada linha e serão determinadas pelo procedimento principal selecionado.</p>
      </div>
      `
          : ""
      }

      <div class='grid-2'>
        <div class='info-group'>
          <div class='section-title'>Totais do Procedimento</div>
          <div class='info-line'>
            <span><strong>Código Principal:</strong></span>
            <span>${result.codigo} ${result.descricao ? `- ${result.descricao}` : ""}</span>
          </div>
          <div class='info-line'>
            <span><strong>Valor Total SH:</strong></span>
            <span>${formatCurrency(result.valorSH)}</span>
          </div>
          <div class='info-line'>
            <span><strong>Valor Total TSP:</strong></span>
            <span>${formatCurrency(result.valorTSP)}</span>
          </div>
          <div class='info-line'>
            <span><strong>Valor Total SP:</strong></span>
            <span>${formatCurrency(result.valorSP)}</span>
          </div>
        </div>
        
        <div class='info-group'>
          <div class='section-title'>Totais dos Profissionais</div>
           <div class='info-line'>
            <span><strong>Valor Total Anestesia:</strong></span>
            <span>${result.anestesistaEnabled ? formatCurrency(result.valorAnestesista) : "R$ 0,00"}</span>
          </div>
          <div class='info-line'>
            <span><strong>Total Cirurgião:</strong></span>
            <span>${formatCurrency(result.valorCirurgiao)}</span>
          </div>
          ${
            result.quantidadeAuxiliares >= 1
              ? `
          <div class='info-line'>
            <span><strong>Total 1º Auxiliar:</strong></span>
            <span>${formatCurrency(result.valorPrimeiroAuxiliar)}</span>
          </div>
          `
              : ""
          }
          ${
            result.quantidadeAuxiliares >= 2
              ? `
          <div class='info-line'>
            <span><strong>Total Auxiliares 2º ao 5º:</strong></span>
            <span>${formatCurrency(valorAuxiliares2ao5)}</span>
          </div>
          `
              : ""
          }
          <div class='info-line highlight'>
            <span><strong>Total Pontos:</strong></span>
            <span>${Math.round(result.totalPontos)}</span>
          </div>
        </div>
      </div>

       <div class='total-section'>
        <h2>💰 VALOR TOTAL DO PROCEDIMENTO</h2>
        <div class='total-value'>${formatCurrency(result.valorTotalProcedimento)}</div>
        <div class='total-description'>
          SH + TSP + SP ${result.anestesistaEnabled ? " + Anestesia" : ""}
        </div>
      </div>

       ${
        hasConfigurations
          ? `
      <div class='badges-section' style="margin-top: 20px;">
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
            Incremento ${result.incremento.toFixed(1)}%
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
            ${Math.round(result.quantidadeAuxiliares)} ${Math.round(result.quantidadeAuxiliares) === 1 ? "Auxiliar" : "Auxiliares"}
          </span>
          `
              : ""
          }
        </div>
      </div>
      `
          : ""
      }

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
