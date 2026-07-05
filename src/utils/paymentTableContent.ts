import type { Party, Property } from '../types/receipt'
import type { InstallmentStatusRow } from './installmentStatus'
import { getPaymentSummary } from './installmentStatus'
import {
  buildModernDocumentHeaderHtml,
  MODERN_HEADER_STYLES,
} from './documentHeaderContent'
import { formatCurrency, formatDateBR } from './formatters'
import { buildSignatureHtml, SIGNATURE_STYLES } from './signatureContent'

export interface PaymentTableDocument {
  seller: Party
  buyer: Party
  property: Property
  rows: InstallmentStatusRow[]
  summary: ReturnType<typeof getPaymentSummary>
}

export function createPaymentTableDocument(
  seller: Party,
  buyer: Party,
  property: Property,
  rows: InstallmentStatusRow[],
  summaryRows: InstallmentStatusRow[] = rows,
): PaymentTableDocument {
  return {
    seller,
    buyer,
    property,
    rows,
    summary: getPaymentSummary(summaryRows),
  }
}

function statusLabel(status: string): string {
  return status === 'pago' ? 'Pago' : 'Pendente'
}

function buildTableRowsHtml(rows: InstallmentStatusRow[]): string {
  return rows
    .map((row, index) => {
      const isPaid = row.status === 'pago'
      const bg = index % 2 === 0 ? '#ffffff' : '#f8fafc'
      const statusBg = isPaid ? '#dcfce7' : '#fef3c7'
      const statusColor = isPaid ? '#15803d' : '#b45309'

      return `<tr style="background:${bg};">
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#1e293b;">
          ${String(row.number).padStart(2, '0')} / ${row.totalInstallments}
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#334155;">${row.monthLabel}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#475569;">${formatDateBR(row.dueDate)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#1e293b;">${formatCurrency(row.value)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:center;">
          <span style="display:inline-block;padding:4px 12px;border-radius:999px;background:${statusBg};color:${statusColor};font-size:11px;font-weight:700;letter-spacing:0.3px;">
            ${statusLabel(row.status)}
          </span>
        </td>
      </tr>`
    })
    .join('')
}

export function buildPaymentTableHtml(doc: PaymentTableDocument): string {
  const { seller, buyer, property, rows, summary } = doc

  const headerHtml = buildModernDocumentHeaderHtml({
    title: 'TABELA DE PAGAMENTO',
    subtitle: `Contrato de compra e venda · ${property.installmentCount} parcelas`,
    seller: { name: seller.name, cpf: seller.cpf },
    buyer: { name: buyer.name, cpf: buyer.cpf },
    property: {
      location: property.location,
      totalValue: formatCurrency(property.totalValue),
      installmentCount: property.installmentCount,
      installmentValue: formatCurrency(property.installmentValue),
    },
    paymentSummary: {
      paidTotal: summary.paidTotalFormatted,
      pendingTotal: summary.pendingTotalFormatted,
    },
  })

  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head>
<meta charset="utf-8">
<title>Tabela de Pagamento</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; margin: 0; padding: 32px; background: #f1f5f9; }
  .page { max-width: 920px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 50px rgba(15,23,42,0.12); }
  ${MODERN_HEADER_STYLES}
  .content { padding: 24px 28px 40px; }
  table.data { width: 100%; border-collapse: collapse; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
  table.data thead th { background: #4338ca; color: #fff; padding: 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; text-align: left; }
  table.data thead th:last-child { text-align: center; }
  .summary { display: flex; gap: 16px; margin-top: 20px; flex-wrap: wrap; }
  .summary-box { flex: 1; min-width: 180px; border-radius: 12px; padding: 14px 16px; border: 1px solid #e2e8f0; }
  .summary-box.paid { background: #f0fdf4; border-color: #bbf7d0; }
  .summary-box.pending { background: #fffbeb; border-color: #fde68a; }
  .summary-box .label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.8px; color: #64748b; font-weight: 700; }
  .summary-box .value { font-size: 18px; font-weight: 700; margin-top: 4px; }
  ${SIGNATURE_STYLES}
</style>
</head>
<body>
  <div class="page">
    ${headerHtml}
    <div class="content">
      <table class="data">
        <thead>
          <tr>
            <th>Parcela</th>
            <th>Referência</th>
            <th>Vencimento</th>
            <th>Valor</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${buildTableRowsHtml(rows)}
        </tbody>
      </table>

      <div class="summary">
        <div class="summary-box paid">
          <div class="label">Parcelas pagas</div>
          <div class="value" style="color:#15803d;">${summary.paidCount} — ${summary.paidTotalFormatted}</div>
        </div>
        <div class="summary-box pending">
          <div class="label">Parcelas pendentes</div>
          <div class="value" style="color:#b45309;">${summary.pendingCount} — ${summary.pendingTotalFormatted}</div>
        </div>
      </div>

      ${buildSignatureHtml()}
    </div>
  </div>
</body>
</html>`
}

export const PAYMENT_TABLE_FILENAME = 'Tabela_de_Pagamento'
